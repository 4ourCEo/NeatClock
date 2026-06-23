# NeatClock — Brand Brief & Canva Prompts

Use this file for **Canva logo/brand kit** creation and the **Gumroad print pack** workflow.  
In-app UI themes are separate from print/Gumroad deliverables — see [AGENTS.md](../AGENTS.md).

**Live app:** https://neatclock.vercel.app  
**Target domain:** neatclock.app

---

## Brand in one sentence

NeatClock is a calm, minimalist **recurring calendar generator** — pick a preset, export `.ics` or print a checklist in under a minute. Generator, not a task tracker.

---

## Personality & tone

| Do | Don't |
|----|-------|
| Calm, trustworthy, analogue-meets-digital | Startup-neon, SaaS-blue, crypto purple |
| Premium but approachable | Productivity-bro, gamification, hustle culture |
| Editorial, timeless, paper-adjacent warmth | Clip-art clocks, alarm bells, todo checkmarks |
| Functional copy (“garage-ready hardcopy”) | Vague aesthetic fluff (“prettier”) |

**Audiences (presets):** Home Sentinel · Preventive Gearhead · Automated CFO — brand should feel universal.

---

## Color palette (live app — use these in Canva)

| Role | Hex | Usage |
|------|-----|--------|
| Warm sand background | `#F3F1EA` | Primary light BG, print pack pages |
| Card white | `#FFFFFF` | Cards, checklist paper |
| Charcoal text | `#1C1C1C` | Headlines, body |
| Muted text | `#78716C` | Secondary copy |
| Terracotta accent | `#E07A5F` | Logo accent, CTAs, highlights |
| Sage secondary | `#D8E2DC` | Soft fills, dividers |
| Dark mode BG (optional) | `#0C0C0B` | Dark logo variant |
| Dark mode accent (optional) | `#FF8A65` | Dark-mode CTA |

**Print packs:** Design for **B&W print** too — logo/mark must work in single-color black on white (users print free view in B&W via browser).

---

## Typography (live app)

| Role | Font | Notes |
|------|------|--------|
| Display / headlines | **Playfair Display** | Serif, editorial |
| UI / body | **Outfit** | Geometric sans, friendly |

Google Fonts: [Playfair Display + Outfit](https://fonts.google.com/share?selection.family=Outfit:wght@300;400;500;600;700|Playfair+Display:wght@400;500;600;700)

**Wordmark:** `NeatClock` — one word, capital **N** and **C**.

---

## Tagline options (pick one in Canva)

- Recurring schedules, exported in under a minute.
- A minimalist calendar generator — no sign-up required.
- Pick a preset. Export. Done.

---

## Canva prompt — full (Brand Kit / Magic Design)

Copy everything inside the block:

```
Create a complete logo and brand kit for "NeatClock" — a minimalist recurring calendar generator web app.

WHAT IT IS:
NeatClock helps people build repeating schedules (home maintenance, car upkeep, freelance finances), then export to their calendar (.ics) or print a checklist. It is a generator, NOT a task tracker — no accounts, no checkboxes, no gamification, no "productivity bro" energy.

BRAND PERSONALITY:
Calm, trustworthy, analogue-meets-digital. Feels like a well-designed paper planner that lives in your browser. Premium but approachable — for homeowners, gearheads, and freelancers who want order without another app to manage.

VISUAL DIRECTION:
- Style: refined minimalism, soft organic warmth, subtle paper texture (optional)
- Mood: quiet confidence, editorial, timeless — NOT startup-neon, NOT SaaS-blue, NOT crypto/tech purple
- Logo mark ideas: abstract clock face with gentle rhythm/repeat motif; circular calendar ring; minimal monogram "NC"; stacked horizontal lines suggesting recurring intervals — simple enough for 32px favicon
- Wordmark: "NeatClock" as one word, capital N and C; elegant serif for display, clean sans for UI lockups
- Avoid: clip-art clocks, alarm bells, todo checkmarks, rocket ships, mascots, emojis, loud AI gradients

COLOR PALETTE (hex):
Primary light background: #F3F1EA
Card white: #FFFFFF
Primary text: #1C1C1C
Muted text: #78716C
Primary accent / CTA: #E07A5F
Secondary accent: #D8E2DC
Optional dark mode: background #0C0C0B, accent #FF8A65

TYPOGRAPHY:
Headings: Playfair Display
Body/UI: Outfit

DELIVERABLES:
1. Primary logo (icon + wordmark horizontal)
2. Stacked logo (icon above wordmark)
3. Icon-only mark (square, favicon-safe)
4. Monochrome versions (black, white, terracotta-only)
5. Brand color swatches with hex labels
6. Typography pairing sample
7. Social avatar (circle crop)
8. Open Graph image 1200×630 — "NeatClock" + subhead about recurring calendar export on warm sand
9. Business card / one-pager header strip

CONSTRAINTS:
- WCAG-friendly contrast
- Readable on light (#F3F1EA) and dark (#0C0C0B) backgrounds
- Print-friendly B&W for PDF checklist covers
- Domain: neatclock.app
```

---

## Canva prompt — short (quick logo generate)

```
Minimal warm brand for "NeatClock" — calm recurring calendar generator (export .ics, print checklist). Serif + sans wordmark, terracotta #E07A5F on warm sand #F3F1EA, charcoal #1C1C1C. Simple geometric clock/rhythm icon, editorial premium feel, no purple tech look, no todo checkmarks. Favicon, horizontal logo, dark variant, 1200×630 banner.
```

---

## Canva refine prompt (after first pass)

```
Revise: simplify icon for 32px favicon, reduce detail, flatten shadows. Terracotta #E07A5F as only strong accent. Wordmark: Playfair Display feel for display, Outfit for small sizes. Remove purple and electric blue. Add white-knockout version for dark backgrounds.
```

---

## Export checklist from Canva

When Canva is done, export and save with these names:

| Asset | Formats | Sizes |
|-------|---------|-------|
| `logo-horizontal` | PNG (transparent), SVG | ~2000px wide |
| `logo-stacked` | PNG, SVG | |
| `logo-icon` | PNG, SVG | 512, 192, 32 |
| `logo-monochrome-black` | PNG, SVG | |
| `logo-monochrome-white` | PNG, SVG | |
| `og-social` | PNG | 1200×630 |
| `avatar` | PNG | 400×400 |
| `brand-one-pager` | PDF | colors + fonts |

---

## When Canva is done — where to put files & how to hand off

### 1. Drop brand exports here (in repo)

```
design-system/brand-assets/
├── logo-horizontal.svg
├── logo-horizontal.png
├── logo-icon.svg
├── logo-icon-512.png
├── logo-monochrome-black.svg
├── og-social-1200x630.png
└── canva-brand-kit.pdf          # optional full export
```

Create the folder if it doesn’t exist, drag files in, commit optional (PNG/SVG only — no Canva project links required).

**Alternate (outside repo):** `~/Desktop/NeatClock-Gumroad/raw/brand/` — fine if you prefer Desktop workflow.

### 2. Tell the agent (copy-paste this)

When assets are ready, open Cursor and say:

> Canva brand kit is done. Files are in `design-system/brand-assets/` [or `~/Desktop/NeatClock-Gumroad/raw/brand/`].  
> Swap the favicon, update OG meta if needed, and draft Gumroad print pack copy + folder structure for the three presets.

That’s enough for the agent to:

- Replace `public/favicon.svg` (and add PNG sizes if needed)
- Update `index.html` social/OG tags
- Draft Gumroad product titles, descriptions, and README
- Outline print PDF layouts per preset (Home / Gearhead / CFO)
- Prep Vercel env var checklist for when Gumroad links exist

### 3. Optional — share Canva link

If you keep the master in Canva cloud, you can also paste:

- **Canva design share link** (view-only is fine), or  
- **Exported Brand Kit PDF** path  

Say: *“Canva link: …”* — useful for matching print pack layouts to the logo system.

**Do not** commit Canva login credentials or `.env` files.

---

## Gumroad print workflow (after brand kit)

Print packs are **separate Canva designs** from the app UI. Three products + bundle:

| Product | Preset match | Price | App env var |
|---------|--------------|-------|-------------|
| Home Maintenance Print Pack | Homeowner's Sentinel | $5 | `VITE_PRINTS_HOME_URL` |
| Vehicle Care Print Pack | Preventive Gearhead | $5 | `VITE_PRINTS_CAR_URL` |
| Freelancer Finance Print Pack | Automated CFO | $5 | `VITE_PRINTS_CFO_URL` |
| All Three Bundle | — | $12 | `VITE_PRINTS_BUNDLE_URL` |

**Drop print PDFs / source exports:**

```
design-system/brand-assets/print-packs/
├── home-maintenance/
│   ├── checklist-a4.pdf
│   └── checklist-letter.pdf
├── vehicle-care/
└── freelancer-finance/
```

Or: `~/Desktop/NeatClock-Gumroad/raw/` with subfolders per preset.

**When print PDFs exist, tell the agent:**

> Print pack PDFs are in `design-system/brand-assets/print-packs/`. Write Gumroad listing copy, zip structure, and the exact Vercel env vars to enable `VITE_FEATURE_NEATCLOCK_PRINTS`.

See [MONETIZATION.md](../MONETIZATION.md) for checkout setup and [WAITLIST.md](../WAITLIST.md) for interest-form greenlight rules.

---

## What stays free (never paywall)

- All presets + custom tasks
- `.ics` export
- Basic in-app print checklist
- JSON backup / restore

Paid = styled PDF packs, optional premium themes, sponsor line — all feature-flagged.

---

## Related files

| File | Purpose |
|------|---------|
| [design-system/neatclock/MASTER.md](./neatclock/MASTER.md) | UI design tokens (dev) |
| [MONETIZATION.md](../MONETIZATION.md) | Gumroad + env flags |
| [src/config/monetization.js](../src/config/monetization.js) | Product catalog + CTA copy |
| [public/favicon.svg](../public/favicon.svg) | Replace after Canva icon export |
