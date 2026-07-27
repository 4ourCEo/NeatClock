#!/usr/bin/env node
/**
 * Sets each sitemap <url>'s <lastmod> to the last git-commit date of its
 * real source file, instead of a hand-typed date that silently goes stale.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SITEMAP_PATH = path.join('public', 'sitemap.xml');

/** Maps sitemap <loc> path to the source file whose history reflects that page's content. */
const SOURCE_FOR_PATH = {
  '/': 'src',
  '/recurring-ics-calendar-generator': 'public/recurring-ics-calendar-generator.html',
  '/home-maintenance-calendar': 'public/home-maintenance-calendar.html',
  '/car-maintenance-schedule-ics': 'public/car-maintenance-schedule-ics.html',
  '/freelancer-quarterly-tax-reminders': 'public/freelancer-quarterly-tax-reminders.html',
  '/printable-chore-chart': 'public/printable-chore-chart.html',
  '/recurring-task-reminder-app': 'public/recurring-task-reminder-app.html',
};

function lastCommitDate(sourcePath) {
  const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', sourcePath], {
    encoding: 'utf8',
  }).trim();
  return out || null;
}

const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');

let updated = xml;
let changedCount = 0;

for (const [urlPath, sourcePath] of Object.entries(SOURCE_FOR_PATH)) {
  const date = lastCommitDate(sourcePath);
  if (!date) continue;

  const loc = `https://neatclock.pro${urlPath === '/' ? '/' : urlPath}`;
  const blockRe = new RegExp(
    `(<url>\\s*<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*<lastmod>)([^<]*)(</lastmod>)`,
  );
  const next = updated.replace(blockRe, (match, pre, oldDate, post) => {
    if (oldDate !== date) changedCount += 1;
    return `${pre}${date}${post}`;
  });
  updated = next;
}

if (updated !== xml) {
  fs.writeFileSync(SITEMAP_PATH, updated);
  console.log(`sitemap.xml: updated ${changedCount} lastmod date(s)`);
} else {
  console.log('sitemap.xml: lastmod dates already current');
}
