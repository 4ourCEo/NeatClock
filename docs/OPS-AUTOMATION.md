# Ops automation (Zapier → Notion) + LLM discovery

NeatClock stays a **static generator**. Secrets never go in `VITE_*`.

| Surface | Audience | Where |
|---------|----------|--------|
| Private ops | You | Formspree → Zapier → Notion |
| Public discovery | Google + LLMs | `llms.txt`, `llms-full.txt`, `catalog.json`, landings, sitemap |

Notion is **not** an SEO surface. Anything AI search should cite must live on `neatclock.pro`.

## One-time setup

### 1. Notion databases

**Leads** (CRM)

| Property | Type |
|----------|------|
| Name / Email | Title or Email |
| Preset | Text |
| Interests | Text |
| Intent | Select (`yes` / `maybe` / `no`) |
| Source | Select (`footer` / `export`) |
| Submitted | Date |

**Ops** (weekly work)

| Property | Type |
|----------|------|
| Name | Title |
| Type | Select (`weekly_seo` / `landing_indexed` / `seo_auto_complete`) |
| Status | Select (`Todo` / `Doing` / `Done`) |
| Due | Date |
| URLs | Text (or URL multi) |
| Checklist | Text |
| Notes | Text |

### 2. Zap A — Interest leads → Notion

1. Zapier trigger: **Formspree — New Submission** (form id `xqevpwlb`)
2. Action: **Notion — Create Database Item** → Leads
3. Map fields from the existing interest payload:

| Form field | Notion |
|------------|--------|
| `email` | Email |
| `preset` | Preset |
| `interests` | Interests |
| `purchase_intent` | Intent |
| `source` | Source |

No NeatClock code changes required — Formspree already receives these fields.

### 3. Zap B / C — Catch Hook → Notion Ops

1. Zapier trigger: **Webhooks by Zapier — Catch Hook**
2. Copy the webhook URL
3. GitHub → repo **Settings → Secrets and variables → Actions** → add:

   - `OPS_WEBHOOK_URL` = that Catch Hook URL
   - (recommended) `PLAUSIBLE_API_KEY` for scoreboard auto-fill

4. Action: **Notion — Create Database Item** → Ops
5. Use Zapier **Paths** or Filter:
   - `event` equals `weekly_seo` → title “SEO distribution week”, paste `checklist` + `urls`
   - `event` equals `landing_indexed` → title “GSC inspect new landings”, paste `urls`
   - (optional) `event` equals `seo_auto_complete` → log-only / archive

### Payload shape (from GitHub Actions)

```json
{
  "event": "weekly_seo",
  "date": "2026-08-02",
  "site": "https://neatclock.pro",
  "title": "SEO distribution week",
  "checklist": ["Mon Pinterest…", "Wed Reddit…"],
  "urls": ["https://neatclock.pro/guides"],
  "source": "github-actions-seo"
}
```

Local dry-run (no Zapier needed until the secret is set):

```bash
npm run ops:notify -- --event weekly_seo --title "test" --url https://neatclock.pro/guides
# → notify-ops: skipped (OPS_WEBHOOK_URL unset)
```

## What fires automatically

| Trigger | Workflow | Event |
|---------|----------|-------|
| Monday 14:00 UTC / manual | [`.github/workflows/seo-automation.yml`](../.github/workflows/seo-automation.yml) | `weekly_seo` (+ GitHub Issue) |
| Push to `main` changing `public/*.html` | [`.github/workflows/indexnow.yml`](../.github/workflows/indexnow.yml) | `landing_indexed` |
| `npm run seo:auto` with secret set | local / CI | `seo_auto_complete` |

## Public LLM discovery (indexable)

Already allowed in [`public/robots.txt`](../public/robots.txt): GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, etc.

| URL | Purpose |
|-----|---------|
| https://neatclock.pro/llms.txt | Short AI summary + every landing |
| https://neatclock.pro/llms-full.txt | Full citation reference |
| https://neatclock.pro/catalog.json | Machine-readable page catalog |
| https://neatclock.pro/.well-known/llms.txt | Alias → `llms.txt` |
| https://neatclock.pro/guides | Human + AI hub of intent pages |
| https://neatclock.pro/sitemap.xml | Canonical URL list |

Keep these in sync after sitemap/landing changes:

```bash
npm run seo:llms
# also runs inside: npm run seo:auto  and  npm run seo:landing
```

Script: [`scripts/sync-llms-catalog.mjs`](../scripts/sync-llms-catalog.mjs).

## Still human

1. Enable Plausible custom-event goals once ([`TRAFFIC-SCOREBOARD.md`](./TRAFFIC-SCOREBOARD.md))
2. Google Search Console URL Inspection for brand-new URLs
3. Actually post Mon/Wed/Fri ([`DISTRIBUTION-WEEKLY.md`](./DISTRIBUTION-WEEKLY.md)) — Notion checkboxes only remind you

Do **not** auto-post to Reddit/Pinterest/TikTok from this stack (spam + ToS risk).
