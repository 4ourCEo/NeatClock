/**
 * Privacy-friendly analytics via Plausible — loads only when configured and not on localhost.
 * Set VITE_PLAUSIBLE_DOMAIN on Vercel (e.g. neatclock.app) before production traffic.
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
