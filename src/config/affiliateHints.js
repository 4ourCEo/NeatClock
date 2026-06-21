/**
 * Optional resource hints for .ics descriptions when VITE_FEATURE_AFFILIATE_LINKS=true.
 * Set VITE_AMAZON_AFFILIATE_TAG to append ?tag= to Amazon search links.
 */
const amazonTag = import.meta.env.VITE_AMAZON_AFFILIATE_TAG || '';

function amazonSearch(query) {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  return amazonTag ? `${base}&tag=${amazonTag}` : base;
}

export const AFFILIATE_HINTS = {
  'HVAC Filter Replacement': 'Tip: note your filter size before ordering.',
  'Engine Oil Change': 'Tip: check your owner manual for the correct oil grade.',
  'Quarterly Estimated Taxes': 'Tip: IRS Direct Pay — irs.gov/payments',
  'Dryer Vent Vacuuming': 'Tip: use a vent brush kit annually to reduce fire risk.',
  'Air Filter Check': 'Tip: cabin and engine filters are often different sizes.',
};

export function getAffiliateHint(taskName) {
  const base = AFFILIATE_HINTS[taskName];
  if (!base) return null;

  if (!amazonTag) return base;

  const searchMap = {
    'HVAC Filter Replacement': 'HVAC air filter',
    'Engine Oil Change': 'motor oil',
    'Air Filter Check': 'engine air filter car',
    'Dryer Vent Vacuuming': 'dryer vent cleaning kit',
  };

  const query = searchMap[taskName];
  if (query) {
    return `${base} Search: ${amazonSearch(query)}`;
  }
  return base;
}
