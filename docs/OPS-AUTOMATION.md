# Ops automation — step-by-step setup

Do this **once**. ~20–30 minutes. After that, leads and weekly SEO checklists land in Notion automatically.

**Two tracks:**

1. **Leads** — someone submits interest on neatclock.pro → Notion **Leads**
2. **Ops** — Monday SEO job / new landing push → Notion **Ops**

LLM pages (`/llms.txt`, `/catalog.json`) are already live — no Zapier needed for those.

---

## Before you start (accounts)

You need:

- [ ] [Notion](https://www.notion.so) account
- [ ] [Zapier](https://zapier.com) account (free tier is enough to start)
- [ ] Access to [Formspree](https://formspree.io) form `xqevpwlb` (same one NeatClock already uses)
- [ ] Access to GitHub repo `4ourCEo/NeatClock` (Settings → Secrets)

---

## Step 1 — Create Notion database: Leads

1. Open Notion → **New page** → name it `NeatClock Leads`
2. Type `/database` → choose **Table — Full page**
3. Rename the default **Name** column to **Email** (keep type as Title), **or** keep Name and add a separate **Email** property (Email type)
4. Click **+** to add properties:

| Property name | Type | Options / notes |
|---------------|------|-----------------|
| Email | Email (or Title) | From form `email` |
| Preset | Text | e.g. `Homeowner's Sentinel` |
| Interests | Text | e.g. `prints, lockscreen` |
| Intent | Select | Add options: `yes`, `maybe`, `no` |
| Source | Select | Add options: `footer`, `export` |
| Submitted | Date | Include time optional |

5. Leave the table empty — Zapier fills it
6. Keep this page open; you’ll connect it in Zapier next

---

## Step 2 — Create Notion database: Ops

1. Notion → **New page** → `NeatClock Ops`
2. `/database` → **Table — Full page**
3. Rename Title column to **Name**
4. Add properties:

| Property name | Type | Options / notes |
|---------------|------|-----------------|
| Type | Select | `weekly_seo`, `landing_indexed`, `seo_auto_complete` |
| Status | Select | `Todo`, `Doing`, `Done` (default `Todo`) |
| Due | Date | |
| URLs | Text | Paste list of neatclock.pro links |
| Checklist | Text | Monday distribution tasks |
| Notes | Text | Optional |

5. Leave empty

---

## Step 3 — Connect Notion to Zapier (once)

1. Zapier → **Apps** → search **Notion** → Connect
2. Sign in with Notion → grant Zapier access to the workspace that has **NeatClock Leads** and **NeatClock Ops**
3. Confirm both databases appear when you search them later

---

## Step 4 — Zap A: Interest form → Notion Leads

### 4A. Prefer Formspree → Catch Hook (works on free Formspree)

Formspree’s native Zapier app can be flaky on free plans. This path is reliable:

1. Zapier → **Create** → **Zaps** → **New Zap**
2. **Trigger:** Webhooks by Zapier → **Catch Hook**
3. Click **Continue** → copy the **Custom Webhook URL** (looks like `https://hooks.zapier.com/hooks/catch/.../`)
4. Leave Zapier open on “waiting for hook”
5. Formspree → open form **xqevpwlb** → **Settings** / **Integrations** → **Webhooks**
6. Add webhook URL = the Catch Hook URL you copied → Save
7. On neatclock.pro, open the interest modal and submit a **test** lead (use your own email)
8. Back in Zapier → **Test trigger** → you should see the payload (`email`, `preset`, `interests`, `purchase_intent`, `source`)
9. **Action:** Notion → **Create Database Item**
10. Database: **NeatClock Leads**
11. Map fields:

| From webhook | Notion property |
|--------------|-----------------|
| `email` | Email |
| `preset` | Preset |
| `interests` | Interests |
| `purchase_intent` | Intent |
| `source` | Source |
| (Zapier “Date/time now” or form timestamp) | Submitted |

12. **Test** → check Notion Leads for the new row
13. **Publish** Zap → name it `NeatClock Leads`

### 4B. Alternate: Formspree native trigger

If Zapier shows **Formspree → New Submission**:

1. Trigger: Formspree → New Submission → form `xqevpwlb`
2. Action: same Notion mapping as above
3. Publish

---

## Step 5 — Zap B: GitHub ops events → Notion Ops

1. Zapier → **New Zap**
2. **Trigger:** Webhooks by Zapier → **Catch Hook**
3. Copy this **second** Catch Hook URL (different from the leads one)
4. Save it somewhere temporarily — you will paste it into GitHub as `OPS_WEBHOOK_URL`
5. Click **Continue** → **Test trigger** will wait (we’ll fire a test in Step 7)
6. For now, click **Skip test** / continue to Action if Zapier allows, **or** leave it open and do Step 6–7 first, then return
7. **Action:** Notion → **Create Database Item** → **NeatClock Ops**
8. Map:

| From webhook | Notion property |
|--------------|-----------------|
| `title` | Name |
| `event` | Type |
| (static) `Todo` | Status |
| `date` | Due |
| `urls` (join with newline if needed) | URLs |
| `checklist` (join with newline) | Checklist |
| `source` | Notes |

9. Optional but nicer: add a **Filter** step before Notion:

   - Only continue if `event` is `weekly_seo` **OR** `landing_indexed`

   (Skips noisy `seo_auto_complete` if you don’t want those rows.)

10. Name the Zap `NeatClock Ops` — **don’t publish yet** until Step 7 test succeeds

---

## Step 6 — Add GitHub secrets

1. Open https://github.com/4ourCEo/NeatClock/settings/secrets/actions
2. **New repository secret**

| Name | Value |
|------|--------|
| `OPS_WEBHOOK_URL` | The **Ops** Catch Hook URL from Step 5 (not the leads webhook) |

3. (Recommended) **New repository secret**

| Name | Value |
|------|--------|
| `PLAUSIBLE_API_KEY` | From Plausible → Settings → API keys (Stats API) |

4. Confirm both secrets show as updated (values are hidden)

---

## Step 7 — Test Ops Zap end-to-end

### Option A — from your laptop

```bash
cd /Users/thagreat/Desktop/NeatClock
export OPS_WEBHOOK_URL='https://hooks.zapier.com/hooks/catch/YOUR/HOOK/'
npm run ops:notify -- \
  --event weekly_seo \
  --title "SEO distribution week — test" \
  --url https://neatclock.pro/guides \
  --url https://neatclock.pro/llms.txt \
  --checklist "Mon Pinterest test" \
  --checklist "Wed Reddit test"
```

You should see: `notify-ops: OK (200) event=weekly_seo ...`

### Option B — from GitHub Actions

1. GitHub → **Actions** → **SEO Automation** → **Run workflow** → Run
2. Wait for the job to finish green
3. The “Notify Zapier / Notion” step should not skip

Then in Zapier Ops Zap:

1. **Test trigger** → payload appears with `event`, `checklist`, `urls`
2. Finish Notion field mapping if needed
3. **Test action** → row appears in **NeatClock Ops**
4. **Publish** Zap

---

## Step 8 — Sanity checklist

- [ ] Submit interest on https://neatclock.pro → new row in **NeatClock Leads** within ~1 minute
- [ ] Run `ops:notify` or SEO Automation workflow → new row in **NeatClock Ops**
- [ ] Open these (already live, no Zapier):
  - https://neatclock.pro/llms.txt
  - https://neatclock.pro/catalog.json
  - https://neatclock.pro/.well-known/llms.txt
  - https://neatclock.pro/guides

---

## What happens after setup (hands-off)

| When | What shows up in Notion |
|------|-------------------------|
| Someone submits interest | **Leads** row |
| Every Monday ~14:00 UTC (or manual SEO Automation run) | **Ops** row `weekly_seo` with Mon/Wed/Fri checklist |
| You push a new landing HTML to `main` | **Ops** row `landing_indexed` with URLs to GSC-inspect |

**Still you (Notion only reminds):**

1. Mon — Pinterest pin → intent landing  
2. Wed — Reddit value post → intent landing  
3. Fri — Shorts/TikTok → kit CTA  
4. GSC URL Inspection for brand-new pages  
5. Enable Plausible custom goals once (`landing_cta`, `ics_export`, `interest_submit`, …)

Cadence details: [`DISTRIBUTION-WEEKLY.md`](./DISTRIBUTION-WEEKLY.md)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `notify-ops: skipped (OPS_WEBHOOK_URL unset)` | Secret not set locally — `export OPS_WEBHOOK_URL=...` or add GitHub secret |
| Zapier trigger empty | Fire a real test submit / `ops:notify` while Catch Hook is waiting |
| Notion “unauthorized” | Reconnect Notion in Zapier; share the DB with the Zapier integration |
| Leads Zap fires but fields blank | Re-map using the latest sample webhook payload field names |
| Wrong Zap got the ops secret | `OPS_WEBHOOK_URL` must be the **Ops** Catch Hook, not the Formspree/leads one |
| Formspree webhook 403/fail | Confirm form id `xqevpwlb` and that the webhook URL is exactly the Catch Hook |

---

## Payload reference (Ops Catch Hook)

```json
{
  "event": "weekly_seo",
  "date": "2026-08-02",
  "site": "https://neatclock.pro",
  "title": "SEO distribution week",
  "checklist": ["Mon Pinterest…", "Wed Reddit…"],
  "urls": ["https://neatclock.pro/guides"],
  "source": "github-actions-seo"
}
```

Events: `weekly_seo` | `landing_indexed` | `seo_auto_complete`
