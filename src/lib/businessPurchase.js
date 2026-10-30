import { businessOrderReference } from './businessCalendar.js';

export const BUSINESS_ENTITLEMENT_STORAGE_KEY = 'neatclock_business_entitlement_v1';
export const BUSINESS_PENDING_CHECKOUT_STORAGE_KEY = 'neatclock_business_pending_checkout_v1';

export async function getBusinessCheckoutConfig(fetchImpl = fetch) {
  const response = await fetchImpl('/api/business-checkout', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Business checkout configuration is unavailable.');
  return response.json();
}

function randomOrderProof() {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

export async function createBusinessCheckout({ industry, artifactUrl, businessId }, fetchImpl = fetch) {
  const orderReference = businessOrderReference();
  const orderProof = randomOrderProof();
  const response = await fetchImpl('/api/business-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ industry, orderReference, orderProof, artifactUrl, businessId }),
  });
  const result = await response.json();
  if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Could not start checkout.');
  return result;
}

export async function verifyBusinessEntitlement(sessionId, orderProof, fetchImpl = fetch) {
  const response = await fetchImpl(`/api/business-entitlement?session_id=${encodeURIComponent(sessionId)}`, {
    headers: { Accept: 'application/json', 'X-NeatClock-Order-Proof': orderProof },
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
  if (typeof checkout.orderProof !== 'string') throw new Error('Invalid order proof.');
  storage?.setItem(BUSINESS_PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify({ checkoutSessionId: checkout.checkoutSessionId, orderProof: checkout.orderProof }));
}

export function readPendingBusinessCheckout(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(BUSINESS_PENDING_CHECKOUT_STORAGE_KEY) || 'null');
    return typeof parsed?.checkoutSessionId === 'string' && typeof parsed?.orderProof === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingBusinessCheckout(storage = globalThis.localStorage) {
  storage?.removeItem(BUSINESS_PENDING_CHECKOUT_STORAGE_KEY);
}

export function saveBusinessEntitlement(result, orderProof = '', storage = globalThis.localStorage) {
  const record = {
    checkoutSessionId: result.checkout.checkoutSessionId,
    token: result.entitlement.token,
    claims: result.entitlement.claims,
    orderProof,
  };
  storage?.setItem(BUSINESS_ENTITLEMENT_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export async function requestBusinessRecovery(email, fetchImpl = fetch) {
  const response = await fetchImpl('/api/business-recovery', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Recovery email could not be sent.');
  return result;
}

export function readRecoveryAccessToken(location = globalThis.location) {
  const params = new URLSearchParams((location?.hash || '').replace(/^#/, ''));
  return params.get('access_token') || '';
}

export async function recoverBusinessPurchases(accessToken, fetchImpl = fetch) {
  const response = await fetchImpl('/api/business-recovery', { headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` } });
  const result = await response.json();
  if (!response.ok || !result.purchases?.length) throw new Error(result.error || 'No completed purchase was found.');
  return result.purchases;
}
