# Go live tonight — NeatClock

**Target:** public launch on `neatclock.vercel.app` (or `neatclock.app` if domain is ready).  
**Time:** ~30–45 minutes human steps after this deploy lands.

---

## Already done in repo (this deploy)

- [x] SEO meta description (search-intent copy)
- [x] `WebApplication` JSON-LD + canonical URL via `VITE_SITE_URL`
- [x] `llms.txt` / `robots.txt` / sitemap / 3 SEO landing pages
- [x] Interest form ready (`VITE_INTEREST_FORM_EMAIL` or Formspree endpoint)
- [x] Plausible hook (`VITE_PLAUSIBLE_DOMAIN`)
- [x] 81 unit + 16 E2E tests, CI on push
- [x] Security headers on Vercel

---

## Your checklist (in order)

### 1. Vercel env vars (5 min)

**Vercel → Project → Settings → Environment Variables → Production**

| Variable | Value | Required tonight? |
|----------|-------|-------------------|
| `VITE_INTEREST_FORM_EMAIL` | your@email.com | **Yes** — unlocks feedback UI |
| `VITE_PLAUSIBLE_DOMAIN` | `neatclock.vercel.app` or `neatclock.app` | **Yes** — see traffic |
| `VITE_SITE_URL` | `https://neatclock.vercel.app` or `https://neatclock.app` | **Yes** if using custom domain |
| `VITE_FEATURE_*` | unset or `false` | Keep **off** |

Redeploy after saving env vars (or push to `main` — auto deploy).

### 2. Custom domain (15 min, optional but recommended)

1. Buy **neatclock.app**
2. Vercel → Domains → add `neatclock.app` + `www.neatclock.app`
3. DNS per Vercel instructions
4. Update env: `VITE_SITE_URL=https://neatclock.app`, `VITE_PLAUSIBLE_DOMAIN=neatclock.app`
5. Redeploy
6. Find-replace `neatclock.vercel.app` → `neatclock.app` in `public/sitemap.xml`, `public/robots.txt`, `public/llms*.txt`, landing HTML canonicals — commit + push

### 3. Interest form activation (2 min)

1. Open production URL → footer **Share feedback** or export success link
2. Submit test response
3. FormSubmit: click activation link in email (first time only)

### 4. Plausible (5 min)

1. [plausible.io](https://plausible.io) → add site matching `VITE_PLAUSIBLE_DOMAIN`
2. Enable **Custom events** (`ics_export`, `interest_submit`, `preset_deep_link`)
3. Export one `.ics` on prod → confirm event in Plausible

### 5. Manual smoke (5 min)

On production URL:

1. Logo visible; Obsidian theme → light logo
2. Preset switch → tasks load → reload persists
3. Edit task → **Generate & Export .ics** → `neatclock-schedule.ics` downloads
4. Success modal shows Google Calendar import hint
5. `/home-maintenance-calendar` loads SEO page → CTA opens app with home preset

Full gate: [BRIDGE-GATE.md](./BRIDGE-GATE.md)

### 6. Google Search Console (10 min)

1. Add property (domain or URL prefix)
2. Verify ownership
3. Submit sitemap: `https://YOUR-DOMAIN/sitemap.xml`
4. Request indexing on `/` and `/home-maintenance-calendar`

### 7. Share (when smoke passes)

- Home: `https://neatclock.app/` or `https://neatclock.vercel.app/`
- Home preset: `?preset=home`
- Car preset: `?preset=gearhead`

---

## Do NOT enable tonight

- `VITE_FEATURE_NEATCLOCK_PRINTS` (needs Gumroad + Vercel Pro)
- Gumroad URLs
- Any monetization flags

---

## Rollback

Vercel → Deployments → previous production deployment → **Promote to Production**.

---

## Verify locally before push

```bash
npm run go-live:check
```
