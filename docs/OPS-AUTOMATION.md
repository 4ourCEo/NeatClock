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

Notion puts this under **Settings → Connections** (not a separate “integrations” app).

### 1. Create your own connection (gets the token)

1. In Notion: **Settings** (sidebar) → **Connections**
2. Scroll to the bottom → **Develop your own connections** (opens My connections in the browser)
3. **+ New connection**
4. Name: `NeatClock GitHub`
5. Associated workspace: the one that has the NeatClock Ops hub
6. Submit / create
7. Open that connection → copy the **Internal Integration Secret**  
   (often starts with `secret_` or `ntn_`)

Shortcut URL if Settings is hard to find: https://www.notion.so/profile/integrations  
(same “My connections” screen)

### 2. Grant page access (••• often does nothing — use Share)

The top-right **•••** menu is buggy for a lot of people. Use **Share** instead:

1. Open the hub in the **browser** (not the desktop app if the menu is dead):  
   https://www.notion.so/3b138c0c73a7819aabb5c8bd00f67517  
2. Click **Share** (top right, usually blue/black button — not the three dots)
3. In the invite box, type: `NeatClock GitHub`  
   (or whatever you named the connection)
4. When the connection appears, select it → **Invite** / **Can edit**
5. Confirm

**If the connection does not show up in Share search:**

1. Settings → **Connections** → find **NeatClock GitHub**
2. Confirm it exists under *your* workspace
3. Then retry Share on the hub page
4. Or open each database and Share there too:  
   - Ops Board: https://www.notion.so/e44d6a2ef9af414380178436148617b7  
   - Leads: https://www.notion.so/0dc21b683ee94cf5b5ee5b4a7435a35b  

**Still stuck?**

- Use Chrome/Safari web Notion, not the Mac app  
- Make sure you’re in the same workspace where you created the connection (workspace switcher top-left)  
- You must be able to edit the page (if it’s view-only, duplicate it into your Private section first)

Optional classic path (when it works): **•••** → **Add connections** → pick `NeatClock GitHub`.

### 3. Hand me the token (pick one)

**A — paste in chat** (I’ll run `gh secret set` for you; don’t commit it)

**B — run locally:**

```bash
cd /Users/thagreat/Desktop/NeatClock
gh secret set NOTION_TOKEN          # paste secret_... / ntn_... when prompted
# DB ids are already set in GitHub Actions secrets
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
