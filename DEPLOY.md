# Deploy NeatClock

NeatClock is a static site (`npm run build` → `dist/`). **Vercel is the best default** for this project.

## Why Vercel

| | Vercel | Netlify | Cloudflare Pages |
|---|--------|---------|------------------|
| Vite support | Native | Native | Native |
| Free HTTPS + CDN | Yes | Yes | Yes |
| Env vars for feature flags | Dashboard | Dashboard | Dashboard |
| Custom domain | Easy | Easy | Easy |
| `vercel.json` already in repo | Yes | — | — |

All three work. Vercel needs the least config for a Vite SPA.

---

## Deploy to Vercel (recommended)

### Option A — GitHub (best for updates)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

Every push to `main` redeploys automatically.

### Option B — CLI (fastest first deploy)

```bash
npm i -g vercel
npm run build
vercel --prod
```

Follow prompts. Link to a project name like `neatclock`.

---

## Custom domain

1. Vercel project → **Settings → Domains**
2. Add `neatclock.app` (or your domain)
3. Add the DNS records Vercel shows (usually CNAME to `cname.vercel-dns.com`)

---

## Environment variables (monetization)

Set these in **Vercel → Project → Settings → Environment Variables**, then redeploy.

### Phase 1 — Launch free extras + prints (recommended first)

```
VITE_FEATURE_LOCKSCREEN_GOODIES=true
VITE_FEATURE_NEATCLOCK_PRINTS=true
VITE_PRINTS_SHOP_URL=https://yourname.gumroad.com/l/neatclock-prints
```

Lockscreen works immediately (bundled SVG). Prints button goes live once Gumroad URL is set.

### Phase 2 — Premium themes + affiliates

```
VITE_FEATURE_PREMIUM_THEMES=true
VITE_FEATURE_AFFILIATE_LINKS=true
VITE_AMAZON_AFFILIATE_TAG=yourtag-20
```

### Phase 3 — Sponsor revenue

```
VITE_FEATURE_SPONSOR_FOOTER=true
VITE_SPONSOR_NAME=Brand Name
VITE_SPONSOR_TAGLINE=short tagline
VITE_SPONSOR_URL=https://sponsor.com
```

See [MONETIZATION.md](./MONETIZATION.md) for product setup.

---

## Analytics (Plausible)

NeatClock uses [Plausible](https://plausible.io) for privacy-friendly, cookieless page analytics. The script is injected only when `VITE_PLAUSIBLE_DOMAIN` is set in Vercel env vars and the user is not on localhost — no tracking runs in local dev by default. Set the domain to your production hostname (e.g. `neatclock.app`) after the custom domain is live, then redeploy. See [docs/LAUNCH-CHECKLIST.md](./docs/LAUNCH-CHECKLIST.md) for the full human setup steps.

---

## Pre-launch checklist

- [ ] `npm run lint && npm run test && npm run build` pass
- [ ] Export `.ics` and import into Google Calendar once
- [ ] Set env vars before enabling print shop flag
- [ ] Add custom domain + HTTPS (automatic on Vercel)

---

## Alternatives

**Cloudflare Pages:** Connect repo, build `npm run build`, output `dist`, add env vars in Pages settings.

**Netlify:** Same as Cloudflare — build command + publish directory `dist`.

**Render static site:** New Static Site → build `npm run build`, publish `dist`.

No server, database, or Render web service required.
