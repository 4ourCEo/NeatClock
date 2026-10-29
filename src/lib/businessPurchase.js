import { businessOrderReference } from './businessCalendar.js';

export const BUSINESS_ENTITLEMENT_STORAGE_KEY = 'neatclock_business_entitlement_v1';
export const BUSINESS_PENDING_CHECKOUT_STORAGE_KEY = 'neatclock_business_pending_checkout_v1';

export async function getBusinessCheckoutConfig(fetchImpl = fetch) {
  const response = await fetchImpl('/api/business-checkout', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Business checkout configuration is unavailable.');
  return response.json();
}

export async function createBusinessCheckout(industry, fetchImpl = fetch) {
  const orderReference = businessOrderReference();
  const response = await fetchImpl('/api/business-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ industry, orderReference }),
  });
  const result = await response.json();
  if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Could not start checkout.');
  return result;
}

export async function verifyBusinessEntitlement(sessionId, fetchImpl = fetch) {
  const response = await fetchImpl(`/api/business-entitlement?session_id=${encodeURIComponent(sessionId)}`, {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json();
  if (!response.ok || result.payment?.verified !== true || !result.entitlement?.token) {
    throw new Error(result.error || 'Payment could not be verified.');
  }
  return result;
}

export function readSavedBusinessEntitlement(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(BUSINESS_ENTITLEMENT_STORAGE_KEY) || 'null');
    return typeof parsed?.checkoutSessionId === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function savePendingBusinessCheckout(checkout, storage = globalThis.localStorage) {
  if (typeof checkout?.checkoutSessionId !== 'string' || !checkout.checkoutSessionId.startsWith('cs_')) {
    throw new Error('Invalid Checkout session.');
  }
  storage?.setItem(BUSINESS_PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify({ checkoutSessionId: checkout.checkoutSessionId }));
}

export function readPendingBusinessCheckout(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(BUSINESS_PENDING_CHECKOUT_STORAGE_KEY) || 'null');
    return typeof parsed?.checkoutSessionId === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingBusinessCheckout(storage = globalThis.localStorage) {
  storage?.removeItem(BUSINESS_PENDING_CHECKOUT_STORAGE_KEY);
}

export function saveBusinessEntitlement(result, storage = globalThis.localStorage) {
  const record = {
    checkoutSessionId: result.checkout.checkoutSessionId,
    token: result.entitlement.token,
    claims: result.entitlement.claims,
  };
  storage?.setItem(BUSINESS_ENTITLEMENT_STORAGE_KEY, JSON.stringify(record));
  return record;
}
