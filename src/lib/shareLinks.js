const CANONICAL_SLUGS = {
  "Homeowner's Sentinel": 'home',
  'Preventive Gearhead': 'gearhead',
  'Automated CFO': 'cfo',
};

export function presetShareSlug(presetName) {
  return CANONICAL_SLUGS[presetName] ?? null;
}

export function buildPresetShareUrl(
  presetName,
  { origin, medium = 'share', campaign = 'preset_link' } = {},
) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '') || import.meta.env.VITE_SITE_URL || 'https://neatclock.pro';
  const params = new URLSearchParams();
  const slug = presetShareSlug(presetName);
  if (slug) params.set('preset', slug);
  params.set('utm_source', 'neatclock');
  params.set('utm_medium', medium);
  params.set('utm_campaign', campaign);
  return `${base.replace(/\/$/, '')}/?${params.toString()}`;
}

export async function copyPresetShareLink(presetName, options = {}) {
  const url = buildPresetShareUrl(presetName, options);
  await navigator.clipboard.writeText(url);
  return url;
}
