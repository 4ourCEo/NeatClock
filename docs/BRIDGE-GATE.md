# BRIDGE pre-deploy gate

Run this checklist before every production deploy to [neatclock.vercel.app](https://neatclock.vercel.app). All automated steps must pass locally (or in CI) before you push or promote a deployment.

## Automated checks

```bash
npm run lint
npm run test        # 77 Vitest unit tests (12 files)
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

**Expected counts:** `docs/context.json` → `testCounts.unit` = 77, `testCounts.e2e` = 8 (chromium + webkit). If test counts change, update `context.json` and any `vitest:` / `e2e:` entries in `docs/requirements.json`.

## Manual smoke (production or preview URL)

1. **Logo** — Header shows NeatClock logo; dark theme (Obsidian) swaps to the light logo variant.
2. **Preset** — Click a built-in preset (e.g. Preventive Gearhead); tasks load; active preset label updates; reload persists selection.
3. **Export** — Edit a task name → **Generate & Export .ics** → download `neatclock-schedule.ics`; success modal appears.
4. **Theme** — Open theme picker; switch to Sage Garden; page restyles; reload persists theme.
5. **Backup** (optional) — **Backup schedule** → download `neatclock-backup.json`; restore from file round-trips tasks.

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
- Human launch steps: `docs/LAUNCH-CHECKLIST.md`

## Gate pass criteria

- [ ] `npm run lint` — no errors
- [ ] `npm run test` — 56/56 passed
- [ ] `npm run test:e2e` — 5/5 passed
- [ ] `npm run build` — succeeds, `dist/` generated
- [ ] Manual smoke — logo, preset, export, theme OK
- [ ] `docs/context.json` `testCounts` matches actual test run (if changed)
- [ ] Production `VITE_FEATURE_*` verified off
