-- Neon Postgres migration for NeatClock Business
-- Replaces Supabase-specific RPC with standard SQL transaction

create table if not exists public.neatclock_purchases (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique,
  checkout_session_id text unique,
  payment_intent_id text,
  purchaser_email text,
  product_id text not null,
  product_version text not null,
  industry text not null check (industry in ('hvac', 'plumbing')),
  amount_minor integer not null check (amount_minor > 0),
  currency text not null check (currency = 'usd'),
  artifact_url text not null,
  business_id text not null,
  order_proof_hash text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  fulfillment_status text not null default 'pending' check (fulfillment_status in ('pending', 'ready')),
  stripe_event_id text,
  stripe_event_created_at timestamptz,
  paid_at timestamptz,
  artifact_ready_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.neatclock_webhook_events (
  stripe_event_id text primary key,
  event_created_at timestamptz not null,
  checkout_session_id text,
  outcome text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.neatclock_recovery_tokens (
  token_hash text primary key,
  purchaser_email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint unique_email unique (purchaser_email)
);

-- Indexes for query performance
create index if not exists idx_neatclock_purchases_session on public.neatclock_purchases(checkout_session_id);
create index if not exists idx_neatclock_purchases_email on public.neatclock_purchases(purchaser_email);
create index if not exists idx_neatclock_purchases_status on public.neatclock_purchases(fulfillment_status);
create index if not exists idx_neatclock_recovery_tokens_email on public.neatclock_recovery_tokens(purchaser_email);
create index if not exists idx_neatclock_recovery_tokens_expires on public.neatclock_recovery_tokens(expires_at);

-- Clean up expired recovery tokens periodically (via cron or application logic)
-- Optional: create a function for manual cleanup
create or replace function public.cleanup_expired_recovery_tokens()
returns int
language plpgsql
as $$
declare
  deleted_count int;
begin
  delete from public.neatclock_recovery_tokens where expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
