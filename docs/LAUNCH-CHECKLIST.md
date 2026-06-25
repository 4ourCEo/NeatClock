# NeatClock launch checklist (human steps)

Code-only automation stops here. Complete these steps when you are ready to go live beyond `neatclock.vercel.app`.

## 1. Custom domain

1. Purchase **neatclock.app** (registrar of your choice).
2. Vercel project → **Settings → Domains** → add `neatclock.app` and `www.neatclock.app`.
3. Add the DNS records Vercel shows (typically CNAME to `cname.vercel-dns.com`).
4. Wait for HTTPS provisioning (automatic on Vercel).

## 2. Interest form (Formspree or FormSubmit)

1. Create a free account at [formspree.io](https://formspree.io) (recommended) or [formsubmit.co](https://formsubmit.co).
2. Create a form → copy the POST endpoint URL.
3. Vercel → **Settings → Environment Variables** (Production + Preview):

   ```
   VITE_INTEREST_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
   ```

4. Redeploy. The footer and post-export feedback cards appear when prints are still off.
5. Submit one test response and confirm it arrives in your inbox.

See [WAITLIST.md](../WAITLIST.md) for field mapping and greenlight rules.

## 3. Analytics (Plausible, privacy-friendly)

1. Create a site at [plausible.io](https://plausible.io) for your production domain.
2. Vercel → **Settings → Environment Variables** (Production):

   ```
   VITE_PLAUSIBLE_DOMAIN=neatclock.app
   ```

   Use `neatclock.vercel.app` only if you are not using a custom domain yet.

3. Redeploy. The script loads only when the env var is set and the host is not localhost (`src/lib/analytics.js`).

## 4. Do not enable yet (until deliberate launch)

- All `VITE_FEATURE_*` monetization flags — keep **off** on production.
- Gumroad print URLs — create products first per [MONETIZATION.md](../MONETIZATION.md).
- Upgrade Vercel to **Pro** before enabling live commercial Gumroad CTAs (Hobby is non-commercial only).

## 5. Pre-launch verification

```bash
npm run lint && npm run test && npm run test:e2e && npm run build
```

Then run manual smoke on the production URL per [BRIDGE-GATE.md](./BRIDGE-GATE.md).

## 6. Optional follow-ups (post-launch)

- Import exported `.ics` into Google Calendar once.
- Set up Gumroad print packs per `design-system/BRAND-BRIEF.md`.
- Enable monetization flags one phase at a time per [DEPLOY.md](../DEPLOY.md).
