# Interest form setup (greenlight feedback)

NeatClock includes a **native feedback flow** styled like the rest of the app — not an external form link.

It appears when:
- Print packs are **not** live yet (`VITE_FEATURE_NEATCLOCK_PRINTS` is not `true`)
- A form endpoint is configured (`VITE_INTEREST_FORM_ENDPOINT`)

It hides automatically once print packs launch.

---

## Recommended: Formspree (5 minutes)

1. Create a free account at [formspree.io](https://formspree.io)
2. New form → name it **NeatClock Interest**
3. Copy the form endpoint: `https://formspree.io/f/xxxxxxxx`
4. Add to Vercel env vars:

```
VITE_INTEREST_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

5. Redeploy

### Fields received (auto-mapped)

| Field | Example |
|-------|---------|
| `preset` | Homeowner's Sentinel |
| `interests` | prints, lockscreen |
| `purchase_intent` | maybe |
| `email` | user@example.com or (not provided) |
| `source` | export \| footer |
| `_subject` | NeatClock — product interest |

### Greenlight rule of thumb

| Signal | Action |
|--------|--------|
| 20+ responses wanting **prints** + mostly yes/maybe on $4 | Enable `VITE_FEATURE_NEATCLOCK_PRINTS` + create Gumroad product |
| Strong **lockscreen** interest, weak prints | Enable lockscreen first (free) |
| Majority **free-enough** | Delay all paid extras |
| 10+ emails collected | Email when prints launch |

---

## Alternative: Tally (mirror the same questions)

If you prefer Tally for the dashboard, create a form with these **exact questions**:

### Q1 — Multiple choice (required)
**Which schedule do you use most?**
- Homeowner's Sentinel
- Preventive Gearhead
- Automated CFO
- My own custom list

### Q2 — Checkboxes (required)
**After exporting, what would be useful?**
- Styled print packs (~$4)
- Lockscreen wallpapers
- Extra color themes
- Nothing extra — free tool is enough

### Q3 — Multiple choice (required)
**Would you pay ~$4 for a styled print pack?**
- Yes, likely
- Maybe, depends on design
- No — free only

### Q4 — Email (optional)
**Email (optional)** — placeholder: *Notify me when print packs launch*

### Hidden field (optional)
`source` — footer | export

Then set in Vercel:

```
VITE_INTEREST_FORM_ENDPOINT=https://formspree.io/f/xxx
```

Use the **in-app modal** (recommended) — Tally is for your reference if you want a duplicate archive. The native UI posts to Formspree.

---

## Where users see it

1. **Footer card** — “Help shape what we build next” (always when form enabled)
2. **Export success modal** — compact invite after `.ics` download (dismissible once per browser)

Neither shows when prints are live or when no endpoint is configured.

---

## Local testing

```bash
# .env
VITE_INTEREST_FORM_ENDPOINT=https://formspree.io/f/your-test-id
npm run dev
```

Submit once — check Formspree inbox.

---

## Tally question copy (paste-ready)

**Form title:** NeatClock — What should we build next?

**Description:** NeatClock is free. This helps us know which optional extras are worth launching. 30 seconds.

Questions as listed above in Q1–Q4.
