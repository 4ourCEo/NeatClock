# Monetization playbook

NeatClock monetizes **around the export moment** — not by paywalling the core `.ics` generator.

## Revenue streams (in launch order)

### 1. NeatClock Prints — start here

**What:** PDF print packs ($6.99 each, $14.99 bundle) matching each preset.  
**Where in app:** Export success modal, footer CTA.
**Where on web:** Secondary CTAs on 12 preset & long-tail landing pages:
- Preset landings (3): `/home-maintenance-calendar`, `/car-maintenance-schedule-ics`, `/freelancer-quarterly-tax-reminders`
- Home pack long-tail (5): hvac-filter, smoke-detector, gutters, water-heater, dryer-vent
- Vehicle pack long-tail (2): oil-change, tire-rotation
- Finance pack long-tail (2): quarterly-tax, subscription-audit

**Flag:** `VITE_FEATURE_NEATCLOCK_PRINTS=true`

**Setup (Gumroad — simplest):**

1. Create [gumroad.com](https://gumroad.com) account
2. Create products:
   - Home Maintenance Print Pack — $6.99
   - Vehicle Care Print Pack — $6.99
   - Freelancer Finance Print Pack — $6.99
   - All Three Bundle — $14.99
3. Copy each product link into Vercel env vars:

```
VITE_PRINTS_SHOP_URL=https://gumroad.com/l/neatclock-bundle
VITE_PRINTS_HOME_URL=https://gumroad.com/l/neatclock-home
VITE_PRINTS_CAR_URL=https://gumroad.com/l/neatclock-car
VITE_PRINTS_CFO_URL=https://gumroad.com/l/neatclock-cfo
VITE_PRINTS_BUNDLE_URL=https://gumroad.com/l/neatclock-bundle
```

**What to sell:** Export the print preview as PDF from Figma/Canva, or design matching A4/Letter checklist posters. The free in-app print view is the teaser; paid packs are styled + bonus layouts (fridge magnet, chore wheel).

**Alternatives:** Lemon Squeezy, Stripe Payment Links, Payhip — any link works in env vars.

---

### 2. Affiliate hints in `.ics` — complementary revenue

**What:** One helpful line in calendar event descriptions (not spam).  
**Flag:** `VITE_FEATURE_AFFILIATE_LINKS=true`

```
VITE_AMAZON_AFFILIATE_TAG=yourtag-20
```

Requires [Amazon Associates](https://affiliate-program.amazon.com/) approval. Hints stay text-only; links appear when tag is set.

**Coverage:** HVAC filters, engine oil, dryer vent kits, smoke detectors, tire rotation tools, gutter cleaning, and more.

---

### 3. Free lockscreen (lead magnet)

**What:** Bundled wallpaper — builds goodwill, keeps brand on phone.  
**Flag:** `VITE_FEATURE_LOCKSCREEN_GOODIES=true`

Works **immediately** — file at `/public/wallpapers/neatclock-lockscreen.svg`.

Optional: replace with premium PNGs via `VITE_LOCKSCREEN_URL=https://cdn.../premium.jpg`.

---

### 4. Premium themes

**What:** Ink Stone + Blush Linen palettes (already in code).  
**Flag:** `VITE_FEATURE_PREMIUM_THEMES=true`

**Options:**
- Include free with print bundle purchase (honor system — flip flag when you launch prints)
- Sell theme pack separately on Gumroad ($2)

Set `VITE_THEME_PACK_URL` to shop link shown when premium flag is off.

---

### 5. YouTube Shorts monetization

**What:** Monetize 60-second preset explainer Shorts that drive traffic to neatclock.pro.  
**Where:** Sunday Reset landings (`videos/` directory) + YouTube Shorts channel.

Revenue from YouTube Partner Program ads + affiliate disclosure links in video descriptions.

---

### 6. Etsy physical print packs

**What:** Print-on-demand or fulfilled hardcopies (poster + fridge magnet).  
**Where:** Etsy shop linked from app footer.

Higher margin than digital; appeals to gift buyers and offline planners.

---

### 7. Sponsor footer

**What:** One text line: "Sponsored this week by …"  
**Flag:** `VITE_FEATURE_SPONSOR_FOOTER=true`

**Pricing idea:** $50–150/week to notebook brands, filter companies, productivity tools.  
No ad network — direct outreach keeps UX calm.

---

## Path to $3k/mo

| Revenue Stream | Monthly Target | Notes |
|----------------|----------------|-------|
| **Prints** | $1,800 | 180 bundles @ $14.99 (~6/day) or mix of singles/bundles |
| **Affiliate hints** | $600 | ~$20/day from Amazon Associates (HVAC, oil, detectors, tools) |
| **YouTube Shorts** | $300 | ~10k views/day on Shorts with Partner Program ads + affiliate links |
| **Etsy physical packs** | $200 | ~20 physical bundles @ $9.99 profit margin |
| **Sponsor footer** | $100 | 1 sponsor @ $100/week (or 2 @ $50/week) |
| **Total** | **$3,000** | Multi-channel, diversified, no single point of failure |

**Critical path:** Prints first (70% margin, instant delivery, preset-matched CTAs already built). Affiliate hints are complementary and require zero new UI. Shorts/Etsy are growth channels once core product is validated.

---

## Recommended launch sequence

| Week | Action |
|------|--------|
| 1 | Deploy to Vercel + custom domain. Core tool free. |
| 1 | Enable `LOCKSCREEN_GOODIES` — free value on every export |
| 2 | Create 1 print pack (Homeowner), Gumroad link, enable `NEATCLOCK_PRINTS` |
| 3 | Add car + CFO packs + bundle |
| 4 | Enable `PREMIUM_THEMES` for bundle buyers |
| 4 | Enable `AFFILIATE_LINKS` with Amazon Associates tag |
| 6+ | YouTube Shorts channel + Sunday Reset video landings |
| 8+ | Etsy shop for physical print packs |
| 10+ | Sponsor outreach when traffic validates demand |

---

## What stays free forever

- All three presets
- `.ics` export
- Print checklist (basic)
- Custom tasks + backup
- No accounts

Paywalling export would violate the product promise and Reddit UX principles.

---

## Testing monetization locally

```bash
cp .env.monetization.example .env
npm run dev
```

Export a calendar — you should see print cards and lockscreen download.
