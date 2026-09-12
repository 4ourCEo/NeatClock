# NeatClock SEO & Growth Playbook

Ten opportunities identified as senior SEO + PM — each **implemented in code** (not just documented).

---

## 1. Head-term landing page

**Problem:** Homepage competes on broad queries ("recurring ics calendar generator") while intent-specific pages rank better.

**Shipped:** `/recurring-ics-calendar-generator` — targets the primary head term with FAQ + BreadcrumbList schema.

**PM next:** Submit URL in Google Search Console after indexing. Link from Reddit/HN posts to this page, not only `/`.

---

## 1a. Preset landing monetization CTAs

**Problem:** Preset landings drive traffic but no conversion path to prints.

**Shipped:** Secondary Gumroad print CTAs on three preset landings (`/home-maintenance-calendar`, `/car-maintenance-schedule-ics`, `/freelancer-quarterly-tax-reminders`) with proper UTMs and GoatCounter `print_cta_click` tracking. Extended to 9 additional long-tail pages:
- Home pack (5): hvac-filter, smoke-detector, gutters, water-heater, dryer-vent
- Vehicle pack (2): oil-change, tire-rotation
- Finance pack (2): quarterly-tax, subscription-audit

All pages include secondary print CTA block with pack-appropriate Gumroad links, bundle option, GoatCounter tracking, and FAQ updates mentioning optional prints. Friendly URL alias redirects added (`/car-maintenance-schedule` → canonical, `/freelancer-tax-calendar` → canonical).

**PM next:** Monitor CTA click-through rate in GoatCounter per campaign. Update FAQ copy if users confuse free export with paid prints.

---

## 2. Internal linking hub (app → landings)

**Problem:** SPA had zero crawlable links to SEO landings; link equity stayed on one URL.

**Shipped:** `SeoFooterLinks` in app footer — links to all four guide pages.

**PM next:** Add same links to `llms.txt` / `llms-full.txt` if you expand AI discovery docs.

---

## 3. Cross-linking between landings

**Problem:** Orphan landings don't pass relevance signals to each other.

**Shipped:** "Other free calendars" nav on every landing page (hub-and-spoke).

**PM next:** When you add a 5th preset landing, update all four `related` blocks + `SeoFooterLinks` + sitemap in one PR.

---

## 4. UTM attribution on SEO CTAs

**Problem:** Analytics shows traffic; can't tell which landing drove exports or preset loads.

**Shipped:** All landing CTAs use `utm_source=landing&utm_medium=seo&utm_campaign=<slug>`.

**PM next:** View event breakdowns in GoatCounter dashboard. Custom events like `ics_export`, `interest_submit`, `preset_deep_link`, `share_link_copy` are tracked automatically with title metadata for campaign attribution.

---

## 5. Viral share loop (preset deep links)

**Problem:** No built-in way for users to share "here's my home maintenance calendar setup."

**Shipped:** `SharePresetLink` + `shareLinks.js` — copies `?preset=home|gearhead|cfo` with UTM `utm_medium=share`. Tracks `share_link_copy`.

**PM next:** After 50+ exports/week, A/B test copy: "Send this to your spouse" vs "Copy share link."

---

## 6. Homepage FAQ rich snippets

**Problem:** Homepage had WebApplication schema only; missed FAQ carousel in SERPs.

**Shipped:** FAQPage JSON-LD in `index.html` (4 questions).

**PM next:** Validate at [Google Rich Results Test](https://search.google.com/test/rich-results). Don't duplicate FAQ on landings with identical questions — keep them intent-specific (already done).

---

## 7. BreadcrumbList on landings

**Problem:** Google shows breadcrumbs in results when schema is clear; improves CTR.

**Shipped:** BreadcrumbList on all four landing pages.

**PM next:** When `neatclock.pro` goes live, bulk-replace `neatclock.pro` in static HTML canonicals or move landings to Vite env substitution.

---

## 8. Sitemap completeness

**Problem:** New pages invisible to crawlers without sitemap entries.

**Shipped:** `sitemap.xml` — added `/recurring-ics-calendar-generator`, `lastmod` on all URLs.

**PM next:** GSC → Sitemaps → submit `https://neatclock.pro/sitemap.xml`. Re-submit after domain migration.

---

## 9. Interest capture at high-intent moments

**Problem:** Traffic without email capture = no remarketing loop.

**Already shipped:** Interest form on export success + footer (`admin@ihustlers.com`).

**PM next:** First FormSubmit activation email must be clicked. Target: **≥3 interest submits / 100 ICS exports** before building Gumroad. Track `interest_submit` in Plausible.

---

## 10. PM growth operating rhythm

**Problem:** SEO assets without a weekly owner stall.

**Shipped:** This doc + existing `docs/LAUNCH-CHECKLIST.md`, `docs/GO-LIVE-TONIGHT.md`.

### Week 1 KPIs (baseline)

| Metric | Target | Where |
|--------|--------|-------|
| Organic sessions | 50/week | GoatCounter |
| ICS exports | 10/week | `ics_export` event |
| Interest submits | 1/week | `interest_submit` |
| Share copies | 5/week | `share_link_copy` |

### Distribution channels (priority order)

1. **Reddit** — r/homeowners, r/MechanicAdvice, r/freelance (tool post, not spam; link to intent landing)
2. **Indie Hackers / HN Show** — story: "I built a .ics generator because Google Calendar recurring setup sucks for maintenance"
3. **Pinterest** — printable checklist angle (when print monetization flips on)
4. **YouTube Shorts** — 30s screen record: preset → export → Google Calendar import

### Revenue gate (unchanged)

- `$0` until `VITE_FEATURE_NEATCLOCK_PRINTS=true` + Gumroad URLs + traffic proof
- `.vercel.app` is fine for SEO launch; buy `neatclock.pro` when interest form hits 10+ submissions

### Monthly SEO maintenance

- [ ] GSC: fix coverage errors
- [ ] Add one new long-tail landing per month (e.g. "HVAC filter reminder calendar")
- [ ] Refresh `lastmod` in sitemap when content changes
- [ ] Check `llms.txt` still matches product surface

---

## Files touched (this sprint)

| File | Change |
|------|--------|
| `public/recurring-ics-calendar-generator.html` | New head-term landing |
| `public/*-calendar*.html` | Cross-links, UTM, breadcrumbs |
| `public/home-maintenance-calendar.html` | Secondary Gumroad print CTA + Inter font |
| `public/car-maintenance-schedule-ics.html` | Secondary Gumroad print CTA + Inter font |
| `public/freelancer-quarterly-tax-reminders.html` | Secondary Gumroad print CTA + Inter font |
| `public/page-base.css` | Font update: Inter for body (was Outfit) |
| `src/components/SeoFooterLinks.jsx` | App footer hub |
| `src/components/SharePresetLink.jsx` | Share loop |
| `src/lib/shareLinks.js` | UTM preset URLs |
| `index.html` | FAQ schema |
| `public/sitemap.xml` | New URL + lastmod |
| `vercel.json` | Rewrite for new landing + friendly URL alias redirects |

---

## Human actions tonight

1. GSC property verify + sitemap submit (`https://neatclock.pro/sitemap.xml`)
2. ~~Plausible: enable Custom events + goals~~ — migrated to GoatCounter; custom events tracked automatically
3. One distribution post per `docs/DISTRIBUTION-WEEKLY.md` (link intent landing, not only `/`)
4. `npm run go-live:check` → deploy → `npm run seo:auto` (sitemap + live smoke + IndexNow + optional scoreboard)
5. Start filling `docs/TRAFFIC-SCOREBOARD.md` daily for 7 days (manual or via GoatCounter dashboard export)
6. Automation details: `docs/SEO-AUTOMATION.md`

**Validated live (2026-09):** GoatCounter script on homepage + landings (`data-goatcounter` attribute); Formspree interest endpoint present in production bundle. Static landings ship with GoatCounter snippet so SEO pageviews are visible.
