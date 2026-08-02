#!/usr/bin/env node
/**
 * Live SEO smoke checks against production (network required).
 * Usage: npm run check:seo-live
 * Optional: SEO_LIVE_BASE=https://neatclock.pro
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.SEO_LIVE_BASE || 'https://neatclock.pro').replace(/\/$/, '');
const SITEMAP_PATH = path.join('public', 'sitemap.xml');
const INDEXNOW_KEY = 'neatclockidx2026k8m9';

const failures = [];

async function check(label, fn) {
  try {
    await fn();
    console.log(`OK  ${label}`);
  } catch (err) {
    failures.push(`${label}: ${err.message}`);
    console.error(`FAIL ${label}: ${err.message}`);
  }
}

const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

await check('sitemap has URLs', async () => {
  if (urls.length < 5) throw new Error(`expected ≥5 locs, got ${urls.length}`);
});

for (const url of urls) {
  await check(`GET ${url}`, async () => {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
}

await check('IndexNow key file', async () => {
  const res = await fetch(`${BASE}/${INDEXNOW_KEY}.txt`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = (await res.text()).trim();
  if (body !== INDEXNOW_KEY) throw new Error(`key mismatch: ${body}`);
});

await check('Plausible on homepage', async () => {
  const html = await (await fetch(`${BASE}/`)).text();
  if (!html.includes('data-domain="neatclock.pro"')) {
    throw new Error('missing data-domain=neatclock.pro');
  }
  if (!html.includes('plausible.io/js/script.js')) {
    throw new Error('missing Plausible script');
  }
});

await check('Plausible on home-maintenance landing', async () => {
  const html = await (await fetch(`${BASE}/home-maintenance-calendar`)).text();
  if (!html.includes('data-domain="neatclock.pro"')) {
    throw new Error('missing Plausible on landing (deploy may be stale)');
  }
});

await check('www → apex redirect', async () => {
  const res = await fetch('https://www.neatclock.pro/', { redirect: 'manual' });
  if (![301, 302, 307, 308].includes(res.status)) {
    throw new Error(`expected redirect, got ${res.status}`);
  }
  const loc = res.headers.get('location') || '';
  if (!loc.includes('https://neatclock.pro')) {
    throw new Error(`unexpected Location: ${loc}`);
  }
});

if (failures.length) {
  console.error(`\ncheck-seo-live: ${failures.length} failure(s)`);
  process.exit(1);
}

console.log(`\ncheck-seo-live: all checks passed (${urls.length} sitemap URLs)`);
