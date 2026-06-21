# NeatClock — Scope Contract

**NeatClock is a generator, not a tracker.**

## We build

- Public one-page web app (no sign-up)
- Three starter presets + save-your-own (saved on the user's device)
- Export `.ics` for calendar apps
- Print-friendly checklist view
- Export preview (simulation — not a to-do list)
- JSON backup / restore
- Feature-flagged extras (prints, sponsor, etc.) — off until we flip env vars

## We do not build

- User accounts or cloud sync
- Mark-complete / overdue / task tracking
- Push notifications or “come back weekly” flows
- Backend, API, or database (for the free tool)

## Decision test

Before adding any feature, ask: **Does this help someone export or print their schedule in under 60 seconds?**

If no → skip it, or build it behind a feature flag for later.

## Launching blocked features

See [FEATURES.md](./FEATURES.md). Set `VITE_FEATURE_*=true` on the host and redeploy — no code change.
