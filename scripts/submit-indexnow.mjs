#!/usr/bin/env node
/** Submit sitemap URLs to IndexNow (Bing, Yandex, etc.) */

const KEY = 'neatclockidx2026k8m9';
const HOST = 'neatclock.pro';
const BASE = `https://${HOST}`;

const urlList = [
  `${BASE}/`,
  `${BASE}/recurring-ics-calendar-generator`,
  `${BASE}/home-maintenance-calendar`,
  `${BASE}/car-maintenance-schedule-ics`,
  `${BASE}/freelancer-quarterly-tax-reminders`,
];

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `${BASE}/${KEY}.txt`,
  urlList,
};

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

const text = await res.text();
if (res.ok || res.status === 202) {
  console.log(`IndexNow OK (${res.status}): ${urlList.length} URLs submitted`);
} else {
  console.error(`IndexNow failed (${res.status}):`, text || res.statusText);
  process.exit(1);
}
