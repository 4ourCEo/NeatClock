# Product feedback setup (continuous feedback + greenlight)

NeatClock includes a **native feedback flow** styled like the rest of the app — not an external form link.

## Two modes, one sink

The feedback form adapts based on whether Prints are live:

- **Pre-launch mode** (`VITE_FEATURE_NEATCLOCK_PRINTS` off): Greenlight questions (purchase intent for ~$5 packs, interest checkboxes)
- **Post-launch mode** (`VITE_FEATURE_NEATCLOCK_PRINTS` on): Calibration questions (CTA feel, price reaction, what to build next)

Both modes post to the same Formspree endpoint with clean field names (`mode=pre_launch|post_launch`, `cta_feel`, `price_feel`, etc.).

## Visibility

Feedback shows when:
- A form endpoint is configured (`VITE_INTEREST_FORM_ENDPOINT` **or** `VITE_INTEREST_FORM_EMAIL`)
- **And** either:
  - `VITE_FEATURE_PRODUCT_FEEDBACK` is explicitly `true`, **or**
  - `VITE_FEATURE_PRODUCT_FEEDBACK` is unset (defaults to on when endpoint exists)

Set `VITE_FEATURE_PRODUCT_FEEDBACK=false` to hide feedback even when an endpoint is configured.

---

## Fastest: email only (~2 minutes, no Formspree account)

Set on Vercel:

```
VITE_INTEREST_FORM_EMAIL=you@example.com
```

The app posts to `https://formsubmit.co/ajax/<your-email>`. FormSubmit sends a one-time activation link on first submission — click it, then all future submissions arrive in your inbox.

---

## Recommended long-term: Formspree (5 minutes)

1. Create a free account at [formspree.io](https://formspree.io)
2. New form → name it **NeatClock Interest**
3. Copy the form endpoint: `https://formspree.io/f/xxxxxxxx`
4. Add to Vercel env vars:

```
VITE_INTEREST_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

**Watch the free-tier cap:** Formspree's free plan caps at 50 submissions/month with no
built-in overage alert — once traffic grows, submissions past the cap silently fail
instead of reaching your inbox. Check the Formspree dashboard submission count
periodically, or upgrade to a paid plan once the interest-form data is actually driving
a launch decision.

5. Redeploy

### Fields received (auto-mapped)

**Pre-launch mode:**

| Field | Example |
|-------|---------|
| `mode` | pre_launch |
| `preset` | Homeowner's Sentinel |
| `interests` | prints, lockscreen |
| `purchase_intent` | maybe |
| `email` | user@example.com or (not provided) |
| `source` | export \| footer |
| `_subject` | NeatClock — product interest |

**Post-launch mode:**

| Field | Example |
|-------|---------|
| `mode` | post_launch |
| `preset` | Preventive Gearhead |
| `cta_feel` | helpful \| fine \| too_pushy |
| `price_feel` | fair \| high \| low \| no_opinion |
| `next_interest` | more-print-themes, lockscreen |
| `note` | Optional free text or (none) |
| `email` | user@example.com or (not provided) |
| `source` | export \| footer |
| `_subject` | NeatClock — product feedback |

### Greenlight / calibration strategy

**Pre-launch (greenlight):**

| Signal | Action |
|--------|--------|
| 20+ responses wanting **prints** + mostly yes/maybe on $5 | Enable `VITE_FEATURE_NEATCLOCK_PRINTS` + create Gumroad product |
| Strong **lockscreen** interest, weak prints | Enable lockscreen first (free) |
| Majority **free-enough** | Delay all paid extras |
| 10+ emails collected | Email when prints launch |

**Post-launch (calibration):**

| Signal | Action |
|--------|--------|
| Majority **too pushy** on CTAs | Reduce prominence or move to footer only |
| Majority **high** on price | Consider lowering bundle or individual pack prices |
| Strong demand for **more-print-themes** | Prioritize additional print pack designs |
| Majority **free-enough** after launch | Focus on improving free export; delay more paid features |

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

## Analytics (Plausible goals)

The following custom events are tracked (configure as goals in Plausible dashboard):

| Event | Properties | When |
|-------|-----------|------|
| `feedback_open` | `source` (footer\|export), `mode` (pre_launch\|post_launch) | User opens feedback modal |
| `feedback_submit` | `source`, `mode`, `preset` | User submits feedback |
| `print_cta_click` | `product_id`, `product_name`, `price` | User clicks a print pack ProductCard link |

Document these in `MONETIZATION.md` or your internal analytics playbook.

---

## Where users see it

1. **Footer card** — "Help shape what we build next" (pre-launch) / "How are the print packs working?" (post-launch)
2. **Export success modal** — compact invite after `.ics` download (dismissible once per browser)

Shows whenever a form endpoint is configured and `VITE_FEATURE_PRODUCT_FEEDBACK` is not explicitly `false`. Mode adapts automatically based on `VITE_FEATURE_NEATCLOCK_PRINTS`.

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
