# Weekly distribution (organic)

Max **3 posts/week**. Always link an **intent landing** (or preset deep link with UTMs) — not only the homepage.

## Cadence

| Day | Channel | Destination | Notes |
|-----|---------|-------------|-------|
| Mon | Pinterest | `/home-maintenance-calendar` or kit pin URL | Use `videos/sunday-reset-home/METADATA.json` pin copy; UTM `utm_source=pinterest&utm_medium=social&utm_campaign=sunday_reset_home` |
| Wed | Reddit (value post) | Matching landing (`/hvac-filter-reminder-calendar`, `/car-maintenance-schedule-ics`, or `/freelancer-quarterly-tax-reminders`) | r/homeowners, r/MechanicAdvice, or r/freelance — tool post, not spam; disclose if asked |
| Fri | TikTok / YouTube Shorts | Intent landing from regenerated kit CTA | Follow `STORYBOARD.md` in `videos/sunday-reset-*`; 30–45s screen record |

## UTM convention

```
utm_source=<tiktok|pinterest|reddit|youtube>
utm_medium=social
utm_campaign=sunday_reset_<home|gearhead|cfo>
```

Regenerate kits after script changes:

```bash
npm run campaign:reset -- --preset home
npm run campaign:reset -- --preset gearhead
npm run campaign:reset -- --preset cfo
```

## Do not

- Post the same link+copy to every subreddit the same day
- Use affiliate-first framing in community posts
- Skip Plausible/scoreboard check before scaling volume

## After each post

1. Note date + URL in `docs/TRAFFIC-SCOREBOARD.md` Notes column
2. Next day: check Plausible for the landing path + `landing_cta` / `ics_export`
