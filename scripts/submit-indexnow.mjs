#!/usr/bin/env node
/** Submit all sitemap <loc> URLs to IndexNow (Bing, Yandex, etc.) */

import fs from 'node:fs';
import path from 'node:path';

const KEY = 'neatclockidx2026k8m9';
const HOST = 'neatclock.pro';
const BASE = `https://${HOST}`;
const SITEMAP_PATH = path.join('public', 'sitemap.xml');

const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

if (urlList.length === 0) {
  console.error('IndexNow failed: no <loc> URLs found in public/sitemap.xml');
  process.exit(1);
}

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
  for (const url of urlList) console.log(`  - ${url}`);
} else {
  console.error(`IndexNow failed (${res.status}):`, text || res.statusText);
  process.exit(1);
}
