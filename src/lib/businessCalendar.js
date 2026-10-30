export const BUSINESS_INDUSTRIES = Object.freeze({
  hvac: Object.freeze({ label: 'HVAC', preset: 'HVAC Customer Care' }),
  plumbing: Object.freeze({ label: 'Plumbing', preset: 'Plumbing Customer Care' }),
});
let fallbackBusinessIdentityCounter = 0;

// Keep branded links short enough to fit reliably in downloadable QR codes.
const LIMITS = { brandName: 60, logoUrl: 250, phone: 24, email: 80, website: 120 };

function text(value, limit) {
  return String(value || '').trim().slice(0, limit);
}

function validPublicUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function normalizeBusinessBrand(input = {}) {
  const color = text(input.brandColor || 'e07a5f', 7).replace(/^#/, '').toLowerCase();
  const email = text(input.brandEmail, LIMITS.email);
  return {
    brandName: text(input.brandName, LIMITS.brandName),
    brandLogo: validPublicUrl(text(input.brandLogo, LIMITS.logoUrl)),
    brandPhone: text(input.brandPhone, LIMITS.phone),
    brandEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
    brandWeb: validPublicUrl(text(input.brandWeb, LIMITS.website)),
    brandColor: /^[0-9a-f]{6}$/.test(color) ? color : 'e07a5f',
  };
}

export function buildBusinessShareUrl({ origin, industry, brand, businessId }) {
  if (!BUSINESS_INDUSTRIES[industry]) throw new Error('Choose HVAC or plumbing.');
  if (typeof businessId !== 'string' || !/^[0-9a-f-]{16,64}$/i.test(businessId)) throw new Error('Business calendar identity is unavailable.');
  const cleanBrand = normalizeBusinessBrand(brand);
  if (!cleanBrand.brandName) throw new Error('Add your business name.');

  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://neatclock.pro');
  const url = new URL('/', base);
  url.searchParams.set('preset', `${industry}-business`);
  url.searchParams.set('business_id', businessId);
  url.searchParams.set('utm_source', 'neatclock');
  url.searchParams.set('utm_medium', 'business_qr');
  url.searchParams.set('utm_campaign', industry);
  for (const [key, value] of Object.entries(cleanBrand)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function businessBrandFromSearch(search = typeof window !== 'undefined' ? window.location.search : '') {
  const params = new URLSearchParams(search);
  const preset = params.get('preset')?.toLowerCase();
  if (!['hvac-business', 'plumbing-business'].includes(preset)) return null;
  return normalizeBusinessBrand({
    brandName: params.get('brandName'), brandLogo: params.get('brandLogo'),
    brandPhone: params.get('brandPhone'), brandEmail: params.get('brandEmail'),
    brandWeb: params.get('brandWeb'), brandColor: params.get('brandColor'),
  });
}

export function businessIdFromSearch(search = typeof window !== 'undefined' ? window.location.search : '') {
  const id = new URLSearchParams(search).get('business_id');
  return typeof id === 'string' && /^[0-9a-f-]{16,64}$/i.test(id) ? id : null;
}

function hashIdentity(value, seed) {
  let hash = BigInt(seed);
  const mask = 0xffffffffffffffffn;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = (hash * 0x100000001b3n) & mask;
  }
  return hash.toString(16).padStart(16, '0');
}

export function legacyBusinessIdentityId(brand = {}, industry = 'business') {
  const cleanBrand = normalizeBusinessBrand(brand);
  if (!cleanBrand.brandName) throw new Error('Add your business name to create a calendar identity.');
  const identity = [
    industry,
    cleanBrand.brandName.toLowerCase(),
    cleanBrand.brandPhone.replace(/\D/g, ''),
    cleanBrand.brandEmail.toLowerCase(),
    cleanBrand.brandWeb.toLowerCase(),
  ].join('|');
  return `${hashIdentity(identity, '14695981039346656037')}${hashIdentity(identity, '7809847782465536322')}`;
}

export function createBusinessIdentityId(randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  if (typeof randomUUID === 'function') {
    try { return randomUUID(); } catch { /* use a local fallback */ }
  }
  try {
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    fallbackBusinessIdentityCounter += 1;
    return `${Date.now().toString(16).padStart(16, '0').slice(-16)}${fallbackBusinessIdentityCounter.toString(16).padStart(8, '0')}`;
  }
}

export function businessIdForSearch(search = typeof window !== 'undefined' ? window.location.search : '') {
  const explicitId = businessIdFromSearch(search);
  if (explicitId) return explicitId;
  const params = new URLSearchParams(search);
  const preset = params.get('preset')?.toLowerCase();
  const industry = preset === 'hvac-business' ? 'hvac' : preset === 'plumbing-business' ? 'plumbing' : null;
  const brand = businessBrandFromSearch(search);
  if (!industry || !brand?.brandName) return null;
  return legacyBusinessIdentityId(brand, industry);
}

export function businessOrderReference(randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  if (!randomUUID) throw new Error('Secure checkout is unavailable in this browser.');
  return randomUUID();
}
