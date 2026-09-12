#!/usr/bin/env node
/**
 * Replace Outfit font with Inter across all HTML files
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = [
  'index.html',
  'public/hvac-filter-reminder-calendar.html',
  'public/terms.html',
  'public/privacy.html',
  'public/gutter-cleaning-calendar.html',
  'public/tire-rotation-schedule-ics.html',
  'public/smoke-detector-reminder-calendar.html',
  'public/printable-chore-chart.html',
  'public/quarterly-estimated-tax-calendar.html',
  'public/guides.html',
  'public/recurring-task-reminder-app.html',
  'public/oil-change-reminder-calendar.html',
  'public/affiliate-disclosure.html',
  'public/water-heater-flush-reminder.html',
  'public/dryer-vent-cleaning-reminder.html',
  'public/recurring-ics-calendar-generator.html',
  'public/subscription-audit-reminder.html',
  'public/partner.html',
  'public/google-calendar-recurring-events.html',
];

let updated = 0;

for (const file of files) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`SKIP ${file}: not found`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // Replace Outfit with Inter in Google Fonts URLs
  html = html.replace(
    /family=Outfit:wght@[\d;]+/g,
    'family=Inter:wght@400;500;600;700'
  );

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    console.log(`OK   ${file}`);
  } else {
    console.log(`SKIP ${file}: no changes needed`);
  }
}

console.log(`\nUpdated ${updated} file(s)`);
