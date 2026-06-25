# NeatClock SEO & Growth Playbook

Ten opportunities identified as senior SEO + PM — each **implemented in code** (not just documented).

---

## 1. Head-term landing page

**Problem:** Homepage competes on broad queries ("recurring ics calendar generator") while intent-specific pages rank better.

**Shipped:** `/recurring-ics-calendar-generator` — targets the primary head term with FAQ + BreadcrumbList schema.

**PM next:** Submit URL in Google Search Console after indexing. Link from Reddit/HN posts to this page, not only `/`.

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

**Problem:** Plausible shows traffic; can't tell which landing drove exports or preset loads.

**Shipped:** All landing CTAs use `utm_source=landing&utm_medium=seo&utm_campaign=<slug>`.

**PM next:** In Plausible → **Settings → Goals**, add custom events: `ics_export`, `interest_submit`, `preset_deep_link`, `share_link_copy`. Filter by UTM in outbound link campaigns manually until Plausible UTM dashboard is configured.

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
| Organic sessions | 50/week | Plausible |
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
| `src/components/SeoFooterLinks.jsx` | App footer hub |
| `src/components/SharePresetLink.jsx` | Share loop |
| `src/lib/shareLinks.js` | UTM preset URLs |
| `index.html` | FAQ schema |
| `public/sitemap.xml` | New URL + lastmod |
| `vercel.json` | Rewrite for new landing |

---

## Human actions tonight

1. GSC property verify + sitemap submit
2. Plausible: enable custom events goals
3. One distribution post (pick channel above)
4. `npm run go-live:check` → `vercel --prod`
