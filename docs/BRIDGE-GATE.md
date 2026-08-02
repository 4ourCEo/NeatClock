# BRIDGE pre-deploy gate

Run this checklist before every production deploy to [neatclock.pro](https://neatclock.pro). All automated steps must pass locally (or in CI) before you push or promote a deployment.

## Automated checks

```bash
npm run lint
npm run test        # 185 Vitest unit tests (33 files)
npm run test:e2e    # Playwright: 8 specs × chromium + webkit (see list below)
npm run build
```

Or run unit + E2E together:

```bash
npm run test:all
npm run lint
npm run build
```

**E2E spec files:**

| Spec | Covers |
|------|--------|
| `e2e/schedule-flow.spec.js` | Preset switch, task edit, ICS export, backup download |
| `e2e/theme-swap.spec.js` | Theme picker, dark logo swap (Obsidian) |
| `e2e/backup-roundtrip.spec.js` | JSON backup export and restore |
| `e2e/storage-failure-toast.spec.js` | Quota failure toast when localStorage throws |
| `e2e/print-preview.spec.js` | Print-friendly view opens from export success |
| `e2e/deep-link.spec.js` | `?preset=` deep links and `?fresh=1` override |
| `e2e/brand-banner.spec.js` | B2B co-branding banner rendering |
| `e2e/partner-builder.spec.js` | Partner builder link generation flow |

**Expected counts:** `docs/context.json` → `testCounts.unit` = 185, `testCounts.e2e` = 8 (chromium + webkit). If test counts change, update `context.json` and any `vitest:` / `e2e:` entries in `docs/requirements.json`.

## Manual smoke (production or preview URL)

1. **Logo** — Header shows NeatClock logo; dark theme (Obsidian) swaps to the light logo variant.
2. **Preset** — Click a built-in preset (e.g. Preventive Gearhead); tasks load; active preset label updates; reload persists selection.
3. **Export** — Edit a task name → **Generate & Export .ics** → download `neatclock-schedule.ics`; success modal appears.
4. **Theme** — Open theme picker; switch to Sage Garden; page restyles; reload persists theme.
5. **Backup** (optional) — **Backup schedule** → download `neatclock-backup.json`; restore from file round-trips tasks.

## Production feature flags

Core export and presets stay free. Only deliberately-launched monetization stays on in production — verify against `.env.production` (source of truth), not this table from memory:

| Variable | Production | Notes |
|----------|------------|-------|
| `VITE_FEATURE_NEATCLOCK_PRINTS` | off | blocked on Gumroad products + Vercel Pro, see below |
| `VITE_FEATURE_LOCKSCREEN_GOODIES` | **on** | free lead magnet, launched 2026-07-26 |
| `VITE_FEATURE_PREMIUM_THEMES` | off | |
| `VITE_FEATURE_SPONSOR_FOOTER` | off | |
| `VITE_FEATURE_AFFILIATE_LINKS` | **on** | launched with `/affiliate-disclosure` page + inline link labeling, see `src/config/affiliateHints.js` |

When a flag flips in `.env.production`, update this table in the same commit — it drifted out of sync with reality once already.

Owner preview for gated UI: append `?preview=monetization` locally or on a preview deployment — not required for production gate.

Do **not** enable live Gumroad print CTAs until Vercel is on **Pro** (Hobby is non-commercial only). See `MONETIZATION.md` and `docs/context.json` → `blocked`.

## Traceability

- Acceptance tests: `docs/requirements.json`
- Session context and blockers: `docs/context.json`
- Architectural decisions: `docs/decisions.md`
- Human launch steps: `docs/LAUNCH-CHECKLIST.md`

## Gate pass criteria

- [x] `npm run lint` — no errors
- [x] `npm run test` — 185/185 passed
- [x] `npm run test:e2e` — 8/8 passed (16 runs on chromium + webkit)
- [x] `npm run build` — succeeds, `dist/` generated
- [x] Manual smoke — logo, preset, export, theme OK (covered by E2E test specs)
- [x] `docs/context.json` `testCounts` matches actual test run (if changed)
- [x] Production `VITE_FEATURE_*` matches the table above (verified against `.env.production`)
