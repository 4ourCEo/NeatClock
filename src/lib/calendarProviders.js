import { buildIcsContent } from './buildIcs.js';
import { downloadText } from './download.js';

export function getGoogleCalLink(task) {
  let freq = 'MONTHLY';
  if (task.unit === 'weeks') freq = 'WEEKLY';
  if (task.unit === 'years') freq = 'YEARLY';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.name)}&recur=RRULE:FREQ=${freq};INTERVAL=${task.interval}`;
}

export function getOutlookCalLink(task) {
  let freq = 'MONTHLY';
  if (task.unit === 'weeks') freq = 'WEEKLY';
  if (task.unit === 'years') freq = 'YEARLY';
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(task.name)}&rrule=FREQ=${freq};INTERVAL=${task.interval}`;
}

/** Apple Calendar has no web compose URL — download a one-task .ics file instead. */
export function downloadAppleTaskIcs(task) {
  const content = buildIcsContent([task]);
  if (!content) return;

  const slug =
    task.name
      .slice(0, 40)
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'task';

  downloadText(content, `neatclock-${slug}.ics`, 'text/calendar;charset=utf-8');
}
