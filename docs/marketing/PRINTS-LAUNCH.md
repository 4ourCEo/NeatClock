# NeatClock Prints — Revenue-Focused Marketing Launch

## Product Catalog

Create these **four products** on Gumroad (or alternative platform):

### 1. Home Maintenance Print Pack
- **Price:** $4
- **Short description:** Garage-ready checklist poster + fridge magnet layout for household upkeep
- **Who it's for:** Homeowners who want a physical backup of their recurring home maintenance tasks (HVAC filters, gutter cleaning, water heater flush, etc.)
- **Gumroad slug suggestion:** `neatclock-home`

### 2. Vehicle Care Print Pack
- **Price:** $4
- **Short description:** Garage-ready checklist with mileage tracker for preventive car maintenance
- **Who it's for:** Car enthusiasts and DIY mechanics who track oil changes, tire rotations, brake inspections by mileage
- **Gumroad slug suggestion:** `neatclock-car`

### 3. Freelancer Finance Print Pack
- **Price:** $4
- **Short description:** Quarterly tax + bookkeeping tracker for solopreneurs
- **Who it's for:** Freelancers and consultants who need a desk-ready reminder for quarterly estimated taxes, invoice reconciliation, expense categorization
- **Gumroad slug suggestion:** `neatclock-cfo`

### 4. All Three Bundle
- **Price:** $9 (save $3)
- **Short description:** Home + vehicle + finance print templates in one download
- **Who it's for:** Multi-role individuals (homeowner + car owner + side-hustle) who want complete coverage
- **Gumroad slug suggestion:** `neatclock-bundle`

---

## Vercel Environment Variables Setup

**Once Gumroad products are live**, set these in Vercel Project Settings → Environment Variables:

```bash
# Enable prints feature (required)
VITE_FEATURE_NEATCLOCK_PRINTS=true

# Product URLs (replace with actual Gumroad links)
VITE_PRINTS_SHOP_URL=https://gumroad.com/l/neatclock-bundle
VITE_PRINTS_HOME_URL=https://gumroad.com/l/neatclock-home
VITE_PRINTS_CAR_URL=https://gumroad.com/l/neatclock-car
VITE_PRINTS_CFO_URL=https://gumroad.com/l/neatclock-cfo
VITE_PRINTS_BUNDLE_URL=https://gumroad.com/l/neatclock-bundle

# Optional: override default prices shown in UI
VITE_PRINTS_HOME_PRICE=$4
VITE_PRINTS_CAR_PRICE=$4
VITE_PRINTS_CFO_PRICE=$4
VITE_PRINTS_BUNDLE_PRICE=$9
```

**Important:** Do NOT enable `VITE_FEATURE_NEATCLOCK_PRINTS=true` in committed `.env.production` until real Gumroad URLs exist. The flag gates visibility; without real URLs, users see placeholder UI or broken links.

---

## 7-Day Distribution Plan (Revenue-Focused)

### Goal
Drive **50–100 paid conversions** in first week to validate demand and fund further growth.

### Target Channels

#### Day 1–2: Direct Community Launch

**Reddit** (primary revenue channel — DIY + productivity audiences with buying intent):
- r/homeowners — *"I built a free calendar tool for recurring home maintenance (HVAC, gutters, etc.) + optional print packs"*
- r/Cartalk — *"Free preventive maintenance calendar generator (oil changes, tire rotation, brakes) — with garage-ready print option"*
- r/freelance — *"Automated quarterly tax reminder calendar for solopreneurs (free tool + optional desk tracker)"*
- r/productivity — *"No-account recurring task calendar (maintenance, car care, freelancer taxes) — exports to Google/Apple/Outlook"*

**Tone:** Product-first, not self-promo. Lead with the **free .ics generator**, mention prints as "optional hardcopy for $4" in a P.S. or comment reply.

**Indie Hackers:**
- Post in *Show IH* — "Launched NeatClock: maintenance calendar generator + $4 print packs (first revenue experiment)"
- Ask for feedback on **monetization around export** strategy (sparks discussion, stays on-brand)

#### Day 3–4: Facebook Groups (High-Intent Buyers)

Target groups with demonstrated spending behavior:
- Homeownership groups (local city-specific groups, first-time homebuyer communities)
- Car enthusiast clubs (brand-specific: "Honda Owners," "Subaru DIY," etc.)
- Freelancer / solopreneur finance groups

**Pitch angle:** *"I made a free tool that solved my [maintenance tracking problem]. If you want a fridge-ready / garage-ready / desk-ready version, I designed print packs."*

#### Day 5–6: SEO Landing Pages (Long-Tail Captures)

Deploy targeted landing pages matching each preset:
- `/home-maintenance-calendar` → drives to Homeowner preset + print pack CTA (live)
- `/car-maintenance-schedule-ics` → drives to Gearhead preset + print pack CTA (live)
- `/freelancer-quarterly-tax-reminders` → drives to CFO preset + print pack CTA (live)

**Content structure:**
- H1: [Benefit] (e.g., "Never Miss an Oil Change Again")
- Free tool CTA (primary)
- "Prefer a printable Letter pack?" secondary CTA with Gumroad link + UTMs + Plausible tracking
- Schema markup for rich snippets (FAQ, HowTo)

**Promotion:** Share each landing page in corresponding Reddit threads as "here's a free tool I built for this exact problem."

#### Day 7: Measurement + Iteration

Review conversion funnel:
- Plausible traffic → export rate → print CTA click rate → Gumroad conversion
- Identify top-performing channel (likely Reddit + specific subreddit)
- Double down on winning channel in Week 2

---

## Measurement Checklist

### Revenue Metrics (Primary)

- [ ] **Gumroad sales dashboard** — track daily revenue, product mix (individual packs vs. bundle)
- [ ] **Conversion rate** — (Gumroad purchases) / (print CTA clicks from Plausible goals)
  - **Target:** 2–5% CTA-click-to-purchase for validated demand
  - **Red flag:** <1% suggests price/value mismatch or weak CTA copy

### Traffic Metrics (Plausible Analytics)

Already configured in repo; confirm these goals are firing:

- [ ] `export_calendar` — baseline funnel entry (free tool usage)
- [ ] `print_cta_click` — interest in paid product (monetization intent)
- [ ] `lockscreen_download` — engagement with free extras (goodwill/brand)

### Channel Attribution

- [ ] **UTM tracking** — append `?utm_source=reddit&utm_medium=post&utm_campaign=prints-launch` to shared links
- [ ] **Top referrers in Plausible** — identify which subreddit/group drove most traffic + revenue

### Qualitative Signals

- [ ] **Reddit comment sentiment** — "This is exactly what I needed" vs. "Why not free?"
- [ ] **Gumroad product reviews/ratings** — post-purchase satisfaction
- [ ] **Interest form submissions** (if still enabled pre-launch) — gauge demand before flipping flag

---

## Constraints & Scope Boundaries

### What This Launch Is NOT
- **Not a task tracker** — NeatClock is a generator; export `.ics` and leave (avoid scope creep into Todoist competitor territory)
- **Not a SaaS** — no accounts, no backend, no recurring subscriptions (keeps legal/infra simple)
- **Not ad-driven** — monetization is transactional (buy print once) or affiliate (optional), never ad impressions

### What Stays Free Forever
- All three built-in presets (Homeowner, Gearhead, CFO)
- `.ics` calendar export (Google, Apple, Outlook)
- Custom task creation + local backup
- Print preview (basic checklist view)

### Reddit Compliance
- **No referral links in titles** — lead with value ("I built a free tool"), mention prints in body/comments
- **Genuine responses only** — if community feedback is "this should be fully free," listen and iterate (don't force monetization)

---

## Launch Day Checklist

### Pre-Launch (Do First)
1. [ ] Create all four Gumroad products with print pack PDFs uploaded
2. [ ] Set Vercel env vars with real Gumroad URLs
3. [ ] Redeploy production (`vercel --prod`)
4. [ ] Smoke test: export a calendar, verify print CTA links to live Gumroad page
5. [ ] Confirm Plausible goals are firing (`print_cta_click`)

### Launch Day
1. [ ] Post to 3–4 targeted subreddits (space posts 2–3 hours apart)
2. [ ] Post to Indie Hackers *Show IH*
3. [ ] Share in 2–3 Facebook groups
4. [ ] Monitor Plausible real-time dashboard for traffic spikes
5. [ ] Respond to comments within 1 hour (genuine engagement, not sales pitches)

### Day 2–7
1. [ ] Deploy SEO landing pages (one per preset)
2. [ ] Check Gumroad sales dashboard daily
3. [ ] Iterate CTA copy if conversion rate <1%
4. [ ] Collect testimonials from happy buyers for Week 2 social proof

---

## Success Criteria (Week 1)

| Metric | Threshold | Validates |
|--------|-----------|-----------|
| **Revenue** | $200+ (50 sales @ $4 avg) | Print packs solve a real pain point |
| **Export-to-CTA-click rate** | 10–20% | Users consider paid option |
| **CTA-click-to-purchase rate** | 2–5% | Price + value proposition align |
| **Reddit upvotes** | 50+ on best post | Product-market fit in target community |
| **Gumroad rating** | 4.5+ stars | Post-purchase satisfaction |

**If Week 1 underperforms:** Don't panic. Iteration paths:
- **Low traffic:** Revisit Reddit post titles (lead with outcome, not tool)
- **High CTA clicks, low sales:** Price test ($3 vs. $4) or add social proof
- **Low CTA clicks:** Strengthen in-app copy (see `gumroad-listings.md` for headline alternatives)

---

## Next Steps After Week 1

1. **Testimonial collection** — email buyers (via Gumroad) asking for quick feedback quote
2. **Bundle optimization** — if individual packs outsell bundle, test $8 bundle price or add bonus (e.g., "includes premium themes")
3. **Affiliate experiment** — partner with home/car maintenance blogs for rev-share link placement
4. **Premium themes unlock** — bundle buyers get `VITE_FEATURE_PREMIUM_THEMES=true` (honor system or Gumroad license key check)

---

## Contact for Questions

- GitHub Issues: [4ourCEo/NeatClock](https://github.com/4ourCEo/NeatClock/issues)
- Indie Hackers: @neatclock (tag in IH discussion threads)
