# Feature flags

NeatClock ships with **future features built but blocked**. Flip a flag when you are ready to launch — no code changes required, just redeploy.

## How it works

1. Copy `.env.example` to `.env` (local) or set env vars on your host (Vercel, Netlify, etc.)
2. Set any flag to `true`
3. Rebuild and redeploy

```bash
VITE_FEATURE_NEATCLOCK_PRINTS=true
```

Flags default to **off** in production until you enable them.

## Available flags

| Flag | What unlocks |
|------|----------------|
| `VITE_FEATURE_NEATCLOCK_PRINTS` | Premium print template shop link on export success |
| `VITE_FEATURE_LOCKSCREEN_GOODIES` | Lockscreen wallpaper download on export success |
| `VITE_FEATURE_PREMIUM_THEMES` | Premium theme packs banner in header |
| `VITE_FEATURE_SPONSOR_FOOTER` | Text-only sponsor line in site footer |
| `VITE_FEATURE_AFFILIATE_LINKS` | Helpful resource hints inside `.ics` descriptions |

## Optional URLs (when flags are on)

| Variable | Purpose |
|----------|---------|
| `VITE_PRINTS_SHOP_URL` | Gumroad/Shop link for print packs |
| `VITE_LOCKSCREEN_URL` | CDN link for wallpaper download |
| `VITE_SPONSOR_NAME` | Sponsor display name |
| `VITE_SPONSOR_TAGLINE` | Sponsor tagline |
| `VITE_SPONSOR_URL` | Sponsor link |

## When flags are off

Nothing is shown — no "Coming soon" cards. The UI stays clean for visitors.

**Owner preview:** append `?preview=monetization` to the URL to see gated UI locally before enabling flags.

**Greenlight feedback:** set `VITE_INTEREST_FORM_ENDPOINT` to a Formspree URL. Native in-app modal + footer card (see `WAITLIST.md`). Hidden once prints go live.

## Deploy

```bash
npm run build
```

Static output in `dist/` — deploy to Vercel (recommended), Netlify, or Cloudflare Pages. See [DEPLOY.md](./DEPLOY.md).

Monetization setup: [MONETIZATION.md](./MONETIZATION.md).
