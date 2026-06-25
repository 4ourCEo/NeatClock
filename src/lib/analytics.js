/**
 * Privacy-friendly analytics via Plausible — loads only when configured and not on localhost.
 * Custom events: enable "Custom events" in Plausible site settings.
 */
export function initAnalytics() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain) return;

  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
    return;
  }

  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

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
