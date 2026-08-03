# Ops automation — agent-managed Notion (no Zapier required)

I (the agent) already created your Notion workspace and wired the repo.

## Live Notion pages

| What | URL |
|------|-----|
| Hub | https://www.notion.so/3b138c0c73a7819aabb5c8bd00f67517 |
| Leads DB | https://www.notion.so/0dc21b683ee94cf5b5ee5b4a7435a35b |
| Ops Board | https://www.notion.so/e44d6a2ef9af414380178436148617b7 |

IDs are also in [`docs/notion-config.json`](./notion-config.json).

Seed rows are already there (test lead + “SEO distribution week — setup complete”).

## Why one secret still needs you

Notion’s security model: **GitHub Actions cannot use the Cursor MCP login**.  
Actions need a separate **Internal Integration** token. That token is a password — only you can mint it. After you paste it once, I finish the rest (`gh secret set`, test notify, done).

Zapier is **optional fallback** only (`OPS_WEBHOOK_URL`). Prefer Notion direct.

---

## Your one remaining step (≈2 minutes)

### 1. Create a Notion integration

1. Open https://www.notion.so/my-integrations  
2. **New integration** → name `NeatClock GitHub` → associated workspace = yours → Submit  
3. Copy the **Internal Integration Secret** (`secret_...`)

### 2. Share the hub with that integration

1. Open https://www.notion.so/3b138c0c73a7819aabb5c8bd00f67517  
2. **•••** → **Connections** → **Connect to** → `NeatClock GitHub`  
3. Confirm access (children DBs inherit)

### 3. Hand me the token (pick one)

**A — paste in chat** (I’ll run `gh secret set` for you; don’t commit it)

**B — run locally:**

```bash
cd /Users/thagreat/Desktop/NeatClock
gh secret set NOTION_TOKEN          # paste secret_... when prompted
gh secret set NOTION_OPS_DATABASE_ID -b 'e44d6a2e-f9af-4143-8017-8436148617b7'
gh secret set NOTION_LEADS_DATABASE_ID -b '0dc21b68-3ee9-4cf5-b5ee-5b4a7435a35b'
```

### 4. (Optional) Formspree → Notion Leads auto-sync

Formspree’s submissions API is on paid plans. If you have an API key:

```bash
gh secret set FORMSPREE_API_KEY     # from Formspree → form → Settings → API
```

Weekly SEO Automation then runs `npm run ops:sync-leads`.

On free Formspree: leads still email you; I can also add rows via Notion MCP when you ask.

### 5. (Optional) Plausible scoreboard

```bash
gh secret set PLAUSIBLE_API_KEY
```

---

## After the token is set — what runs alone

| Trigger | Notion result |
|---------|----------------|
| Monday SEO Automation / manual run | New **Ops Board** row (`weekly_seo`) |
| Push new `public/*.html` to `main` | **Ops Board** row (`landing_indexed`) |
| Weekly + `FORMSPREE_API_KEY` | New **Leads** rows |

Scripts:

- [`scripts/notify-ops.mjs`](../scripts/notify-ops.mjs) — Ops Board writer  
- [`scripts/sync-leads-notion.mjs`](../scripts/sync-leads-notion.mjs) — Formspree → Leads  

Local test (after export):

```bash
export NOTION_TOKEN='secret_...'
npm run ops:notify -- --event weekly_seo --title "local test" --url https://neatclock.pro/guides
```

---

## Public LLM discovery (already live, no Notion)

| URL | Role |
|-----|------|
| https://neatclock.pro/llms.txt | AI summary |
| https://neatclock.pro/llms-full.txt | Citation guide |
| https://neatclock.pro/catalog.json | Machine catalog |
| https://neatclock.pro/.well-known/llms.txt | Alias |
| https://neatclock.pro/guides | Hub |

`npm run seo:llms` keeps these synced.

---

## Still human (Notion only reminds)

Mon Pinterest / Wed Reddit / Fri Shorts · GSC URL Inspection · enable Plausible goals once.  
See [`DISTRIBUTION-WEEKLY.md`](./DISTRIBUTION-WEEKLY.md).
