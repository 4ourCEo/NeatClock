# Changelog

All notable changes to NeatClock are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — 2026-06-25

### Added — Premium UI Features
- **Yearly Calendar Preview Dashboard** — interactive "Time Horizon" grid (`CalendarPreview.jsx`) shows when each recurring task falls across the next 12 months; toggleable from the Export Preview panel
- **Schedule Friction / Health Score** — `FrictionScore.jsx` calculates a real-time weighted load index across all active tasks (Low / Medium / High / Critical), with a hover tooltip explaining the calculation
- **SVG Morphing Checkboxes** — `TaskTable.jsx` now renders animated SVG path morphing (circle → checkmark) when toggling a task's completed state
- **Liquid Theme Transitions** — switching themes now triggers a View Transitions API ripple/cross-fade on browsers that support it (`App.jsx`)
- **Print Preview Page Flip** — entering/exiting Printer Friendly View uses a CSS 3D card-flip animation (`index.css`)
- **Task Checked State** — `useScheduleState.js` and `useScheduleBootstrap.js` now persist a `checked` boolean per task in `localStorage`

### Added — Mobile & Social Improvements
- **Mobile-aware ICS download** (`download.js`) — on iOS/Android, tapping "Generate & Export .ics" now:
  - Tries `navigator.share({files: [icsFile]})` first → native share sheet → Calendar app
  - Falls back to `window.location.href = blobUrl` (no `download` attr) → Safari MIME handler → Calendar sheet
  - Desktop behavior unchanged (Save-As dialog via `<a download>`)
  - Blob revocation delayed 5 s on mobile to prevent iOS async read race
- **Rich OG social card** — `public/og-image.png` replaced with a 1200×630 branded card showing the NeatClock logo, tagline, sub-tagline, preset category pills, and a recurring-event calendar grid motif (Warm Sand palette)
- Added `og:image:alt`, `og:site_name`, `theme-color` (#E07A5F), `apple-mobile-web-app-title`, and `apple-mobile-web-app-capable` meta tags to `index.html` — required by Apple iMessage and Android RCS link preview crawlers
- Added explicit `Content-Type: image/png` and `Cache-Control: public, max-age=86400` Vercel headers for `og-image.png` to prevent CDN cold misses during social crawl

### Fixed — Mobile Layout & UI Polish
- **Singular/plural unit display** — "Every 1 months" → "Every 1 month"; "Every 1 weeks" → "Every 1 week" — fixed in print preview (`TaskTable.jsx`), NL input confirmation (`ExportPanel.jsx`), and unit select option labels
- **Theme picker invisible on dark themes** — `.theme-picker` now has an explicit `background-color: var(--theme-card)`, `border`, and `box-shadow` in `index.css`; removed redundant `surface-panel` class from `AppHeader.jsx`
- **Mobile table overflow** — calendar provider icon links (Google / Outlook / Apple) now use `hidden sm:inline-flex` — hidden on ≤640 px viewports to prevent horizontal overflow on 375–500 px screens
- **FrictionScore tooltip clipping** — tooltip opens downward on mobile (`top-full mt-2`) and upward on desktop (`md:bottom-full md:mb-2`)
- **Frequency cell compaction** — number input and unit select use `task-freq-number` / `task-freq-unit` CSS classes that reduce to 36 px width on sub-480 px screens
- **Responsive table header** — Frequency column and Actions column use responsive widths instead of fixed pixel widths

### Changed
- `vercel.json` — added dedicated header block for `/og-image.png` before the global wildcard headers
- `AppHeader.jsx` — cleaned up theme picker element (removed inline utility classes; CSS handles all styling)
- `CalendarPreview.jsx` and `FrictionScore.jsx` integrated into `App.jsx` orchestration layout
- `PresetSelector.jsx` — short display labels for preset cards (e.g. "Home Sentinel"), full names kept in storage and modals

---

## [1.0.0] — 2026-06-19 (Production Launch)

### Added
- Three built-in presets: Homeowner's Sentinel, Preventive Gearhead, Automated CFO
- Natural language task input with NLP parsing and animated confirmation preview
- `.ics` export (RFC 5545 compliant, all-day recurring events, Google / Outlook / Apple calendar deep-links)
- Export Preview sidebar showing first-occurrence simulation for all tasks
- JSON backup & restore
- Printer Friendly View with full task table
- Six UI themes: Warm Sand (default), Sage Garden, Obsidian Minimal, Forest Moss, Midnight Dark, Blush Linen
- Drag-and-drop task reorder (desktop) and up/down buttons (mobile/touch)
- Share URL deep-link encoding of active schedule
- Custom preset save/load/delete
- Start Offset control (schedule first occurrence 1–12 weeks out)
- Plausible Analytics integration (privacy-first, cookie-free)
- Vitest unit test suite (85 tests across 15 files)
- Playwright E2E specs (8 specs × 2 browsers)
- GitHub Actions CI on push/PR
- Vercel deployment with custom domain `neatclock.pro`
- `SCOPE.md`, `FEATURES.md`, `MONETIZATION.md`, `BRIDGE-GATE.md` documentation
- `AGENTS.md` with AI-assisted engineering rigor guidelines and agent skill references

### Fixed
- Primary button contrast across all 6 themes (`--theme-accent-text` variable per theme)
- Print-preview mode button visibility — accent colors preserved in `@media print` overrides

---

*NeatClock is a free, open-source recurring calendar generator. Core `.ics` export stays free forever.*
