# Traffic scoreboard

Fill daily from Plausible (https://plausible.io) after deploy. Goal: 7 consecutive dated rows.

| Date | Sessions | Top landing path | ICS exports | Interest submits | Share copies | Notes |
|------|----------|------------------|-------------|------------------|--------------|-------|
| 2026-08-10 | 1 | / | 0 | 0 | 0 | auto |
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

## GSC checklist

1. Property: `https://neatclock.pro`
2. Sitemaps → submit `https://neatclock.pro/sitemap.xml`
3. URL Inspection → request indexing for `/` and every landing in the sitemap

## Post-deploy status (2026-08-02)

- [x] Production deploy aliased to `neatclock.pro` (`0ba294a`)
- [x] IndexNow submitted **12** sitemap URLs
- [x] `npm run check:seo-live` passed (Plausible on homepage + landings; `.html` → clean 308)
- [x] Plausible site `neatclock.pro` receiving events; custom goals enabled (2026-08-10)
- [x] GSC Inspect (2026-08-10): sitemap Success; `/` + `/smoke-detector-reminder-calendar` **on Google**; requested indexing for `/guides`, `/home-maintenance-calendar`, `/hvac-filter-reminder-calendar`, `/recurring-ics-calendar-generator`, `/google-calendar-recurring-events`, `/car-maintenance-schedule-ics`, `/freelancer-quarterly-tax-reminders`, `/oil-change-reminder-calendar`, `/partner`, `/llms.txt`
- [ ] Human: start Mon/Wed/Fri posts per `docs/DISTRIBUTION-WEEKLY.md` (checklist: [seo-weekly issues](https://github.com/4ourCEo/NeatClock/issues?q=label%3Aseo-weekly))
- [x] `PLAUSIBLE_API_KEY` Actions secret set → weekly auto-fill via `npm run seo:scoreboard`
- Automation playbook: `docs/SEO-AUTOMATION.md` · Ops: `docs/OPS-AUTOMATION.md` (GitHub Issues — no Notion Add-connections required)

## 10x discovery push (2026-08-02)

- [x] Trailing-slash → clean URL (308) via `vercel.json`
- [x] Visible FAQ on landings with `FAQPage` schema
- [x] Organization + WebSite schema on homepage; expanded noscript guides
- [x] `/guides` hub + 8 long-tail landings (oil, tires, water heater, gutters, dryer vent, quarterly tax, subscription audit, Google Calendar)
- [x] GSC Inspect for `/guides` + high-intent landings (2026-08-10); chore chart requested; **daily quota hit** on `/recurring-task-reminder-app` — finish remaining tomorrow
- [ ] Human: Mon/Wed/Fri distribution — link `/guides` + one intent landing each post
