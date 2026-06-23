# BRIDGE pre-deploy gate

Run this checklist before every production deploy to [neatclock.vercel.app](https://neatclock.vercel.app). All automated steps must pass locally (or in CI) before you push or promote a deployment.

## Automated checks

```bash
npm run lint
npm run test        # 36 Vitest unit tests (5 files)
npm run test:e2e    # Playwright: e2e/schedule-flow.spec.js
npm run build
```

Or run unit + E2E together:

```bash
npm run test:all
npm run lint
npm run build
```

**Expected counts:** `docs/context.json` → `testCounts.unit` = 36, `testCounts.e2e` = 1. If test counts change, update `context.json` and any `vitest:` / `e2e:` entries in `docs/requirements.json`.

## Manual smoke (production or preview URL)

1. **Logo** — Header shows NeatClock logo; dark theme (Obsidian) swaps to the light logo variant.
2. **Preset** — Click a built-in preset (e.g. Preventive Gearhead); tasks load; active preset label updates; reload persists selection.
3. **Export** — Edit a task name → **Generate & Export .ics** → download `neatclock-schedule.ics`; success modal appears.

Optional: **Backup** → download `neatclock-backup.json`.

## Production feature flags

Core export and presets stay free. Monetization UI must stay **hidden** on production until deliberately launched.

In **Vercel → Project → Settings → Environment Variables** (Production), confirm all `VITE_FEATURE_*` flags are **unset or `false`**:

| Variable | Production |
|----------|------------|
| `VITE_FEATURE_NEATCLOCK_PRINTS` | off |
| `VITE_FEATURE_LOCKSCREEN_GOODIES` | off |
| `VITE_FEATURE_PREMIUM_THEMES` | off |
| `VITE_FEATURE_SPONSOR_FOOTER` | off |
| `VITE_FEATURE_AFFILIATE_LINKS` | off |

Owner preview for gated UI: append `?preview=monetization` locally or on a preview deployment — not required for production gate.

Do **not** enable live Gumroad print CTAs until Vercel is on **Pro** (Hobby is non-commercial only). See `MONETIZATION.md` and `docs/context.json` → `blocked`.

## Traceability

- Acceptance tests: `docs/requirements.json`
- Session context and blockers: `docs/context.json`
- Architectural decisions: `docs/decisions.md`

## Gate pass criteria

- [ ] `npm run lint` — no errors
- [ ] `npm run test` — 36/36 passed
- [ ] `npm run test:e2e` — 1/1 passed
- [ ] `npm run build` — succeeds, `dist/` generated
- [ ] Manual smoke — logo, preset, export OK
- [ ] `docs/context.json` `testCounts` matches actual test run (if changed)
- [ ] Production `VITE_FEATURE_*` verified off
