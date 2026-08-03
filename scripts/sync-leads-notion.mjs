#!/usr/bin/env node
/**
 * Pull new Formspree submissions into Notion Leads DB.
 *
 * Env:
 *   FORMSPREE_API_KEY
 *   FORMSPREE_FORM_ID          (default xqevpwlb)
 *   NOTION_TOKEN
 *   NOTION_LEADS_DATABASE_ID   (optional; docs/notion-config.json)
 *
 * Stores last sync cursor in docs/.formspree-leads-sync.json (committed by Actions).
 */
import fs from 'node:fs';
import path from 'node:path';

const FORM_ID = process.env.FORMSPREE_FORM_ID?.trim() || 'xqevpwlb';
const apiKey = process.env.FORMSPREE_API_KEY?.trim();
const notionToken = process.env.NOTION_TOKEN?.trim();
const cursorPath = path.join('docs', '.formspree-leads-sync.json');
const configPath = path.join('docs', 'notion-config.json');

if (!apiKey || !notionToken) {
  console.log(
    'sync-leads: skipped (need FORMSPREE_API_KEY and NOTION_TOKEN)',
  );
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const leadsDbId =
  process.env.NOTION_LEADS_DATABASE_ID?.trim() || config.leads.databaseId;

let since = null;
if (fs.existsSync(cursorPath)) {
  try {
    since = JSON.parse(fs.readFileSync(cursorPath, 'utf8')).since || null;
  } catch {
    since = null;
  }
}

const qs = new URLSearchParams({ limit: '50', order: 'asc' });
if (since) qs.set('since', since);

const listRes = await fetch(
  `https://formspree.io/api/0/forms/${FORM_ID}/submissions?${qs}`,
  { headers: { Authorization: `Bearer ${apiKey}` } },
);

if (!listRes.ok) {
  console.error(`sync-leads: Formspree ${listRes.status}`);
  process.exit(1);
}

const listJson = await listRes.json();
const submissions = listJson.submissions || listJson.data || listJson || [];
const rows = Array.isArray(submissions) ? submissions : [];

let newest = since;
let created = 0;

for (const row of rows) {
  const data = row.data || row;
  const submittedAt = row.submitted_at || row.date || data._date || new Date().toISOString();
  const email = String(data.email || '(not provided)').slice(0, 200);
  const preset = String(data.preset || '').slice(0, 500);
  const interests = String(data.interests || '').slice(0, 500);
  const intent = ['yes', 'maybe', 'no'].includes(data.purchase_intent)
    ? data.purchase_intent
    : null;
  const source = ['footer', 'export'].includes(data.source) ? data.source : null;
  const day = String(submittedAt).slice(0, 10);

  const body = {
    parent: { database_id: leadsDbId },
    properties: {
      Email: { title: [{ text: { content: email } }] },
      'Contact Email': email.includes('@') ? { email } : { email: null },
      Preset: { rich_text: [{ text: { content: preset || '—' } }] },
      Interests: { rich_text: [{ text: { content: interests || '—' } }] },
      Submitted: { date: { start: day } },
    },
  };
  if (intent) body.properties.Intent = { select: { name: intent } };
  if (source) body.properties.Source = { select: { name: source } };

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
    console.error(`sync-leads: Notion fail ${res.status} ${text.slice(0, 200)}`);
    process.exit(1);
  }
  created += 1;
  if (!newest || submittedAt > newest) newest = submittedAt;
}

if (newest) {
  fs.writeFileSync(cursorPath, `${JSON.stringify({ since: newest }, null, 2)}\n`);
}

console.log(`sync-leads: created ${created} Notion lead(s); since=${newest || 'n/a'}`);
