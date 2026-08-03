#!/usr/bin/env node
/**
 * Write ops events to Notion (preferred) or OPS_WEBHOOK_URL (Zapier fallback).
 *
 * Env (Notion path):
 *   NOTION_TOKEN              — internal integration secret
 *   NOTION_OPS_DATABASE_ID    — optional override (defaults to docs/notion-config.json)
 *
 * Env (Zapier fallback):
 *   OPS_WEBHOOK_URL
 *
 * Usage: same CLI flags as before — see --help via missing event.
 */
import fs from 'node:fs';
import path from 'node:path';

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

function loadConfig() {
  const p = path.join('docs', 'notion-config.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

let filePayload = null;
const jsonInline = arg('json');
const jsonFile = arg('json-file');
if (jsonInline) filePayload = JSON.parse(jsonInline);
else if (jsonFile) filePayload = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

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

const notionToken = process.env.NOTION_TOKEN?.trim();
const webhook = process.env.OPS_WEBHOOK_URL?.trim();
const config = loadConfig();
const opsDbId =
  process.env.NOTION_OPS_DATABASE_ID?.trim() ||
  config?.ops?.databaseId ||
  '';

async function postNotionOps() {
  const title = payload.title || `${payload.event} — ${payload.date}`;
  const type = ['weekly_seo', 'landing_indexed', 'seo_auto_complete'].includes(payload.event)
    ? payload.event
    : 'seo_auto_complete';

  const body = {
    parent: { database_id: opsDbId },
    properties: {
      Name: { title: [{ text: { content: title.slice(0, 2000) } }] },
      Type: { select: { name: type } },
      Status: { select: { name: 'Todo' } },
      Due: { date: { start: payload.date } },
      URLs: {
        rich_text: [
          {
            text: {
              content: (payload.urls.join('\n') || payload.site).slice(0, 2000),
            },
          },
        ],
      },
      Checklist: {
        rich_text: [
          {
            text: {
              content: (payload.checklist.map((c) => `• ${c}`).join('\n') || '—').slice(
                0,
                2000,
              ),
            },
          },
        ],
      },
      Notes: {
        rich_text: [{ text: { content: `source: ${payload.source}`.slice(0, 2000) } }],
      },
    },
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Notion ${res.status}: ${text.slice(0, 400)}`);
  }

  const page = await res.json();
  console.log(`notify-ops: Notion OK → ${page.url || page.id}`);
}

async function postWebhook() {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`webhook ${res.status}: ${text.slice(0, 200)}`);
  }
  console.log(`notify-ops: webhook OK (${res.status}) event=${payload.event}`);
}

if (notionToken && opsDbId) {
  try {
    await postNotionOps();
    process.exit(0);
  } catch (err) {
    console.error(`notify-ops: Notion failed — ${err.message}`);
    if (!webhook) process.exit(1);
    console.warn('notify-ops: falling back to OPS_WEBHOOK_URL');
  }
}

if (webhook) {
  await postWebhook();
  process.exit(0);
}

console.log(
  'notify-ops: skipped (set NOTION_TOKEN + share Ops DB with the integration, or OPS_WEBHOOK_URL)',
);
process.exit(0);
