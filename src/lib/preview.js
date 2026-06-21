/** Owner staging: add ?preview=monetization to see gated UI without enabling env flags */
export function isMonetizationPreview() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('preview') === 'monetization';
}

/** True when monetization UI should render (live flag or owner preview) */
export function shouldShowMonetization(enabled) {
  return enabled || isMonetizationPreview();
}
