# Traffic scoreboard

Fill daily from Plausible (https://plausible.io) after deploy. Goal: 7 consecutive dated rows.

| Date | Sessions | Top landing path | ICS exports | Interest submits | Share copies | Notes |
|------|----------|------------------|-------------|------------------|--------------|-------|
| 2026-08-10 | 1 | / | 0 | 0 | 0 | setup ping (not organic) |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |

## Plausible goals (enabled 2026-08-10)

- [x] `ics_export`
- [x] `interest_submit`
- [x] `preset_deep_link`
- [x] `share_link_copy`
- [x] `landing_cta`
- [x] `qr_sync_shown`
- [x] `partner_link_copy`
- [x] `backup_export`
- [ ] `print_cta_click`
- [ ] `feedback_open`
- [ ] `feedback_submit`

## GSC checklist

1. Property: `https://neatclock.pro`
2. Sitemaps → submit `https://neatclock.pro/sitemap.xml`
3. URL Inspection → request indexing for `/` and every landing in the sitemap

## Post-deploy status (2026-08-02)

- [x] Production deploy aliased to `neatclock.pro`
- [x] IndexNow key live; sitemap has **22** URLs
- [x] `npm run check:seo-live` passed (Plausible on homepage + landings; `.html` → clean 308)
- [x] Plausible site `neatclock.pro` receiving events; custom goals enabled (2026-08-10)
- [x] GSC sitemap `/sitemap.xml` **Success**, 22 discovered (last read Aug 10). Pages report still **1 indexed / 23 not indexed** (last update Aug 6 — lags URL Inspection). URL Inspection: `/` + `/smoke-detector-reminder-calendar` on Google; indexing requested for high-intent landings; daily quota hit on `/recurring-task-reminder-app`
- [ ] Human: start Mon/Wed/Fri posts per `docs/DISTRIBUTION-WEEKLY.md` (checklist: [seo-weekly issues](https://github.com/4ourCEo/NeatClock/issues?q=label%3Aseo-weekly))
- [x] `PLAUSIBLE_API_KEY` Actions secret set → weekly auto-fill via `npm run seo:scoreboard`
- Automation playbook: `docs/SEO-AUTOMATION.md` · Ops: `docs/OPS-AUTOMATION.md` (GitHub Issues — no Notion Add-connections required)

## Post #15 (2026-09-12)

- [x] Prints secondary CTAs live on three preset landings (Homeowner's Sentinel, Preventive Gearhead, Automated CFO)
- [x] IndexNow + `npm run check:seo-live` green
- **Plausible Stats API currently 402 locked (missing subscription)** — scoreboard auto-fill via `npm run seo:scoreboard` fails until plan renewed

## 10x discovery push (2026-08-02)

- [x] Trailing-slash → clean URL (308) via `vercel.json`
- [x] Visible FAQ on landings with `FAQPage` schema
- [x] Organization + WebSite schema on homepage; expanded noscript guides
- [x] `/guides` hub + 8 long-tail landings (oil, tires, water heater, gutters, dryer vent, quarterly tax, subscription audit, Google Calendar)
- [x] GSC Inspect for `/guides` + high-intent landings (2026-08-10); chore chart requested; **daily quota hit** on `/recurring-task-reminder-app` — finish remaining tomorrow
- [ ] Human: Mon/Wed/Fri distribution — link `/guides` + one intent landing each post
