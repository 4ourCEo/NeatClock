# NeatClock Business — Neon Postgres Setup Instructions

## External Setup Actions Required

### 1. Provision Neon Database (Vercel Marketplace)

1. Go to Vercel dashboard → Your NeatClock project → Storage
2. Install Neon Postgres integration from Marketplace
3. Create new project named `neatclock-business`
4. Select region (US East recommended)
5. Choose Free plan (1 GB storage, 100 CU-hours compute/month)
6. Vercel will auto-inject `DATABASE_URL` and `DATABASE_URL_UNPOOLED` environment variables

### 2. Run Database Migration

Execute the Neon migration file:

```bash
# Option A: Via Vercel Postgres client in dashboard
# Run SQL from supabase/migrations/202610300001_neon_durable_fulfillment.sql

# Option B: Via psql CLI (if Neon provides connection string)
psql $DATABASE_URL -f supabase/migrations/202610300001_neon_durable_fulfillment.sql
```

Migration creates:
- `neatclock_purchases` table (durable order records)
- `neatclock_webhook_events` table (idempotency tracking)
- `neatclock_recovery_tokens` table (single-use recovery links)
- Indexes for query performance
- Cleanup function for expired tokens

### 3. Create Resend Account

1. Sign up at https://resend.com (Free tier: 3,000 emails/month)
2. Verify sender domain `no-reply@neatclock.pro` (or subdomain)
3. Add DNS records (SPF, DKIM) provided by Resend
4. Generate API key in Resend dashboard

### 4. Configure Vercel Environment Variables

Add the following to Vercel project environment variables (Secret type):

```
# Neon Postgres (auto-injected by Vercel Marketplace)
DATABASE_URL=<auto-injected>
DATABASE_URL_UNPOOLED=<auto-injected>

# Recovery token signing (generate secure 32+ char secret)
NEATCLOCK_RECOVERY_SECRET=<generate-secure-random-32-chars>

# Resend email delivery
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=<Resend API key>
OTP_FROM=no-reply@neatclock.pro

# Existing NeatClock Business config
STRIPE_SECRET_KEY=sk_test_*
NEATCLOCK_STRIPE_WEBHOOK_SECRET=whsec_*
NEATCLOCK_ENTITLEMENT_SECRET=<existing-secret>
NEATCLOCK_BUSINESS_PRICE_CENTS=4900
NEATCLOCK_BUSINESS_CHECKOUT_ENABLED=true

# Legacy Supabase (can be removed once Neon is live)
# NEATCLOCK_SUPABASE_URL=
# NEATCLOCK_SUPABASE_SERVICE_ROLE_KEY=
# NEATCLOCK_SUPABASE_PUBLISHABLE_KEY=
```

### 5. Configure Vercel Protection Bypass for Preview Access

1. Go to Vercel dashboard → Project Settings → Functions → Protection Bypass
2. Generate bypass secret
3. Add to Vercel environment as `VERCEL_AUTOMATION_BYPASS_SECRET` (Secret type)
4. Use in Playwright tests via header: `x-vercel-protection-bypass: <secret>`

### 6. Update E2E Tests for New Recovery Flow

E2E tests need to use token-based recovery instead of Supabase Auth:

```javascript
// Current (Supabase Auth):
await page.goto('/?page=partner&recovery=complete#access_token=...');

// New (Neon token):
await page.goto('/?page=partner&recovery=complete&token=signed.jwt.token');
```

## Cost Summary

- **Neon Postgres**: $0/month (Free plan) or <$1/month (Launch plan)
- **Resend Email**: $0/month (Free tier: 3,000 emails/month)
- **Total**: $0/month at realistic volume

## Key Separation

- **Entitlement signing**: `NEATCLOCK_ENTITLEMENT_SECRET` (for purchase entitlements)
- **Recovery signing**: `NEATCLOCK_RECOVERY_SECRET` (for recovery links)
- Never repurpose the entitlement secret for unrelated token purposes.

## Deployment Order

1. Complete external setup (steps 1-5 above)
2. Commit and push code changes (already done locally)
3. Vercel auto-deploys on push
4. Run hosted QA tests using protection bypass
5. Obtain independent QA approval
6. Deploy to neatclock.pro (requires explicit owner authorization)
