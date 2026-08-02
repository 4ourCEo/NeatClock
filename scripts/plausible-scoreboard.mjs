#!/usr/bin/env node
/**
 * Append today's Plausible aggregate stats to docs/TRAFFIC-SCOREBOARD.md.
 *
 * Requires:
 *   PLAUSIBLE_API_KEY  — Plausible → Settings → API keys
 *   PLAUSIBLE_SITE_ID  — default neatclock.pro
 *
 * Docs: https://plausible.io/docs/stats-api
 */
import fs from 'node:fs';
import path from 'node:path';

const SITE = process.env.PLAUSIBLE_SITE_ID || 'neatclock.pro';
const KEY = process.env.PLAUSIBLE_API_KEY;
const SCOREBOARD = path.join('docs', 'TRAFFIC-SCOREBOARD.md');

if (!KEY) {
  console.log('plausible-scoreboard: skipped (set PLAUSIBLE_API_KEY to enable)');
  process.exit(0);
}

async function plausibleGet(pathname, params) {
  const url = new URL(`https://plausible.io/api/v1/stats/${pathname}`);
  url.searchParams.set('site_id', SITE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Plausible ${pathname} HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

const today = new Date().toISOString().slice(0, 10);

const aggregate = await plausibleGet('aggregate', {
  period: 'day',
  date: today,
  metrics: 'visitors,pageviews,events',
});

const pages = await plausibleGet('breakdown', {
  period: 'day',
  date: today,
  property: 'event:page',
  metrics: 'visitors',
  limit: '10',
});

const goals = await plausibleGet('breakdown', {
  period: 'day',
  date: today,
  property: 'event:goal',
  metrics: 'events',
  limit: '20',
}).catch(() => ({ results: [] }));

const visitors = aggregate.results?.visitors?.value ?? aggregate.results?.visitors ?? 0;
const pageResults = pages.results || [];
const topLanding =
  pageResults.find((r) => r.page && r.page !== '/' && !r.page.startsWith('/assets'))?.page ||
  pageResults[0]?.page ||
  '—';

const goalMap = Object.fromEntries((goals.results || []).map((r) => [r.goal, r.events]));
const ics = goalMap.ics_export ?? 0;
const interest = goalMap.interest_submit ?? 0;
const shares = goalMap.share_link_copy ?? 0;

const row = `| ${today} | ${visitors} | ${topLanding} | ${ics} | ${interest} | ${shares} | auto |`;

let md = fs.readFileSync(SCOREBOARD, 'utf8');
if (md.includes(`| ${today} |`)) {
  md = md.replace(new RegExp(`\\| ${today} \\|.*`), row);
  console.log(`plausible-scoreboard: updated row for ${today}`);
} else {
  // Insert after header separator line of the first table
  const marker = '|------|----------|------------------|-------------|------------------|--------------|-------|\n';
  if (!md.includes(marker)) {
    throw new Error('TRAFFIC-SCOREBOARD.md table marker not found');
  }
  // Remove placeholder empty rows that start with "| |" or "| YYYY"
  md = md.replace(marker, `${marker}${row}\n`);
  // Drop template placeholder first data row if still present
  md = md.replace(/\| YYYY-MM-DD \| \| \| \| \| \| \|\n/, '');
  console.log(`plausible-scoreboard: appended row for ${today}`);
}

fs.writeFileSync(SCOREBOARD, md);
console.log(row);
