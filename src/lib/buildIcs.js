import { getAffiliateHint } from '../config/affiliateHints.js';
import { clampInterval, normalizeUnit } from './tasks.js';

export function escapeIcalText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function padZero(n) {
  return String(n).padStart(2, '0');
}

/** All-day DATE value (YYYYMMDD) — avoids timezone drift in Google/Apple/Outlook */
export function formatIcalDate(date) {
  return `${date.getFullYear()}${padZero(date.getMonth() + 1)}${padZero(date.getDate())}`;
}

function freqForUnit(unit) {
  if (unit === 'weeks') return 'WEEKLY';
  if (unit === 'years') return 'YEARLY';
  return 'MONTHLY';
}

export function buildIcsContent(tasks, options = {}) {
  const { startOffsetWeeks = 0, includeAffiliateHints = false } = options;

  if (!tasks.length) {
    return null;
  }

  const now = new Date();
  const dtStamp = `${now.getUTCFullYear()}${padZero(now.getUTCMonth() + 1)}${padZero(now.getUTCDate())}T${padZero(now.getUTCHours())}${padZero(now.getUTCMinutes())}${padZero(now.getUTCSeconds())}Z`;

  const exportStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  exportStart.setDate(exportStart.getDate() + startOffsetWeeks * 7);
  const dtStart = formatIcalDate(exportStart);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NeatClock//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  tasks.forEach((task) => {
    const unit = normalizeUnit(task.unit);
    const interval = clampInterval(task.interval);
    const freq = freqForUnit(unit);
    let description = `Recurring NeatClock task. Repeats every ${interval} ${unit}.`;

    if (includeAffiliateHints) {
      const hint = getAffiliateHint(task.name);
      if (hint) {
        description += ` ${hint}`;
      }
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:task-${task.id}@neatclock.app`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`SUMMARY:${escapeIcalText(task.name)}`);
    lines.push(`DESCRIPTION:${escapeIcalText(description)}`);
    lines.push(`RRULE:FREQ=${freq};INTERVAL=${interval}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
