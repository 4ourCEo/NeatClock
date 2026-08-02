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
- [ ] Human: GSC Inspect for new `/hvac-filter-reminder-calendar`, `/smoke-detector-reminder-calendar`, `/partner`
- [ ] Human: start Mon/Wed/Fri posts per `docs/DISTRIBUTION-WEEKLY.md`
- [ ] Human: fill 7 daily scoreboard rows (or set `PLAUSIBLE_API_KEY` Actions secret → weekly auto-fill via `npm run seo:scoreboard`)
- Automation playbook: `docs/SEO-AUTOMATION.md`
