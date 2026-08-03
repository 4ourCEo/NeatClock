# Ops automation — agent-owned (no Notion “Add connections”)

Notion’s **Share** box only accepts emails. **Add connections** is a separate UI control I cannot click for you. So automation does **not** depend on that anymore.

## What runs automatically (I wired this)

| Trigger | What you get |
|---------|----------------|
| Monday SEO Automation / manual run | GitHub Issue `SEO distribution week — YYYY-MM-DD` (label `seo-weekly`) |
| Push new landing HTML | IndexNow + optional ops issue via `notify-ops` |
| Live site | LLM surfaces: `/llms.txt`, `/catalog.json`, `/guides` |

**Your checklist lives here:**  
https://github.com/4ourCEo/NeatClock/issues?q=is%3Aissue+label%3Aseo-weekly

## Notion hub (readable dashboard)

I already created these and can update them via Cursor’s Notion connection:

| What | URL |
|------|-----|
| Hub | https://www.notion.so/3b138c0c73a7819aabb5c8bd00f67517 |
| Leads | https://www.notion.so/0dc21b683ee94cf5b5ee5b4a7435a35b |
| Ops Board | https://www.notion.so/e44d6a2ef9af414380178436148617b7 |

Config: [`docs/notion-config.json`](./notion-config.json)

**Optional later:** if you ever get `••• → Add connections` working and paste a `NOTION_TOKEN`, GitHub Actions can also write Ops rows. Not required.

## Commands

```bash
# Create / refresh an ops GitHub Issue right now
npm run ops:notify -- \
  --event weekly_seo \
  --title "SEO distribution week" \
  --url https://neatclock.pro/guides \
  --checklist "Mon Pinterest" \
  --checklist "Wed Reddit" \
  --checklist "Fri Shorts"

# Manual weekly pipeline
gh workflow run "SEO Automation"
```

## Still human

Mon Pinterest / Wed Reddit / Fri Shorts · GSC inspect · Plausible goals once.  
[`DISTRIBUTION-WEEKLY.md`](./DISTRIBUTION-WEEKLY.md)

## Public LLM discovery

https://neatclock.pro/llms.txt · https://neatclock.pro/catalog.json · https://neatclock.pro/guides
