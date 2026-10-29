import { buildIcsContent } from './buildIcs.js';
import { downloadText } from './download.js';
import { businessBrandFromSearch, businessIdForSearch } from './businessCalendar.js';

function businessEventDetails(search) {
  const brand = businessBrandFromSearch(search);
  if (!brand?.brandName) return '';
  return [
    `Customer care calendar from ${brand.brandName}.`,
    brand.brandPhone && `Call ${brand.brandPhone}.`,
    brand.brandEmail && `Email ${brand.brandEmail}.`,
    brand.brandWeb && `Website ${brand.brandWeb}.`,
  ].filter(Boolean).join(' ');
}

export function getGoogleCalLink(task, search) {
  let freq = 'MONTHLY';
  if (task.unit === 'weeks') freq = 'WEEKLY';
  if (task.unit === 'years') freq = 'YEARLY';
  const params = new URLSearchParams({ action: 'TEMPLATE', text: task.name, details: businessEventDetails(search), recur: `RRULE:FREQ=${freq};INTERVAL=${task.interval}` });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function getOutlookCalLink(task, search) {
  let freq = 'MONTHLY';
  if (task.unit === 'weeks') freq = 'WEEKLY';
  if (task.unit === 'years') freq = 'YEARLY';
  const params = new URLSearchParams({ subject: task.name, body: businessEventDetails(search), rrule: `FREQ=${freq};INTERVAL=${task.interval}` });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

/** Apple Calendar has no web compose URL — download a one-task .ics file instead. */
export function downloadAppleTaskIcs(task, search) {
  const content = buildIcsContent([task], { businessBrand: businessBrandFromSearch(search), businessId: businessIdForSearch(search) });
  if (!content) return;

  const slug =
    task.name
      .slice(0, 40)
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'task';

  downloadText(content, `neatclock-${slug}.ics`, 'text/calendar;charset=utf-8');
}
