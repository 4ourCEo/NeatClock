#!/usr/bin/env node
/**
 * POST an ops event to OPS_WEBHOOK_URL (Zapier Catch Hook / Make / n8n).
 * No-ops cleanly when the secret is unset — safe for local runs.
 *
 * Usage:
 *   OPS_WEBHOOK_URL=https://hooks.zapier.com/... node scripts/notify-ops.mjs \
 *     --event weekly_seo \
 *     --title "SEO distribution week" \
 *     --url https://neatclock.pro/guides \
 *     --checklist "Mon Pinterest" --checklist "Wed Reddit"
 *
 *   node scripts/notify-ops.mjs --json '{"event":"landing_indexed","urls":["https://neatclock.pro/guides"]}'
 *   node scripts/notify-ops.mjs --json-file /tmp/payload.json
 */
import fs from 'node:fs';

function argAll(name) {
  const out = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === `--${name}` && process.argv[i + 1]) {
      out.push(process.argv[i + 1]);
    }
  }
  return out;
}

function arg(name, fallback = '') {
  const all = argAll(name);
  return all.length ? all[all.length - 1] : fallback;
}

const webhook = process.env.OPS_WEBHOOK_URL?.trim();
if (!webhook) {
  console.log('notify-ops: skipped (OPS_WEBHOOK_URL unset)');
  process.exit(0);
}

let filePayload = null;
const jsonInline = arg('json');
const jsonFile = arg('json-file');
if (jsonInline) {
  filePayload = JSON.parse(jsonInline);
} else if (jsonFile) {
  filePayload = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
}

const urls = [...argAll('url'), ...(filePayload?.urls || [])];
const checklist = [...argAll('checklist'), ...(filePayload?.checklist || [])];

const payload = {
  event: arg('event', filePayload?.event || 'ops'),
  date: new Date().toISOString().slice(0, 10),
  site: 'https://neatclock.pro',
  title: arg('title', filePayload?.title || ''),
  checklist,
  urls: [...new Set(urls)],
  source: arg('source', filePayload?.source || 'github-actions'),
};

const res = await fetch(webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  const text = await res.text().catch(() => '');
  console.error(`notify-ops: webhook failed ${res.status} ${text.slice(0, 200)}`);
  process.exit(1);
}

console.log(`notify-ops: OK (${res.status}) event=${payload.event} urls=${payload.urls.length}`);
