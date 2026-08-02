# SEO Automation

Hands-off loop for NeatClock organic traffic. Complements (does not replace) Google Search Console’s human Verify/Inspect steps.

## What runs automatically

| Trigger | Workflow / command | Actions |
|---------|-------------------|---------|
| Push to `main` (content paths) | [`.github/workflows/indexnow.yml`](../.github/workflows/indexnow.yml) | Refresh sitemap `lastmod`, commit if needed, IndexNow submit |
| Weekly Wed 15:00 UTC | same IndexNow workflow (schedule) | Re-ping all sitemap URLs |
| Weekly Mon 14:00 UTC | [`.github/workflows/seo-automation.yml`](../.github/workflows/seo-automation.yml) | Full `seo:auto` + commit scoreboard + open distribution checklist issue |
| Manual | Actions → **SEO Automation** → Run workflow | Same as Monday job |

## Local / one-command

```bash
# Full automation (live checks need network)
npm run seo:auto

# Scaffold a new long-tail landing (wires vercel, sitemap, footer, llms)
npm run seo:landing -- \
  --slug oil-change-reminder-calendar \
  --title "Oil Change Reminder Calendar" \
  --preset gearhead \
  --campaign oil_change \
  --lead "Recurring oil-change reminders as a calendar file." \
  --label "Oil change reminders"

# Pull today’s Plausible row into the scoreboard
PLAUSIBLE_API_KEY=xxx npm run seo:scoreboard
```

## GitHub secrets (recommended)

In the repo → **Settings → Secrets and variables → Actions**:

- `PLAUSIBLE_API_KEY` — from Plausible → Settings → API keys (Stats API)
- `OPS_WEBHOOK_URL` — Zapier Catch Hook → Notion Ops (see [`OPS-AUTOMATION.md`](./OPS-AUTOMATION.md))

Without `PLAUSIBLE_API_KEY`, weekly automation still runs live SEO checks + IndexNow; scoreboard auto-fill is skipped. Without `OPS_WEBHOOK_URL`, Zapier/Notion notify steps no-op.

## LLM discovery (public, indexable)

- https://neatclock.pro/llms.txt
- https://neatclock.pro/llms-full.txt
- https://neatclock.pro/catalog.json
- https://neatclock.pro/.well-known/llms.txt

Regenerate after landings change: `npm run seo:llms` (also inside `seo:auto` / `seo:landing`).

## Still human (cannot fully automate)

1. Enable Plausible **Custom events / goals** once (`docs/TRAFFIC-SCOREBOARD.md`)
2. Google Search Console: sitemap ownership + URL Inspection for brand-new URLs
3. Actually posting to Reddit / Pinterest / Shorts (workflow opens a checklist issue + Notion row if Zapier is wired)

Private ops checklist: [`OPS-AUTOMATION.md`](./OPS-AUTOMATION.md).

## Scripts

- [`scripts/seo-automate.mjs`](../scripts/seo-automate.mjs) — orchestrator
- [`scripts/check-seo-live.mjs`](../scripts/check-seo-live.mjs) — production smoke
- [`scripts/submit-indexnow.mjs`](../scripts/submit-indexnow.mjs) — sitemap → IndexNow
- [`scripts/plausible-scoreboard.mjs`](../scripts/plausible-scoreboard.mjs) — API → scoreboard
- [`scripts/sync-llms-catalog.mjs`](../scripts/sync-llms-catalog.mjs) — llms.txt + catalog.json
- [`scripts/notify-ops.mjs`](../scripts/notify-ops.mjs) — Zapier Catch Hook notify
- [`scripts/new-landing.mjs`](../scripts/new-landing.mjs) — landing factory
