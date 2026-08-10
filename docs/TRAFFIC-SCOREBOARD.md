# Traffic scoreboard

Fill daily from Plausible (https://plausible.io) after deploy. Goal: 7 consecutive dated rows.

| Date | Sessions | Top landing path | ICS exports | Interest submits | Share copies | Notes |
|------|----------|------------------|-------------|------------------|--------------|-------|
| YYYY-MM-DD | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |

## Plausible goals to enable (Custom events)

- `ics_export`
- `interest_submit`
- `preset_deep_link`
- `share_link_copy`
- `landing_cta`
- `qr_sync_shown`
- `partner_link_copy`
- `backup_export`

## GSC checklist

1. Property: `https://neatclock.pro`
2. Sitemaps → submit `https://neatclock.pro/sitemap.xml`
3. URL Inspection → request indexing for `/` and every landing in the sitemap

## Post-deploy status (2026-08-02)

- [x] Production deploy aliased to `neatclock.pro` (`0ba294a`)
- [x] IndexNow submitted **12** sitemap URLs
- [x] `npm run check:seo-live` passed (Plausible on homepage + landings; `.html` → clean 308)
- [ ] Human: enable Plausible custom-event goals (list above)
- [x] GSC Inspect (2026-08-10): sitemap Success; `/` + `/smoke-detector-reminder-calendar` **on Google**; requested indexing for `/guides`, `/home-maintenance-calendar`, `/hvac-filter-reminder-calendar`, `/recurring-ics-calendar-generator`, `/google-calendar-recurring-events`, `/car-maintenance-schedule-ics`, `/freelancer-quarterly-tax-reminders`, `/oil-change-reminder-calendar`, `/partner`, `/llms.txt`
- [ ] Human: start Mon/Wed/Fri posts per `docs/DISTRIBUTION-WEEKLY.md` (checklist: [seo-weekly issues](https://github.com/4ourCEo/NeatClock/issues?q=label%3Aseo-weekly))
- [ ] Human: fill 7 daily scoreboard rows (or set `PLAUSIBLE_API_KEY` Actions secret → weekly auto-fill via `npm run seo:scoreboard`)
- Automation playbook: `docs/SEO-AUTOMATION.md` · Ops: `docs/OPS-AUTOMATION.md` (GitHub Issues — no Notion Add-connections required)

## 10x discovery push (2026-08-02)

- [x] Trailing-slash → clean URL (308) via `vercel.json`
- [x] Visible FAQ on landings with `FAQPage` schema
- [x] Organization + WebSite schema on homepage; expanded noscript guides
- [x] `/guides` hub + 8 long-tail landings (oil, tires, water heater, gutters, dryer vent, quarterly tax, subscription audit, Google Calendar)
- [x] GSC Inspect for `/guides` + high-intent landings (2026-08-10) — remaining long-tails tomorrow if quota resets
- [ ] Human: Mon/Wed/Fri distribution — link `/guides` + one intent landing each post
