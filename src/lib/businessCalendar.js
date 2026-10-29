export const BUSINESS_INDUSTRIES = Object.freeze({
  hvac: Object.freeze({ label: 'HVAC', preset: 'HVAC Customer Care' }),
  plumbing: Object.freeze({ label: 'Plumbing', preset: 'Plumbing Customer Care' }),
});

const LIMITS = { brandName: 80, logoUrl: 500, phone: 40, email: 120, website: 200 };

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

export function buildBusinessShareUrl({ origin, industry, brand }) {
  if (!BUSINESS_INDUSTRIES[industry]) throw new Error('Choose HVAC or plumbing.');
  const cleanBrand = normalizeBusinessBrand(brand);
  if (!cleanBrand.brandName) throw new Error('Add your business name.');

  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://neatclock.pro');
  const url = new URL('/', base);
  url.searchParams.set('preset', `${industry}-business`);
  url.searchParams.set('fresh', '1');
  url.searchParams.set('utm_source', 'neatclock');
  url.searchParams.set('utm_medium', 'business_qr');
  url.searchParams.set('utm_campaign', industry);
  for (const [key, value] of Object.entries(cleanBrand)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function businessOrderReference(randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  if (!randomUUID) throw new Error('Secure checkout is unavailable in this browser.');
  return randomUUID();
}
