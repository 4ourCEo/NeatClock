# NeatClock — Architectural Decisions (ADR-lite)

Decisions captured as of 2026-06-23. Each entry states the choice, context, and consequence.

---

## Generator-only scope

**Decision:** NeatClock is a recurring-calendar **generator**, not a task tracker.

**Context:** Users need to export or print a maintenance schedule and leave — not manage completion state over time.

**Consequence:** No mark-complete, overdue states, streaks, or "come back weekly" flows. Export Preview simulates first occurrences; it is not a to-do list. New features must pass the 60-second export/print decision test in `SCOPE.md`.

---

## localStorage, not backend

**Decision:** All schedule data persists in browser `localStorage`; no user accounts, API, or database.

**Context:** Static SPA on Vercel keeps hosting simple, free-tier friendly, and aligned with "no sign-up" promise.

**Consequence:** No cloud sync or cross-device restore except via manual JSON backup export/import. `storage.js` wraps `localStorage` with try/catch; `persistState` accepts an `onFailure` callback for quota/private-browsing errors.

---

## Feature flags for monetization

**Decision:** Paid extras (prints, premium themes, sponsor footer, affiliate hints, lockscreen goodies) ship **built but disabled** via `VITE_FEATURE_*` env vars.

**Context:** Monetization sits around the export moment; core `.ics` export and presets stay free forever. External checkout (Gumroad, Lemon Squeezy, Stripe Payment Links) — nothing locked to one vendor.

**Consequence:** Production UI stays clean when flags are off (no "Coming soon" cards). Owner preview via `?preview=monetization`. Flip flag + redeploy to launch — no code change required.

---

## Normalize on backup restore

**Decision:** Backup import always runs tasks, presets, and preferences through normalization helpers before applying state.

**Context:** Users may import hand-edited JSON, older backup versions, or corrupted partial data.

**Consequence:** `backup.js` rejects invalid payloads; `normalizeTasks`, `normalizeTask`, and `resolveActivePreset` repair data on restore. Custom presets capped at 50; empty names filtered. Theme validated separately in `App.jsx` via `resolveTheme`.

---

## persistState pattern

**Decision:** Centralize writes through `persistState(state, onFailure)` rather than scattering raw `localStorage.setItem` calls.

**Context:** Storage can throw (quota exceeded, private browsing, Safari ITP).

**Consequence:** Callers receive boolean success/failure and can surface user-facing errors. Tests in `storage.test.js` verify failure paths and callback invocation.

---

## Canva PNG transparent for logos

**Decision:** Export brand logos from Canva as **PNG with transparent background**, not JPG.

**Context:** JPG cannot preserve transparency; header needs light and dark logo variants over themed backgrounds.

**Consequence:** Source assets in `design-system/brand-assets/`; web copies in `public/logo.png` and `public/logo-light.png`. Header swaps variant for dark themes. Gumroad print deliverables are separate from in-app UI themes.

---

## Agenda reframed as Export Preview

**Decision:** Sidebar shows first-occurrence simulation labeled "Export Preview," not an agenda or task list.

**Context:** Scope contract forbids task-tracking UX patterns that imply ongoing completion management.

**Consequence:** Copy and UI avoid checkboxes, overdue badges, or completion states.

---

## Short display labels on preset cards

**Decision:** Preset cards may show short labels (e.g. "Home Sentinel") while storage, modals, and monetization keep full preset names.

**Context:** Card UI needs brevity; preset matching for print upsells requires exact names.

**Consequence:** `resolveActivePreset` and monetization `presetMatch` use full names; display layer maps to short labels only.
