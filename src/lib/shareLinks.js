import { PRESET_DEEP_LINKS } from './deepLink.js';

const SLUG_BY_PRESET = Object.fromEntries(
  Object.entries(PRESET_DEEP_LINKS).map(([slug, name]) => [name, slug]),
);

export function presetShareSlug(presetName) {
  return SLUG_BY_PRESET[presetName] ?? null;
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
