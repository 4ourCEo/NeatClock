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

await check('GoatCounter on homepage', async () => {
  const html = await (await fetch(`${BASE}/`)).text();
  if (!html.includes('gc.zgo.at/count.js')) {
    throw new Error('missing GoatCounter script');
  }
  if (!html.includes('data-goatcounter="https://neatclock.goatcounter.com/count"')) {
    throw new Error('missing GoatCounter data-goatcounter attribute');
  }
});

await check('GoatCounter on home-maintenance landing', async () => {
  const html = await (await fetch(`${BASE}/home-maintenance-calendar`)).text();
  if (!html.includes('gc.zgo.at/count.js')) {
    throw new Error('missing GoatCounter script on landing (deploy may be stale)');
  }
});

await check('Home landing has primary + print CTAs', async () => {
  const html = await (await fetch(`${BASE}/home-maintenance-calendar`)).text();
  if (!html.includes('Open Home Sentinel preset')) {
    throw new Error('missing primary CTA');
  }
  if (!html.includes('gorillamotors.gumroad.com/l/oikeyi')) {
    throw new Error('missing Gumroad print pack link');
  }
  if (!html.includes("goatcounter.count({path:'print_cta_click'")) {
    throw new Error('missing print_cta_click tracking');
  }
  if (!html.includes('utm_content=print_pack')) {
    throw new Error('missing print_pack UTM on CTA');
  }
});

await check('Car landing has primary + print CTAs', async () => {
  const html = await (await fetch(`${BASE}/car-maintenance-schedule-ics`)).text();
  if (!html.includes('Open Gearhead preset')) {
    throw new Error('missing primary CTA');
  }
  if (!html.includes('gorillamotors.gumroad.com/l/undcqo')) {
    throw new Error('missing Gumroad print pack link');
  }
  if (!html.includes("goatcounter.count({path:'print_cta_click'")) {
    throw new Error('missing print_cta_click tracking');
  }
});

await check('Freelancer landing has primary + print CTAs', async () => {
  const html = await (await fetch(`${BASE}/freelancer-quarterly-tax-reminders`)).text();
  if (!html.includes('Open CFO preset')) {
    throw new Error('missing primary CTA');
  }
  if (!html.includes('gorillamotors.gumroad.com/l/zdwmy')) {
    throw new Error('missing Gumroad print pack link');
  }
  if (!html.includes("goatcounter.count({path:'print_cta_click'")) {
    throw new Error('missing print_cta_click tracking');
  }
});

await check('Friendly URL aliases redirect', async () => {
  const aliases = [
    ['/car-maintenance-schedule', '/car-maintenance-schedule-ics'],
    ['/freelancer-tax-calendar', '/freelancer-quarterly-tax-reminders'],
    ['/freelancer-tax-reminders', '/freelancer-quarterly-tax-reminders'],
  ];
  for (const [alias, canonical] of aliases) {
    const res = await fetch(`${BASE}${alias}`, { redirect: 'manual' });
    if (![301, 302, 307, 308].includes(res.status)) {
      throw new Error(`${alias} expected redirect, got ${res.status}`);
    }
    const loc = res.headers.get('location') || '';
    if (!loc.includes(canonical)) {
      throw new Error(`${alias} should redirect to ${canonical}, got ${loc}`);
    }
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
