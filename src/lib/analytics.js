/**
 * Privacy-friendly analytics via Plausible.
 * Script tag lives in index.html (parser-inserted) so currentScript/domain work.
 * Custom events: enable "Custom events" in Plausible site settings.
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
