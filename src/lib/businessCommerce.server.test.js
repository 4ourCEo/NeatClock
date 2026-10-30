import { createHmac } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { BUSINESS_PRODUCT, businessCheckout, businessEntitlement, businessRecovery, businessWebhook } from '../../server/businessCommerce.js';
import { hashOrderProof } from '../../server/businessStore.js';

const proof = 'a'.repeat(64);
const artifactUrl = 'https://neatclock-preview.example/?preset=hvac-business&business_id=b8a1c7d2-4f65-4cc3-a239-01c0ef89a112&brandName=North';
const env = { NEATCLOCK_BUSINESS_CHECKOUT_ENABLED: 'true', NEATCLOCK_BUSINESS_PRICE_CENTS: '4900', NEATCLOCK_ENTITLEMENT_SECRET: 'test-only-signing-secret-32-bytes', NEATCLOCK_STRIPE_WEBHOOK_SECRET: 'whsec_fixture', NEATCLOCK_SUPABASE_URL: 'https://fixture.supabase.co', NEATCLOCK_SUPABASE_SERVICE_ROLE_KEY: 'service-fixture', NEATCLOCK_SUPABASE_PUBLISHABLE_KEY: 'publishable-fixture', STRIPE_SECRET_KEY: 'sk_test_neatclock_fixture', VERCEL_ENV: 'preview' };
const neonEnv = { ...env, DATABASE_URL: 'postgresql://user:pass@host:5432/db', NEATCLOCK_RECOVERY_SECRET: 'a'.repeat(32), NEATCLOCK_SUPABASE_URL: '', NEATCLOCK_SUPABASE_SERVICE_ROLE_KEY: '', NEATCLOCK_SUPABASE_PUBLISHABLE_KEY: '', SMTP_PASS: 'test-smtp-pass' };
function response() { return { statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }
function request(method, { body, url = '/', origin = 'https://neatclock-preview.example', host = 'neatclock-preview.example', headers = {} } = {}) { return { method, body, url, headers: { host, origin, ...headers } }; }
function paidSession(overrides = {}) { const orderReference = 'order_reference_123456'; return { id: 'cs_test_neatclock_123', mode: 'payment', status: 'complete', payment_status: 'paid', amount_total: 4900, currency: 'usd', client_reference_id: orderReference, customer_details: { email: 'owner@example.com' }, created: 1_800_000_000, metadata: { product_id: BUSINESS_PRODUCT.productId, product_version: BUSINESS_PRODUCT.version, delivery_type: BUSINESS_PRODUCT.deliveryType, order_reference: orderReference, amount_minor: '4900', industry: 'hvac' }, ...overrides }; }
function purchase(overrides = {}) { return { order_reference: 'order_reference_123456', checkout_session_id: 'cs_test_neatclock_123', purchaser_email: 'owner@example.com', product_id: BUSINESS_PRODUCT.productId, product_version: BUSINESS_PRODUCT.version, industry: 'hvac', amount_minor: 4900, currency: 'usd', artifact_url: artifactUrl, order_proof_hash: hashOrderProof(proof), stripe_event_id: 'evt_paid', fulfillment_status: 'ready', ...overrides }; }
function signature(rawBody, timestamp = 1_800_000_000) { return `t=${timestamp},v1=${createHmac('sha256', env.NEATCLOCK_STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${rawBody}`).digest('hex')}`; }

describe('NeatClock durable commercial contract', () => {
  it('creates a pending durable order before an idempotent Stripe Checkout and omits fixed payment methods', async () => {
    const store = { createPending: vi.fn(), bindCheckout: vi.fn() };
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'cs_test_neatclock_123', url: 'https://checkout.stripe.com/c/pay/test_session' }) });
    const res = response(); await businessCheckout(request('POST', { body: { orderReference: 'order_reference_123456', industry: 'hvac', orderProof: proof, artifactUrl, businessId: 'b8a1c7d2-4f65-4cc3-a239-01c0ef89a112' } }), res, { env, fetchImpl, store });
    expect(res.statusCode).toBe(200); expect(store.createPending).toHaveBeenCalledBefore(fetchImpl); expect(store.bindCheckout).toHaveBeenCalledWith('order_reference_123456', 'cs_test_neatclock_123');
    const params = new URLSearchParams(fetchImpl.mock.calls[0][1].body); expect(params.has('payment_method_types[]')).toBe(false); expect(params.get('customer_creation')).toBe('always'); expect(res.body.checkout.orderProof).toBe(proof);
  });

  it('fails closed on cross-origin, invalid artifact, missing storage, and live Preview key', async () => {
    for (const [req, changedEnv, expected] of [
      [request('POST', { origin: 'https://attacker.example', body: {} }), env, 403],
      [request('POST', { body: { orderReference: 'order_reference_123456', industry: 'hvac', orderProof: proof, artifactUrl: 'https://attacker.example', businessId: 'b8a1c7d2-4f65-4cc3-a239-01c0ef89a112' } }), env, 400],
      [request('POST', { body: {} }), { ...env, NEATCLOCK_SUPABASE_URL: '' }, 503],
      [request('POST', { body: {} }), { ...env, STRIPE_SECRET_KEY: 'sk_live_forbidden' }, 503],
      [request('POST', { body: {} }), { ...neonEnv, DATABASE_URL: '' }, 503],
      [request('POST', { body: {} }), { ...neonEnv, NEATCLOCK_RECOVERY_SECRET: 'short' }, 503],
    ]) { const res = response(); await businessCheckout(req, res, { env: changedEnv, fetchImpl: vi.fn() }); expect(res.statusCode).toBe(expected); }
  });

  it('does not grant from a redirect and requires both webhook-ready storage and the browser proof', async () => {
    const store = { getReadyBySession: vi.fn().mockResolvedValue(purchase()) };
    for (const [candidateProof, expected] of [[undefined, 400], ['b'.repeat(64), 404], [proof, 200]]) {
      const res = response(); await businessEntitlement(request('GET', { url: '/?session_id=cs_test_neatclock_123', headers: candidateProof ? { 'x-neatclock-order-proof': candidateProof } : {} }), res, { env, store }); expect(res.statusCode).toBe(expected);
    }
  });

  it('verifies raw Stripe signatures, authoritatively retrieves the paid session, and delegates idempotency to durable storage', async () => {
    const event = { id: 'evt_paid', type: 'checkout.session.completed', created: 1_800_000_000, data: { object: { id: 'cs_test_neatclock_123', payment_status: 'paid' } } }; const raw = JSON.stringify(event);
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => paidSession() }); const store = { fulfill: vi.fn().mockResolvedValueOnce({ outcome: 'fulfilled' }).mockResolvedValueOnce({ outcome: 'duplicate' }) };
    for (const expected of ['fulfilled', 'duplicate']) { const res = response(); await businessWebhook(request('POST', { headers: { 'stripe-signature': signature(raw) } }), res, { env, fetchImpl, store, rawBody: Buffer.from(raw), now: 1_800_000_000_000 }); expect(res.statusCode).toBe(200); expect(res.body.outcome).toBe(expected); }
    expect(store.fulfill).toHaveBeenCalledTimes(2);
  });

  it('rejects bad or expired signatures and safely ignores delayed unpaid and unrelated events', async () => {
    const paidEvent = JSON.stringify({ id: 'evt_x', type: 'checkout.session.completed', created: 1_800_000_000, data: { object: { id: 'cs_test_neatclock_123' } } });
    for (const header of ['t=1,v1=bad', signature(paidEvent, 1_799_999_000)]) { const res = response(); await businessWebhook(request('POST', { headers: { 'stripe-signature': header } }), res, { env, rawBody: Buffer.from(paidEvent), now: 1_800_000_000_000 }); expect(res.statusCode).toBe(400); }
    const ignored = JSON.stringify({ id: 'evt_other', type: 'customer.created', created: 1_800_000_000, data: { object: {} } }); const ignoredRes = response(); await businessWebhook(request('POST', { headers: { 'stripe-signature': signature(ignored) } }), ignoredRes, { env, rawBody: Buffer.from(ignored), now: 1_800_000_000_000 }); expect(ignoredRes.body.outcome).toBe('ignored');
    const unpaidRes = response(); await businessWebhook(request('POST', { headers: { 'stripe-signature': signature(paidEvent) } }), unpaidRes, { env, rawBody: Buffer.from(paidEvent), now: 1_800_000_000_000, fetchImpl: vi.fn().mockResolvedValue({ ok: true, json: async () => paidSession({ payment_status: 'unpaid' }) }), store: { fulfill: vi.fn() } }); expect(unpaidRes.body.outcome).toBe('not_paid_or_ineligible');
  });

  it('uses enumeration-safe email recovery and returns the same entitlement only to a verified email token', async () => {
    const identity = { email: 'owner@example.com', sessionId: 'session-1', userId: 'user-1' };
    const store = { requestRecovery: vi.fn(), verifiedIdentity: vi.fn().mockResolvedValue(identity), consumeRecovery: vi.fn().mockResolvedValue(true), getReadyByEmail: vi.fn().mockResolvedValue([purchase()]) };
    const requestRes = response(); await businessRecovery(request('POST', { body: { email: 'owner@example.com' } }), requestRes, { env, store }); expect(requestRes.statusCode).toBe(202); expect(requestRes.body).not.toHaveProperty('purchase');
    store.getReadyByEmail.mockResolvedValueOnce([]); const unknownRes = response(); await businessRecovery(request('POST', { body: { email: 'unknown@example.com' } }), unknownRes, { env, store }); expect(unknownRes.body).toEqual(requestRes.body); expect(store.requestRecovery).toHaveBeenCalledTimes(1);
    const recoverRes = response(); await businessRecovery(request('GET', { headers: { authorization: 'Bearer one-time-session' } }), recoverRes, { env, store }); expect(recoverRes.statusCode).toBe(200); expect(recoverRes.body.purchases[0].entitlement.claims.artifactUrl).toBe(artifactUrl);
    store.consumeRecovery.mockResolvedValueOnce(false); const replay = response(); await businessRecovery(request('GET', { headers: { authorization: 'Bearer replayed' } }), replay, { env, store }); expect(replay.statusCode).toBe(410);
    store.verifiedIdentity.mockResolvedValueOnce(null); const unauthorized = response(); await businessRecovery(request('GET', { headers: { authorization: 'Bearer expired' } }), unauthorized, { env, store }); expect(unauthorized.statusCode).toBe(401);
  });
});
