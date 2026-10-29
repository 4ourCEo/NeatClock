import { createHmac } from 'node:crypto';

export const BUSINESS_PRODUCT = Object.freeze({
  productId: 'neatclock.business-calendar-qr',
  version: '1.0.0',
  currency: 'usd',
  deliveryType: 'business_calendar_share_and_qr',
});

function verificationConfig(env) {
  const secretKey = env.STRIPE_SECRET_KEY || '';
  const entitlementSecret = env.NEATCLOCK_ENTITLEMENT_SECRET || '';
  const previewKeySafe = env.VERCEL_ENV !== 'preview' || secretKey.startsWith('sk_test_');
  return { secretKey, entitlementSecret, previewKeySafe, ready: Boolean(secretKey) && entitlementSecret.length >= 32 && previewKeySafe };
}

function config(env) {
  const amountMinor = Number(env.NEATCLOCK_BUSINESS_PRICE_CENTS);
  const verification = verificationConfig(env);
  const salesEnabled = env.NEATCLOCK_BUSINESS_CHECKOUT_ENABLED === 'true';
  const priceValid = Number.isSafeInteger(amountMinor) && amountMinor > 0;
  return { ...verification, amountMinor, enabled: salesEnabled && priceValid && verification.ready };
}

function send(res, status, body) {
  res.setHeader?.('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function originFor(req) {
  const host = req.headers?.host;
  if (!host) return null;
  const local = host.startsWith('localhost:') || host.startsWith('127.0.0.1:');
  const expected = `${local ? 'http' : 'https'}://${host}`;
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).origin !== expected) return null;
    } catch {
      return null;
    }
  }
  return expected;
}

function validOrderReference(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{16,80}$/.test(value);
}

export async function businessCheckout(req, res, { env = process.env, fetchImpl = fetch } = {}) {
  const settings = config(env);
  if (req.method === 'GET') {
    return send(res, 200, {
      product: BUSINESS_PRODUCT,
      available: settings.enabled,
      ...(settings.enabled ? { price: { amountMinor: settings.amountMinor, currency: BUSINESS_PRODUCT.currency } } : {}),
    });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (!settings.enabled) return send(res, 503, { error: 'checkout_unavailable' });
  const origin = originFor(req);
  if (!origin) return send(res, 403, { error: 'origin_not_allowed' });

  const { orderReference, industry } = req.body || {};
  if (!validOrderReference(orderReference) || !['hvac', 'plumbing'].includes(industry)) {
    return send(res, 400, { error: 'invalid_checkout_request' });
  }

  const fields = new URLSearchParams();
  fields.set('mode', 'payment');
  fields.append('payment_method_types[]', 'card');
  fields.set('line_items[0][price_data][currency]', BUSINESS_PRODUCT.currency);
  fields.set('line_items[0][price_data][unit_amount]', String(settings.amountMinor));
  fields.set('line_items[0][price_data][product_data][name]', 'NeatClock Business calendar and QR license');
  fields.set('line_items[0][price_data][product_data][description]', 'A business-branded HVAC or plumbing customer-care calendar, share link, and downloadable QR code.');
  fields.set('line_items[0][quantity]', '1');
  fields.set('client_reference_id', orderReference);
  fields.set('metadata[product_id]', BUSINESS_PRODUCT.productId);
  fields.set('metadata[product_version]', BUSINESS_PRODUCT.version);
  fields.set('metadata[delivery_type]', BUSINESS_PRODUCT.deliveryType);
  fields.set('metadata[order_reference]', orderReference);
  fields.set('metadata[industry]', industry);
  fields.set('metadata[amount_minor]', String(settings.amountMinor));
  fields.set('success_url', `${origin}/?page=partner&purchase=complete&session_id={CHECKOUT_SESSION_ID}`);
  fields.set('cancel_url', `${origin}/?page=partner&purchase=cancelled`);

  let response;
  try {
    response = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': `${BUSINESS_PRODUCT.productId}:${orderReference}`,
      },
      body: fields.toString(),
    });
  } catch {
    return send(res, 502, { error: 'checkout_provider_unavailable' });
  }
  if (!response.ok) return send(res, 502, { error: 'checkout_provider_rejected_request' });
  const session = await response.json();
  let checkoutOrigin = '';
  try { checkoutOrigin = new URL(session.url).origin; } catch { /* malformed provider URL */ }
  if (!session.id || checkoutOrigin !== 'https://checkout.stripe.com') {
    return send(res, 502, { error: 'checkout_provider_invalid_response' });
  }
  return send(res, 200, {
    checkout: {
      paymentProvider: 'stripe',
      checkoutSessionId: session.id,
      orderReference,
      idempotencyKey: `${BUSINESS_PRODUCT.productId}:${orderReference}`,
    },
    checkoutUrl: session.url,
  });
}

function signedEntitlement(session, env) {
  const payload = {
    productId: BUSINESS_PRODUCT.productId,
    productVersion: BUSINESS_PRODUCT.version,
    checkoutSessionId: session.id,
    orderReference: session.client_reference_id,
    industry: session.metadata.industry,
    authorizedRecipient: session.customer_details?.email || null,
    amountMinor: session.amount_total,
    currency: session.currency,
    verifiedPaymentEvent: 'checkout.session.payment_status=paid',
    issuedAt: Number(session.created) || Math.floor(Date.now() / 1000),
    usageLimit: null,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', env.NEATCLOCK_ENTITLEMENT_SECRET).update(encoded).digest('base64url');
  return { token: `${encoded}.${signature}`, claims: payload };
}

export async function businessEntitlement(req, res, { env = process.env, fetchImpl = fetch } = {}) {
  if (req.method !== 'GET') return send(res, 405, { error: 'method_not_allowed' });
  const settings = verificationConfig(env);
  if (!settings.ready) return send(res, 503, { error: 'entitlement_verification_unavailable' });
  const sessionId = new URL(req.url, `https://${req.headers?.host || 'localhost'}`).searchParams.get('session_id');
  const expectedPrefix = settings.secretKey.startsWith('sk_test_') ? 'cs_test_' : 'cs_live_';
  if (!sessionId?.startsWith(expectedPrefix)) return send(res, 400, { error: 'invalid_checkout_session' });

  let response;
  try {
    response = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${settings.secretKey}` },
    });
  } catch {
    return send(res, 502, { error: 'payment_verification_unavailable' });
  }
  if (!response.ok) return send(res, 502, { error: 'payment_verification_unavailable' });
  const session = await response.json();
  const matches = session.id === sessionId
    && session.mode === 'payment'
    && session.status === 'complete'
    && session.payment_status === 'paid'
    && session.metadata?.amount_minor === String(session.amount_total)
    && session.currency === BUSINESS_PRODUCT.currency
    && session.client_reference_id === session.metadata?.order_reference
    && session.metadata?.product_id === BUSINESS_PRODUCT.productId
    && session.metadata?.product_version === BUSINESS_PRODUCT.version
    && session.metadata?.delivery_type === BUSINESS_PRODUCT.deliveryType
    && ['hvac', 'plumbing'].includes(session.metadata?.industry);
  if (!matches) return send(res, 402, { error: 'payment_not_eligible_for_entitlement' });

  const entitlement = signedEntitlement(session, env);
  return send(res, 200, {
    product: BUSINESS_PRODUCT,
    checkout: {
      paymentProvider: 'stripe',
      checkoutSessionId: session.id,
      orderReference: session.client_reference_id,
      idempotencyKey: `${BUSINESS_PRODUCT.productId}:${session.id}`,
    },
    payment: { verified: true, amountMinor: session.amount_total, currency: session.currency },
    entitlement,
    fulfillment: {
      deliveryReference: 'business-calendar-share-and-qr',
      status: 'delivered',
      idempotencyKey: `${BUSINESS_PRODUCT.productId}:${session.id}:delivery`,
    },
  });
}
