# NeatClock

A minimalist, zero-friction **recurring calendar generator** — live on the web, no sign-up required.

Pick a preset, edit your tasks, export a `.ics` file or print a checklist. Done in under a minute.

## What it is

- Public web app (deploy `dist/` to any static host)
- Home maintenance, vehicle upkeep, and freelance bookkeeping presets
- Natural-language task input ("Wash car every 2 weeks")
- `.ics` export (all-day dates — works in Google, Apple, and Outlook calendars)
- Print-friendly checklist view
- JSON backup / restore for your schedule

## What it is not

NeatClock is **not** a task tracker. No completion tracking, overdue states, or accounts. See [SCOPE.md](./SCOPE.md).

## Privacy

Your schedule is saved **on your device** in the browser (not on our servers). Clearing site data for neatclock.app removes it. Use **Backup** to download a JSON copy you can restore later.

## Preset deep links

Share or bookmark a preset with URL query params (applied on first visit when no saved tasks exist, or anytime with `fresh=1`):

| Param | Preset |
|-------|--------|
| `?preset=home` | Homeowner's Sentinel |
| `?preset=gearhead` | Preventive Gearhead |
| `?preset=cfo` | Automated CFO |

Examples: `https://neatclock.vercel.app/?preset=gearhead` · force reload preset: `?preset=home&fresh=1`

SEO landing pages (static HTML, preset CTAs):

- `/home-maintenance-calendar` → `?preset=home`
- `/car-maintenance-schedule-ics` → `?preset=gearhead`
- `/freelancer-quarterly-tax-reminders` → `?preset=cfo`

## AI / LLM discovery

- `public/llms.txt` — concise summary for ChatGPT, Claude, Perplexity, etc. ([llmstxt.org](https://llmstxt.org))
- `public/llms-full.txt` — extended reference (presets, URLs, FAQ-style answers)
- `public/robots.txt` — allows major AI crawlers; links sitemap and llms.txt
- `index.html` — WebApplication JSON-LD + `rel="alternate"` to llms.txt

After custom domain: update URLs in llms files, sitemap, and landing canonicals.

## Feature flags (launch when ready)

Future monetization features (print shop, lockscreen goodies, sponsor footer) are **built but off by default**. Enable via environment variables — see [FEATURES.md](./FEATURES.md).

## Development

```bash
npm install
npm run dev       # dev server
npm run build     # production build → dist/
npm run lint      # ESLint
npm run test      # Vitest
npm run preview   # preview production build
```

## Deploy

```bash
npm run build
```

Upload `dist/` or connect the repo to Vercel / Netlify / Cloudflare Pages. Set feature-flag env vars in the host dashboard when ready.
