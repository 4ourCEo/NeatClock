# NeatClock 📅

> A minimalist, zero-friction **recurring calendar generator** — live on the web at [neatclock.pro](https://neatclock.pro). No sign-up required.

NeatClock helps you generate recurring schedule files (`.ics`) for your home, car, or freelance tax obligations in under 60 seconds. Customize your tasks, export them straight to Google Calendar, Apple Calendar, or Outlook, and carry on with your day.

---

## ⚡ Core Philosophy: Generator, Not a Tracker
NeatClock is built to be a **one-time utility, not a checklist application**.
*   **No User Accounts:** No email sign-ups, passwords, or databases.
*   **Zero Creep:** No task completion tracking, overdue badges, streaks, or notification alerts.
*   **Total Privacy:** All of your data resides locally in your browser's `localStorage`. Clearing your browser data removes it.

---

## ✨ Features

*   **Tailored Presets:** Includes three high-intent presets to get started immediately:
    *   🏠 **Homeowner's Sentinel** (HVAC filter, gutter cleaning, smoke alarm checks)
    *   🚗 **Preventive Gearhead** (Oil change, tire rotations, cabin filter replacement)
    *   💼 **Automated CFO** (Quarterly taxes, bookkeeping reviews, subscription cleanups)
*   **Natural Language Frequency:** Add or edit tasks using plain English (e.g., `"Change furnace filter every 3 months"`, `"Rotate tires every 6 months"`).
*   **Universal ICS Export:** Generates standard, cross-platform iCalendar (`.ics`) files as all-day recurring events.
*   **Print-Friendly View:** Instantly generates a clean, minimalist paper checklist formatted for your fridge, office, or garage wall.
*   **Backup & Restore:** Export your configured schedule as a clean `neatclock-backup.json` file and restore it on any device.
*   **Preset Deep Links:** Share custom schedule setups using simple query parameters:
    *   `https://neatclock.pro/?preset=home`
    *   `https://neatclock.pro/?preset=gearhead`
    *   `https://neatclock.pro/?preset=cfo`
    *   *Append `&fresh=1` to force-override existing local configurations.*

---

## 🛠 Tech Stack & Architecture

NeatClock is a static Single Page Application (SPA) designed to load instantly and run at $0 hosting cost:
*   **Frontend:** React 19 + Vite 8
*   **Styling:** Tailwind CSS v4 + Vanilla CSS tokens (using Google Fonts: *Outfit* & *Playfair Display*)
*   **Test Suite:** 85 Vitest unit/integration tests & 16 Playwright E2E tests (configured for Chromium + WebKit)
*   **SEO & AI Discovery:** Includes custom JSON-LD schemas (`WebApplication` & `FAQPage`), static crawlable landing pages, a sitemap, and LLM-friendly documentation (`llms.txt` & `llms-full.txt`) for AI search engines.

---

## 🚀 Development & Testing

Run the application locally on your machine:

```bash
# Install dependencies
npm install

# Run local development server (with HMR)
npm run dev

# Run code linter
npm run lint

# Run Vitest unit & integration tests
npm run test

# Run Playwright end-to-end integration tests
npm run test:e2e

# Run all verification checks (lint, unit, e2e, build)
npm run go-live:check
```

---

## 📦 Production Deployment

NeatClock compiles to a static bundle in `dist/` and is fully ready to deploy to **Vercel** (recommended), Netlify, or Cloudflare Pages.

### Environment variables
Configure these in your host dashboard to enable live analytics and feedback features:

| Environment Variable | Description |
|---|---|
| `VITE_SITE_URL` | Set to `https://neatclock.pro` for canonical tags and metadata. |
| `VITE_PLAUSIBLE_DOMAIN` | Set to `neatclock.pro` to enable privacy-friendly page analytics. |
| `VITE_INTEREST_FORM_EMAIL` | Set to your email to enable waitlist submissions (routed via FormSubmit). |
| `VITE_INTEREST_FORM_ENDPOINT` | Set to your Formspree endpoint (e.g. `https://formspree.io/f/xxxx`). |

### Feature-Flagged Monetization
Premium features (print shop upsells, lockscreen downloads, sponsorship banners) are built-in but feature-flagged off by default. To preview or launch them, consult [FEATURES.md](./FEATURES.md) and [MONETIZATION.md](./MONETIZATION.md).

---

## 📄 License
MIT License. Free and open source forever.
