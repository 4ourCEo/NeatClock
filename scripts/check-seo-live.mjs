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
  if (!html.includes('plausible.io/js/pa-7V3YfWxV7OYX_X9davuMm.js')) {
    throw new Error('missing Plausible pa- script');
  }
  if (!html.includes("plausible.init({ domain: 'neatclock.pro' })")) {
    throw new Error('missing plausible.init({ domain: neatclock.pro })');
  }
});

await check('Plausible on home-maintenance landing', async () => {
  const html = await (await fetch(`${BASE}/home-maintenance-calendar`)).text();
  if (!html.includes('plausible.io/js/pa-7V3YfWxV7OYX_X9davuMm.js')) {
    throw new Error('missing Plausible pa- script on landing (deploy may be stale)');
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

await check('catalog.json is machine-readable', async () => {
  const res = await fetch(`${BASE}/catalog.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.pages) || data.pages.length < 5) {
    throw new Error(`expected pages[], got ${JSON.stringify(data).slice(0, 120)}`);
  }
  if (data.llms !== `${BASE}/llms.txt`) throw new Error('catalog.llms mismatch');
});

await check('.well-known/llms.txt aliases llms.txt', async () => {
  const [a, b] = await Promise.all([
    fetch(`${BASE}/.well-known/llms.txt`).then((r) => {
      if (!r.ok) throw new Error(`well-known HTTP ${r.status}`);
      return r.text();
    }),
    fetch(`${BASE}/llms.txt`).then((r) => {
      if (!r.ok) throw new Error(`llms HTTP ${r.status}`);
      return r.text();
    }),
  ]);
  if (!a.includes('NeatClock') || a.trim() !== b.trim()) {
    throw new Error('well-known/llms.txt does not match /llms.txt');
  }
});

if (failures.length) {
  console.error(`\ncheck-seo-live: ${failures.length} failure(s)`);
  process.exit(1);
}

console.log(`\ncheck-seo-live: all checks passed (${urls.length} sitemap URLs)`);
