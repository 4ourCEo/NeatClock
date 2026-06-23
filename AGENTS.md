## Learned User Preferences

- Keep NeatClock small and focused; avoid scope creep into a large app or full task tracker for a simple recurring-calendar problem.
- Chose generator-only (export `.ics`/print, then leave) over light tracking or completion history, even without sign-up.
- Prefer simple, plain-language plans before implementation so product decisions are clear and reversible.
- NeatClock is a public web app; describe it as on the internet with data saved on the user's device, not as a local-only desktop tool.
- Build optional monetization and future features now but ship them disabled until ready (env-based feature flags, not paywalls on core export).
- Monetization should use external checkout links (Gumroad, Lemon Squeezy, Stripe Payment Links, etc.); nothing in the app is locked to Gumroad.
- Core `.ics` export and presets stay free forever; paid extras (prints, themes, sponsors) sit around the export moment.
- Prefer minimal, targeted UI changes; when user asks to fix one label, do not rename or restructure all presets.
- App themes are UI-only and separate from Gumroad print deliverables; clarify in Gumroad README rather than removing the theme selector.
- Print upsell copy should be preset-specific and functional (e.g. garage-ready for gearheads), not generic aesthetic language like "prettier."
- Prefer short, on-brand custom domains (e.g. `neatclock.app`) over long descriptive alternatives.
- Export Canva brand logos as PNG with transparent background, not JPG (JPG cannot preserve transparency).

## Learned Workspace Facts

- NeatClock is a static React 19 + Vite 8 + Tailwind v4 SPA; no backend, no user accounts; schedules persist in browser `localStorage`.
- Product scope is documented in `SCOPE.md`: generator only, no mark-complete, overdue states, cloud sync, or push notifications.
- Monetization is feature-flagged via `VITE_FEATURE_*` env vars; catalog in `src/config/monetization.js`; docs in `FEATURES.md` and `MONETIZATION.md`.
- Production: https://neatclock.vercel.app; GitHub `4ourCEo/NeatClock`; target custom domain `neatclock.app` (Vercel Domains recommended for easiest wiring).
- Three built-in presets: Homeowner's Sentinel, Preventive Gearhead, Automated CFO; plus user-saved custom presets.
- Agenda sidebar was reframed as "Export Preview" (first-occurrence simulation, not a to-do list).
- Vitest covers ICS builder and backup utilities; principal code review via `CODE-REVIEW-PROMPT.md` and `.cursor/rules/code-review.mdc`; run `npm run lint`, `npm run test`, `npm run build` before deploy.
- Print pack default pricing is $5 per pack and $12 for the bundle (overridable via `VITE_PRINTS_*_PRICE`).
- In-app brand assets: source logos in `design-system/brand-assets/` (PNG transparent); web copies in `public/` (`logo.png`, `logo-light.png`, favicons, `og-image.png`); header swaps logo for dark themes. Gumroad print deliverables are separate per `design-system/BRAND-BRIEF.md`.
- Free NeatClock is deploy-ready; interest form (`VITE_INTEREST_FORM_ENDPOINT`) validates print demand until prints go live; keep paid print CTAs disabled until Gumroad ZIPs and product URLs exist.
- Preset cards may use short display labels (e.g. "Home Sentinel") while storage, modals, and monetization keep full preset names.
- Upgrade Vercel to Pro before enabling live Gumroad print CTAs; Hobby plan is non-commercial only.
