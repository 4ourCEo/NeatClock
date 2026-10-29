import { describe, expect, it, vi } from 'vitest';
import { BUSINESS_PRODUCT, businessCheckout, businessEntitlement } from '../../server/businessCommerce.js';

const env = {
  NEATCLOCK_BUSINESS_CHECKOUT_ENABLED: 'true',
  NEATCLOCK_BUSINESS_PRICE_CENTS: '4900',
  NEATCLOCK_ENTITLEMENT_SECRET: 'test-only-signing-secret-32-bytes',
  STRIPE_SECRET_KEY: 'sk_test_neatclock_fixture',
  VERCEL_ENV: 'preview',
};

function response() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function request(method, { body, url = '/', origin = 'https://neatclock-preview.example', host = 'neatclock-preview.example' } = {}) {
  return { method, body, url, headers: { host, origin } };
}

function paidSession(overrides = {}) {
  const orderReference = 'order_reference_123456';
  return {
    id: 'cs_test_neatclock_123',
    mode: 'payment',
    status: 'complete',
    payment_status: 'paid',
    amount_total: 4900,
    currency: 'usd',
    client_reference_id: orderReference,
    customer_details: { email: 'owner@example.com' },
    created: 1_800_000_000,
    metadata: {
      product_id: BUSINESS_PRODUCT.productId,
      product_version: BUSINESS_PRODUCT.version,
      delivery_type: BUSINESS_PRODUCT.deliveryType,
      order_reference: orderReference,
      industry: 'hvac',
    },
    ...overrides,
  };
}

describe('NeatClock Business commercial contract', () => {
  it('fails closed when Preview has not been configured for checkout', async () => {
    const res = response();
    await businessCheckout(request('POST', { body: { orderReference: 'order_reference_123456', industry: 'hvac' } }), res, { env: { ...env, NEATCLOCK_BUSINESS_CHECKOUT_ENABLED: 'false' } });
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('checkout_unavailable');
  });

  it('rejects cross-origin checkout requests', async () => {
    const fetchImpl = vi.fn();
    const res = response();
    await businessCheckout(request('POST', { body: { orderReference: 'order_reference_123456', industry: 'hvac' }, origin: 'https://attacker.example' }), res, { env, fetchImpl });
    expect(res.statusCode).toBe(403);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('creates an idempotent Stripe Checkout with the approved commercial fields', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'cs_test_neatclock_123', url: 'https://checkout.stripe.com/c/pay/test_session' }) });
    const res = response();
    const orderReference = 'order_reference_123456';
    await businessCheckout(request('POST', { body: { orderReference, industry: 'plumbing' } }), res, { env, fetchImpl });
    expect(res.statusCode).toBe(200);
    expect(res.body.checkout).toMatchObject({ paymentProvider: 'stripe', checkoutSessionId: 'cs_test_neatclock_123', orderReference });
    const [, options] = fetchImpl.mock.calls[0];
    expect(options.headers['Idempotency-Key']).toContain(orderReference);
    expect(options.headers.Authorization).toBe('Bearer sk_test_neatclock_fixture');
    const params = new URLSearchParams(options.body);
    expect(params.get('metadata[product_id]')).toBe(BUSINESS_PRODUCT.productId);
    expect(params.get('metadata[industry]')).toBe('plumbing');
    expect(params.get('line_items[0][price_data][unit_amount]')).toBe('4900');
  });

  it('refuses live Stripe credentials on Preview', async () => {
    const res = response();
    await businessCheckout(request('POST', { body: { orderReference: 'order_reference_123456', industry: 'hvac' } }), res, { env: { ...env, STRIPE_SECRET_KEY: 'sk_live_forbidden' } });
    expect(res.statusCode).toBe(503);
  });

  it('issues an entitlement only after Stripe confirms the matching paid session', async () => {
    const session = paidSession();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => session });
    const res = response();
    await businessEntitlement(request('GET', { url: `/?session_id=${session.id}` }), res, { env, fetchImpl });
    expect(res.statusCode).toBe(200);
    expect(res.body.payment).toMatchObject({ verified: true, amountMinor: 4900, currency: 'usd' });
    expect(res.body.entitlement.claims).toMatchObject({ productId: BUSINESS_PRODUCT.productId, industry: 'hvac', authorizedRecipient: 'owner@example.com', usageLimit: null });
    expect(res.body.fulfillment).toMatchObject({ status: 'delivered' });
    expect(res.body.entitlement.token.split('.')).toHaveLength(2);
  });

  it('rejects unpaid, wrong-amount, wrong-product, and replay-mismatched sessions', async () => {
    const cases = [
      { payment_status: 'unpaid' },
      { amount_total: 1 },
      { metadata: { ...paidSession().metadata, product_id: 'another-product' } },
      { client_reference_id: 'somebody-elses-order' },
    ];
    for (const overrides of cases) {
      const session = paidSession(overrides);
      const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => session });
      const res = response();
      await businessEntitlement(request('GET', { url: `/?session_id=${session.id}` }), res, { env, fetchImpl });
      expect(res.statusCode).toBe(402);
      expect(res.body.entitlement).toBeUndefined();
    }
  });
});
