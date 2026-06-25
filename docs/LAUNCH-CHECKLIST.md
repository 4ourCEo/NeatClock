# NeatClock launch checklist (human steps)

Code-only automation stops here. Complete these steps when you are ready to go live beyond `neatclock.pro`.

## 1. Custom domain

1. Purchase **neatclock.pro** (registrar of your choice).
2. Vercel project → **Settings → Domains** → add `neatclock.pro` and `www.neatclock.pro`.
3. Add the DNS records Vercel shows (typically CNAME to `cname.vercel-dns.com`).
4. Wait for HTTPS provisioning (automatic on Vercel).

## 2. Interest form — unlock feedback UI (pick one)

### Option A — Fastest (~2 min, no signup)

1. Vercel → **Settings → Environment Variables** (Production):

   ```
   VITE_INTEREST_FORM_EMAIL=your@email.com
   ```

2. Redeploy. Footer + post-export “Want a print version?” links appear automatically.
3. Submit a test from production. FormSubmit emails you on first submission (click their activation link once).

### Option B — Formspree (recommended long-term)

1. Create a free account at [formspree.io](https://formspree.io).
2. New form → copy endpoint `https://formspree.io/f/xxxxxxxx`.
3. Vercel env:

   ```
   VITE_INTEREST_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
   ```

4. Redeploy and test.

See [WAITLIST.md](../WAITLIST.md) for field mapping and greenlight rules.

## 3. Analytics (Plausible, privacy-friendly)

1. Create a site at [plausible.io](https://plausible.io) for your production domain.
2. Enable **Custom events** in Plausible site settings (tracks `ics_export`, `interest_submit`, `preset_deep_link`).
3. Vercel → **Settings → Environment Variables** (Production):

   ```
   VITE_PLAUSIBLE_DOMAIN=neatclock.pro
   ```

   Use `neatclock.pro` only if you are not using a custom domain yet.

3. Redeploy. The script loads only when the env var is set and the host is not localhost (`src/lib/analytics.js`).

## 4. SEO (already in repo)

- `public/sitemap.xml` and `public/robots.txt` ship with the build.
- After custom domain is live, find-replace `neatclock.pro` → `neatclock.pro` in sitemap + landing page canonical URLs, then redeploy.
- Submit sitemap in [Google Search Console](https://search.google.com/search-console).

## 5. Do not enable yet (until deliberate launch)

- All `VITE_FEATURE_*` monetization flags — keep **off** on production.
- Gumroad print URLs — create products first per [MONETIZATION.md](../MONETIZATION.md).
- Upgrade Vercel to **Pro** before enabling live commercial Gumroad CTAs (Hobby is non-commercial only).

## 6. Pre-launch verification

```bash
npm run lint && npm run test && npm run test:e2e && npm run build
```

Then run manual smoke on the production URL per [BRIDGE-GATE.md](./BRIDGE-GATE.md).

Submit `https://neatclock.pro/sitemap.xml` in Google Search Console. AI crawlers use `public/llms.txt` and `public/robots.txt` (GPTBot, ClaudeBot, PerplexityBot allowed).

## 7. Optional follow-ups (post-launch)

- Import exported `.ics` into Google Calendar once.
- Set up Gumroad print packs per `design-system/BRAND-BRIEF.md`.
- Enable monetization flags one phase at a time per [DEPLOY.md](../DEPLOY.md).
