#!/usr/bin/env node
/**
 * Ops notifier — GitHub Issues first (no Notion "Add connections" needed).
 *
 * Priority:
 *   1) GitHub Issue via `gh` / GITHUB_TOKEN  (default, always works in Actions)
 *   2) Notion API if NOTION_TOKEN is set and shared
 *   3) OPS_WEBHOOK_URL Zapier fallback
 *
 * Usage:
 *   node scripts/notify-ops.mjs --event weekly_seo --title "..." --url ... --checklist "..."
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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

const title = payload.title || `${payload.event} — ${payload.date}`;
const checklistLines = payload.checklist.length
  ? payload.checklist.map((c) => `- [ ] ${c}`)
  : ['- [ ] (none)'];
const urlLines = payload.urls.length
  ? payload.urls.map((u) => `- ${u}`)
  : [`- ${payload.site}`];

const body = [
  `**Event:** \`${payload.event}\``,
  `**Date:** ${payload.date}`,
  `**Source:** ${payload.source}`,
  '',
  '### Checklist',
  ...checklistLines,
  '',
  '### URLs',
  ...urlLines,
  '',
  'Playbook: `docs/OPS-AUTOMATION.md` · Distribution: `docs/DISTRIBUTION-WEEKLY.md`',
].join('\n');


function postGitHubIssue() {
  // Prefer gh CLI (local + Actions with gh)
  const label = payload.event === 'landing_indexed' ? 'seo-landing' : 'seo-weekly';
  try {
    execFileSync(
      'gh',
      [
        'label',
        'create',
        label,
        '--description',
        label === 'seo-landing' ? 'New landing index reminder' : 'Weekly SEO ops',
        '--color',
        label === 'seo-landing' ? '1D76DB' : '0E8A16',
        '--force',
      ],
      { stdio: 'ignore' },
    );
  } catch {
    // label may already exist or lack permission — fine
  }

  // Skip duplicate open weekly issues
  if (payload.event === 'weekly_seo') {
    try {
      const open = execFileSync(
        'gh',
        ['issue', 'list', '--state', 'open', '--limit', '20', '--json', 'title,url'],
        { encoding: 'utf8' },
      );
      const issues = JSON.parse(open);
      const hit = issues.find((i) => String(i.title).startsWith('SEO distribution week'));
      if (hit) {
        console.log(`notify-ops: GitHub issue already open → ${hit.url}`);
        return hit.url;
      }
    } catch {
      // continue to create
    }
  }

  const issueTitle =
    payload.event === 'weekly_seo'
      ? `SEO distribution week — ${payload.date}`
      : title.slice(0, 200);

  const created = execFileSync(
    'gh',
    ['issue', 'create', '--title', issueTitle, '--body', body, '--label', label],
    { encoding: 'utf8' },
  ).trim();

  console.log(`notify-ops: GitHub OK → ${created}`);
  return created;
}

async function postNotionOps() {
  const notionToken = process.env.NOTION_TOKEN?.trim();
  const config = loadConfig();
  const opsDbId =
    process.env.NOTION_OPS_DATABASE_ID?.trim() || config?.ops?.databaseId || '';
  if (!notionToken || !opsDbId) return false;

  const type = ['weekly_seo', 'landing_indexed', 'seo_auto_complete'].includes(payload.event)
    ? payload.event
    : 'seo_auto_complete';

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: opsDbId },
      properties: {
        Name: { title: [{ text: { content: title.slice(0, 2000) } }] },
        Type: { select: { name: type } },
        Status: { select: { name: 'Todo' } },
        Due: { date: { start: payload.date } },
        URLs: {
          rich_text: [
            { text: { content: (payload.urls.join('\n') || payload.site).slice(0, 2000) } },
          ],
        },
        Checklist: {
          rich_text: [
            {
              text: {
                content: (payload.checklist.map((c) => `• ${c}`).join('\n') || '—').slice(0, 2000),
              },
            },
          ],
        },
        Notes: {
          rich_text: [{ text: { content: `source: ${payload.source}`.slice(0, 2000) } }],
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`notify-ops: Notion skipped (${res.status}) ${text.slice(0, 160)}`);
    return false;
  }
  const page = await res.json();
  console.log(`notify-ops: Notion OK → ${page.url || page.id}`);
  return true;
}

async function postWebhook() {
  const webhook = process.env.OPS_WEBHOOK_URL?.trim();
  if (!webhook) return false;
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`notify-ops: webhook skipped (${res.status}) ${text.slice(0, 160)}`);
    return false;
  }
  console.log(`notify-ops: webhook OK (${res.status})`);
  return true;
}

// 1) GitHub Issues — always try first
try {
  postGitHubIssue();
} catch (err) {
  console.warn(`notify-ops: GitHub issue failed — ${err.message}`);
}

// 2) Optional Notion / Zapier
await postNotionOps();
await postWebhook();
