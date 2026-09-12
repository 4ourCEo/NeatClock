/**
 * Privacy-friendly analytics via GoatCounter (gc.zgo.at + neatclock.goatcounter.com).
 * Homepage snippet is injected by vite.config.js; static landings embed the same tag.
 * Custom events: use trackEvent(name, props); props are encoded in title for dashboard visibility.
 */

/** @param {string} name @param {Record<string, string | number | boolean>} [props] */
export function trackEvent(name, props) {
  if (typeof window === 'undefined') return;
  const goatcounter = window.goatcounter;
  if (!goatcounter || typeof goatcounter.count !== 'function') return;
  
  const eventData = { path: name, event: true };
  
  if (props && Object.keys(props).length > 0) {
    eventData.title = Object.entries(props)
      .map(([k, v]) => `${k}:${v}`)
      .join(' ');
  }
  
  goatcounter.count(eventData);
}
