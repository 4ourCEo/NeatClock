/**
 * Privacy-friendly analytics via Plausible (pa- script + plausible.init).
 * Homepage snippet is injected by vite.config.js; static landings embed the same tag.
 * Custom events: enable goals in Plausible site settings (landing_cta, ics_export, …).
 */

/** @param {string} name @param {Record<string, string | number | boolean>} [props] */
export function trackEvent(name, props) {
  if (typeof window === 'undefined') return;
  const plausible = window.plausible;
  if (typeof plausible !== 'function') return;
  if (props && Object.keys(props).length > 0) {
    plausible(name, { props });
  } else {
    plausible(name);
  }
}
