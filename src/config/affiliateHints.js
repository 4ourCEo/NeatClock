/**
 * Optional resource hints for .ics descriptions when VITE_FEATURE_AFFILIATE_LINKS=true.
 * Set VITE_AMAZON_AFFILIATE_TAG to append ?tag= to Amazon search links.
 *
 * These links end up inside a calendar app description, far from neatclock.pro
 * and any on-site disclosure — so the disclosure has to travel with the link
 * itself (see AFFILIATE_DISCLOSURE_LABEL). See /affiliate-disclosure.
 */
const amazonTag = import.meta.env.VITE_AMAZON_AFFILIATE_TAG || '';

/** Disclosure label appended to every generated affiliate link, per FTC "clear and conspicuous, close in proximity" guidance. */
export const AFFILIATE_DISCLOSURE_LABEL = '(affiliate link)';

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

function extractSpec(taskName) {
  const sizeRegex = /\b\d+\s*x\s*\d+\s*(?:x\s*\d+)?\b/i;
  const oilRegex = /\b\d+W[-_]?\d+\b/i;
  
  const sizeMatch = taskName.match(sizeRegex);
  if (sizeMatch) return sizeMatch[0].replace(/\s+/g, '');
  
  const oilMatch = taskName.match(oilRegex);
  if (oilMatch) return oilMatch[0].toUpperCase();
  
  return '';
}

export function getAffiliateHint(taskName) {
  const baseKey = Object.keys(AFFILIATE_HINTS).find((key) =>
    taskName.toLowerCase().includes(key.toLowerCase())
  );
  if (!baseKey) return null;

  const baseHint = AFFILIATE_HINTS[baseKey];
  if (!amazonTag) return baseHint;

  const searchMap = {
    'HVAC Filter Replacement': 'HVAC air filter',
    'Engine Oil Change': 'motor oil',
    'Air Filter Check': 'engine air filter car',
    'Dryer Vent Vacuuming': 'dryer vent cleaning kit',
  };

  const baseQuery = searchMap[baseKey];
  if (baseQuery) {
    const spec = extractSpec(taskName);
    const query = spec ? `${spec} ${baseQuery}` : baseQuery;
    return `${baseHint} Search: ${amazonSearch(query)} ${AFFILIATE_DISCLOSURE_LABEL}`;
  }
  return baseHint;
}
