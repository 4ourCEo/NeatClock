import { createHmac, timingSafeEqual } from 'node:crypto';
import { createBusinessStore, hashOrderProof } from './businessStore.js';

export const BUSINESS_PRODUCT = Object.freeze({ productId: 'neatclock.business-calendar-qr', version: '1.0.0', currency: 'usd', deliveryType: 'business_calendar_share_and_qr' });

function settings(env) {
  const secretKey = env.STRIPE_SECRET_KEY || '';
  const entitlementSecret = env.NEATCLOCK_ENTITLEMENT_SECRET || '';
  const webhookSecret = env.NEATCLOCK_STRIPE_WEBHOOK_SECRET || '';
  const amountMinor = Number(env.NEATCLOCK_BUSINESS_PRICE_CENTS);
  const environmentKeySafe = env.VERCEL_ENV === 'preview' ? secretKey.startsWith('sk_test_')
    : env.VERCEL_ENV === 'production' ? secretKey.startsWith('sk_live_') : /^sk_(test|live)_/.test(secretKey);
  const durableReady = Boolean(env.NEATCLOCK_SUPABASE_URL && env.NEATCLOCK_SUPABASE_SERVICE_ROLE_KEY && env.NEATCLOCK_SUPABASE_PUBLISHABLE_KEY);
  const verificationReady = Boolean(secretKey) && entitlementSecret.length >= 32 && environmentKeySafe && durableReady;
  return { secretKey, entitlementSecret, webhookSecret, amountMinor, verificationReady, enabled: env.NEATCLOCK_BUSINESS_CHECKOUT_ENABLED === 'true' && Number.isSafeInteger(amountMinor) && amountMinor > 0 && verificationReady };
}

function send(res, status, body) { res.setHeader?.('Cache-Control', 'no-store'); return res.status(status).json(body); }
function originFor(req) {
  const host = req.headers?.host; if (!host) return null;
  const expected = `${host.startsWith('localhost:') || host.startsWith('127.0.0.1:') ? 'http' : 'https'}://${host}`;
  try { if (req.headers.origin && new URL(req.headers.origin).origin !== expected) return null; } catch { return null; }
  return expected;
}
const validOrderReference = (v) => typeof v === 'string' && /^[a-zA-Z0-9_-]{16,80}$/.test(v);
const validProof = (v) => typeof v === 'string' && /^[a-zA-Z0-9_-]{32,128}$/.test(v);
const validBusinessId = (v) => typeof v === 'string' && /^[0-9a-f-]{16,64}$/i.test(v);
function validArtifactUrl(value, origin) {
  try { const url = new URL(value); return value.length <= 4096 && url.origin === origin && ['hvac-business', 'plumbing-business'].includes(url.searchParams.get('preset')) && validBusinessId(url.searchParams.get('business_id')); } catch { return false; }
}
async function stripeSession(sessionId, secretKey, fetchImpl) {
  const response = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: { Authorization: `Bearer ${secretKey}` } });
  if (!response.ok) throw new Error('stripe_session_unavailable'); return response.json();
}
function sessionMatches(session) {
  return session.mode === 'payment' && session.status === 'complete' && session.payment_status === 'paid'
    && session.metadata?.amount_minor === String(session.amount_total) && session.currency === BUSINESS_PRODUCT.currency
    && session.client_reference_id === session.metadata?.order_reference && session.metadata?.product_id === BUSINESS_PRODUCT.productId
    && session.metadata?.product_version === BUSINESS_PRODUCT.version && session.metadata?.delivery_type === BUSINESS_PRODUCT.deliveryType
    && ['hvac', 'plumbing'].includes(session.metadata?.industry);
}
function signedEntitlement(purchase, env) {
  const payload = { productId: purchase.product_id, productVersion: purchase.product_version, checkoutSessionId: purchase.checkout_session_id, orderReference: purchase.order_reference, industry: purchase.industry, authorizedRecipient: purchase.purchaser_email, amountMinor: purchase.amount_minor, currency: purchase.currency, verifiedPaymentEvent: purchase.stripe_event_id, issuedAt: Math.floor(Date.now() / 1000), usageLimit: null, artifactUrl: purchase.artifact_url };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', env.NEATCLOCK_ENTITLEMENT_SECRET).update(encoded).digest('base64url');
  return { token: `${encoded}.${signature}`, claims: payload };
}
function verifiedEntitlementClaims(token, secret) {
  const [encoded, signature, extra] = String(token || '').split('.');
  if (!encoded || !signature || extra) return null;
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  try {
    const a = Buffer.from(signature); const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch { return null; }
}
function fulfillmentResponse(purchase, env) {
  return { product: BUSINESS_PRODUCT, checkout: { paymentProvider: 'stripe', checkoutSessionId: purchase.checkout_session_id, orderReference: purchase.order_reference }, payment: { verified: true, amountMinor: purchase.amount_minor, currency: purchase.currency }, entitlement: signedEntitlement(purchase, env), fulfillment: { deliveryReference: purchase.artifact_url, status: 'ready', idempotencyKey: `${BUSINESS_PRODUCT.productId}:${purchase.checkout_session_id}:artifact` } };
}

export async function businessCheckout(req, res, { env = process.env, fetchImpl = fetch, store } = {}) {
  const cfg = settings(env);
  if (req.method === 'GET') return send(res, 200, { product: BUSINESS_PRODUCT, available: cfg.enabled, ...(cfg.enabled ? { price: { amountMinor: cfg.amountMinor, currency: BUSINESS_PRODUCT.currency } } : {}) });
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (!cfg.enabled) return send(res, 503, { error: 'checkout_unavailable' });
  const origin = originFor(req); if (!origin) return send(res, 403, { error: 'origin_not_allowed' });
  const { orderReference, industry, orderProof, artifactUrl, businessId } = req.body || {};
  if (!validOrderReference(orderReference) || !['hvac', 'plumbing'].includes(industry) || !validProof(orderProof) || !validBusinessId(businessId) || !validArtifactUrl(artifactUrl, origin)) return send(res, 400, { error: 'invalid_checkout_request' });
  const durable = store || createBusinessStore(env, fetchImpl);
  try { await durable.createPending({ order_reference: orderReference, product_id: BUSINESS_PRODUCT.productId, product_version: BUSINESS_PRODUCT.version, industry, amount_minor: cfg.amountMinor, currency: BUSINESS_PRODUCT.currency, artifact_url: artifactUrl, business_id: businessId, order_proof_hash: hashOrderProof(orderProof) }); } catch { return send(res, 503, { error: 'durable_checkout_unavailable' }); }

  const fields = new URLSearchParams();
  fields.set('mode', 'payment'); fields.set('customer_creation', 'always');
  fields.set('line_items[0][price_data][currency]', BUSINESS_PRODUCT.currency); fields.set('line_items[0][price_data][unit_amount]', String(cfg.amountMinor));
  fields.set('line_items[0][price_data][product_data][name]', 'NeatClock Business calendar and QR license'); fields.set('line_items[0][price_data][product_data][description]', 'A business-branded HVAC or plumbing customer-care calendar, share link, and downloadable QR code.'); fields.set('line_items[0][quantity]', '1'); fields.set('client_reference_id', orderReference);
  for (const [key, value] of Object.entries({ product_id: BUSINESS_PRODUCT.productId, product_version: BUSINESS_PRODUCT.version, delivery_type: BUSINESS_PRODUCT.deliveryType, order_reference: orderReference, industry, amount_minor: String(cfg.amountMinor) })) fields.set(`metadata[${key}]`, value);
  fields.set('success_url', `${origin}/?page=partner&purchase=complete&session_id={CHECKOUT_SESSION_ID}`); fields.set('cancel_url', `${origin}/?page=partner&purchase=cancelled`);
  let response; try { response = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${cfg.secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': `${BUSINESS_PRODUCT.productId}:${orderReference}` }, body: fields.toString() }); } catch { return send(res, 502, { error: 'checkout_provider_unavailable' }); }
  if (!response.ok) return send(res, 502, { error: 'checkout_provider_rejected_request' });
  const session = await response.json(); let checkoutOrigin = ''; try { checkoutOrigin = new URL(session.url).origin; } catch { /* invalid */ }
  if (!session.id || checkoutOrigin !== 'https://checkout.stripe.com') return send(res, 502, { error: 'checkout_provider_invalid_response' });
  try { await durable.bindCheckout(orderReference, session.id); } catch { return send(res, 503, { error: 'checkout_persistence_failed' }); }
  return send(res, 200, { checkout: { paymentProvider: 'stripe', checkoutSessionId: session.id, orderReference, orderProof }, checkoutUrl: session.url });
}

export async function businessEntitlement(req, res, { env = process.env, fetchImpl = fetch, store } = {}) {
  if (req.method !== 'GET') return send(res, 405, { error: 'method_not_allowed' });
  const cfg = settings(env); if (!cfg.verificationReady) return send(res, 503, { error: 'entitlement_verification_unavailable' });
  const sessionId = new URL(req.url, `https://${req.headers?.host || 'localhost'}`).searchParams.get('session_id'); const proof = req.headers?.['x-neatclock-order-proof'];
  const bearer = (req.headers?.authorization || '').startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
  const tokenClaims = verifiedEntitlementClaims(bearer, cfg.entitlementSecret);
  const prefix = cfg.secretKey.startsWith('sk_test_') ? 'cs_test_' : 'cs_live_';
  if (!sessionId?.startsWith(prefix) || (!validProof(proof) && !tokenClaims)) return send(res, 400, { error: 'invalid_entitlement_request' });
  const durable = store || createBusinessStore(env, fetchImpl); let purchase;
  try { purchase = await durable.getReadyBySession(sessionId); } catch { return send(res, 503, { error: 'entitlement_verification_unavailable' }); }
  const proofMatches = validProof(proof) && purchase?.order_proof_hash === hashOrderProof(proof);
  const tokenMatches = tokenClaims && purchase && tokenClaims.checkoutSessionId === purchase.checkout_session_id && tokenClaims.orderReference === purchase.order_reference && tokenClaims.productId === purchase.product_id;
  if (!purchase || (!proofMatches && !tokenMatches)) return send(res, 404, { error: 'entitlement_not_found' });
  return send(res, 200, fulfillmentResponse(purchase, env));
}

export function verifyStripeSignature(rawBody, signatureHeader, secret, now = Date.now()) {
  if (!Buffer.isBuffer(rawBody) || !signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',').map((part) => part.split('=')); const timestamp = Number(parts.find(([k]) => k === 't')?.[1]); const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!timestamp || Math.abs(now / 1000 - timestamp) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
  return signatures.some((candidate) => { try { const a = Buffer.from(candidate, 'hex'); const b = Buffer.from(expected, 'hex'); return a.length === b.length && timingSafeEqual(a, b); } catch { return false; } });
}
export async function readRawBody(req) { const chunks = []; for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); return Buffer.concat(chunks); }

export async function businessWebhook(req, res, { env = process.env, fetchImpl = fetch, store, rawBody, now = Date.now() } = {}) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  const cfg = settings(env); if (!cfg.verificationReady || !cfg.webhookSecret.startsWith('whsec_')) return send(res, 503, { error: 'webhook_unavailable' });
  if (!verifyStripeSignature(rawBody, req.headers?.['stripe-signature'], cfg.webhookSecret, now)) return send(res, 400, { error: 'invalid_webhook_signature' });
  let event; try { event = JSON.parse(rawBody.toString('utf8')); } catch { return send(res, 400, { error: 'invalid_webhook_payload' }); }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) return send(res, 200, { received: true, outcome: 'ignored' });
  let session; try { session = await stripeSession(event.data?.object?.id, cfg.secretKey, fetchImpl); } catch { return send(res, 503, { error: 'payment_verification_unavailable' }); }
  if (!sessionMatches(session)) return send(res, 200, { received: true, outcome: 'not_paid_or_ineligible' });
  const durable = store || createBusinessStore(env, fetchImpl); let outcome; try { outcome = await durable.fulfill(event.id, event.created, session); } catch { return send(res, 503, { error: 'fulfillment_persistence_failed' }); }
  return send(res, 200, { received: true, outcome: outcome?.outcome || 'processed' });
}

export async function businessRecovery(req, res, { env = process.env, fetchImpl = fetch, store } = {}) {
  const cfg = settings(env); if (!cfg.verificationReady) return send(res, 503, { error: 'recovery_unavailable' });
  const origin = originFor(req); if (!origin) return send(res, 403, { error: 'origin_not_allowed' }); const durable = store || createBusinessStore(env, fetchImpl);
  if (req.method === 'POST') {
    const email = String(req.body?.email || '').trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return send(res, 400, { error: 'invalid_recovery_request' });
    try {
      const purchases = await durable.getReadyByEmail(email);
      if (purchases.length) await durable.requestRecovery(email, `${origin}/?page=partner&recovery=complete`);
    } catch { /* enumeration-safe */ }
    return send(res, 202, { accepted: true, message: 'If a matching purchase exists, a sign-in link will arrive shortly.' });
  }
  if (req.method === 'GET') {
    const authorization = req.headers?.authorization || ''; if (!authorization.startsWith('Bearer ')) return send(res, 401, { error: 'recovery_authentication_required' });
    const identity = await durable.verifiedIdentity(authorization.slice(7)); if (!identity) return send(res, 401, { error: 'recovery_authentication_required' });
    const purchases = await durable.getReadyByEmail(identity.email); if (!purchases.length) return send(res, 404, { error: 'purchase_not_found' });
    if (!await durable.consumeRecovery(identity)) return send(res, 410, { error: 'recovery_link_already_used' });
    return send(res, 200, { purchases: purchases.map((purchase) => fulfillmentResponse(purchase, env)) });
  }
  return send(res, 405, { error: 'method_not_allowed' });
}
