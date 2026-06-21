# Monetization playbook

NeatClock monetizes **around the export moment** — not by paywalling the core `.ics` generator.

## Revenue streams (in launch order)

### 1. NeatClock Prints — start here

**What:** PDF print packs ($3–5 each, ~$9 bundle) matching each preset.  
**Where in app:** Export success modal, footer CTA.  
**Flag:** `VITE_FEATURE_NEATCLOCK_PRINTS=true`

**Setup (Gumroad — simplest):**

1. Create [gumroad.com](https://gumroad.com) account
2. Create products:
   - Home Maintenance Print Pack — $4
   - Vehicle Care Print Pack — $4
   - Freelancer Finance Print Pack — $4
   - All Three Bundle — $9
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

### 2. Free lockscreen (lead magnet)

**What:** Bundled wallpaper — builds goodwill, keeps brand on phone.  
**Flag:** `VITE_FEATURE_LOCKSCREEN_GOODIES=true`

Works **immediately** — file at `/public/wallpapers/neatclock-lockscreen.svg`.

Optional: replace with premium PNGs via `VITE_LOCKSCREEN_URL=https://cdn.../premium.jpg`.

---

### 3. Premium themes

**What:** Ink Stone + Blush Linen palettes (already in code).  
**Flag:** `VITE_FEATURE_PREMIUM_THEMES=true`

**Options:**
- Include free with print bundle purchase (honor system — flip flag when you launch prints)
- Sell theme pack separately on Gumroad ($2)

Set `VITE_THEME_PACK_URL` to shop link shown when premium flag is off.

---

### 4. Affiliate hints in `.ics`

**What:** One helpful line in calendar event descriptions (not spam).  
**Flag:** `VITE_FEATURE_AFFILIATE_LINKS=true`

```
VITE_AMAZON_AFFILIATE_TAG=yourtag-20
```

Requires [Amazon Associates](https://affiliate-program.amazon.com/) approval. Hints stay text-only; links appear when tag is set.

---

### 5. Sponsor footer

**What:** One text line: "Sponsored this week by …"  
**Flag:** `VITE_FEATURE_SPONSOR_FOOTER=true`

**Pricing idea:** $50–150/week to notebook brands, filter companies, productivity tools.  
No ad network — direct outreach keeps UX calm.

---

## Recommended launch sequence

| Week | Action |
|------|--------|
| 1 | Deploy to Vercel + custom domain. Core tool free. |
| 1 | Enable `LOCKSCREEN_GOODIES` — free value on every export |
| 2 | Create 1 print pack (Homeowner), Gumroad link, enable `NEATCLOCK_PRINTS` |
| 3 | Add car + CFO packs + bundle |
| 4 | Enable `PREMIUM_THEMES` for bundle buyers |
| 5+ | Amazon affiliate tag, sponsor outreach |

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
