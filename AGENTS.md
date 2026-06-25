## Learned User Preferences

- Keep NeatClock small and generator-only (export `.ics`/print, then leave)—avoid scope creep into tracking, accounts, or a full task app.
- Prefer simple, plain-language plans before implementation so product decisions are clear and reversible.
- NeatClock is a public web app; describe it as on the internet with data saved on the user's device, not as a local-only desktop tool.
- Build optional monetization now but ship disabled (env feature flags, not paywalls on core export); external checkout links only—nothing locked to Gumroad.
- Core `.ics` export and presets stay free forever; paid extras (prints, themes, sponsors) sit around the export moment.
- Prefer minimal, targeted UI changes; when user asks to fix one label, do not rename or restructure all presets.
- App themes are UI-only and separate from Gumroad print deliverables; clarify in Gumroad README rather than removing the theme selector.
- Print upsell copy should be preset-specific and functional (e.g. garage-ready for gearheads), not generic aesthetic language like "prettier."
- Prefer short, on-brand custom domains (e.g. `neatclock.app`) over long descriptive alternatives.
- Export Canva brand logos as PNG with transparent background, not JPG (JPG cannot preserve transparency).
- Use subagents for parallel optional slices; when user says "proceed," finish with commit, push, and deploy.
- Prefer brutally honest senior-dev/PM reviews; before more code, prioritize domain, interest form, analytics, then SEO and ICS reliability—not more App.jsx refactors pre-PMF.

## Learned Workspace Facts

- NeatClock is a static React 19 + Vite 8 + Tailwind v4 SPA; scope in `SCOPE.md` (generator only, no accounts/backend; schedules in browser `localStorage`).
- Monetization is feature-flagged via `VITE_FEATURE_*` env vars; catalog in `src/config/monetization.js`; docs in `FEATURES.md` and `MONETIZATION.md`.
- Production: https://neatclock.vercel.app; GitHub `4ourCEo/NeatClock`; target custom domain `neatclock.app` (available, not purchased; Vercel Domains recommended).
- Three built-in presets: Homeowner's Sentinel, Preventive Gearhead, Automated CFO; plus user-saved custom presets.
- Agenda sidebar was reframed as "Export Preview" (first-occurrence simulation, not a to-do list).
- 77 Vitest tests (12 files, including hooks), 5 Playwright E2E specs (chromium + webkit), GitHub Actions CI on push/PR; `npm run test:all` before ship; review via `CODE-REVIEW-PROMPT.md`, `DEBUG-RCA-PROMPT.md`, and `.cursor/rules/code-review.mdc`.
- BRIDGE workflow (`docs/requirements.json`, `docs/context.json`, `docs/decisions.md`, `docs/BRIDGE-GATE.md`); `App.jsx` ~262-line orchestrator with UI in `src/hooks/` and `src/components/`—keep test counts in sync (docs drift is a known issue).
- Print pack default pricing is $5 per pack and $12 for the bundle (overridable via `VITE_PRINTS_*_PRICE`).
- In-app brand assets: source logos in `design-system/brand-assets/` (PNG transparent); web copies in `public/` (`logo.png`, `logo-light.png`, favicons, `og-image.png`); header swaps logo for dark themes. Gumroad print deliverables are separate per `design-system/BRAND-BRIEF.md`.
- Interest form UI exists; `VITE_INTEREST_FORM_ENDPOINT` not wired until Formspree/FormSubmit is set—validates print demand before Gumroad goes live.
- Preset cards may use short display labels (e.g. "Home Sentinel") while storage, modals, and monetization keep full preset names.
- Upgrade Vercel to Pro before enabling live Gumroad print CTAs; Hobby plan is non-commercial only.
