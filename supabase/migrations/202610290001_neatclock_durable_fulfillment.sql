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

create table if not exists public.neatclock_recovery_claims (
  auth_session_id uuid primary key,
  auth_user_id uuid not null,
  purchaser_email text not null,
  consumed_at timestamptz not null default now()
);

alter table public.neatclock_purchases enable row level security;
alter table public.neatclock_webhook_events enable row level security;
alter table public.neatclock_recovery_claims enable row level security;
revoke all on public.neatclock_purchases from anon, authenticated;
revoke all on public.neatclock_webhook_events from anon, authenticated;
revoke all on public.neatclock_recovery_claims from anon, authenticated;

create or replace function public.fulfill_neatclock_purchase(
  p_event_id text,
  p_event_created timestamptz,
  p_session_id text,
  p_order_reference text,
  p_email text,
  p_amount_minor integer,
  p_currency text,
  p_payment_intent_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  purchase public.neatclock_purchases;
begin
  insert into public.neatclock_webhook_events(stripe_event_id, event_created_at, checkout_session_id, outcome)
  values (p_event_id, p_event_created, p_session_id, 'processing')
  on conflict do nothing;
  if not found then return jsonb_build_object('outcome', 'duplicate'); end if;

  select * into purchase from public.neatclock_purchases
  where order_reference = p_order_reference and checkout_session_id = p_session_id
  for update;
  if not found then
    delete from public.neatclock_webhook_events where stripe_event_id = p_event_id;
    raise exception 'purchase_not_found';
  end if;
  if purchase.product_id <> 'neatclock.business-calendar-qr'
    or purchase.amount_minor <> p_amount_minor or purchase.currency <> p_currency then
    update public.neatclock_webhook_events set outcome = 'payment_mismatch' where stripe_event_id = p_event_id;
    return jsonb_build_object('outcome', 'payment_mismatch');
  end if;

  update public.neatclock_purchases set
    payment_status = 'paid', fulfillment_status = 'ready', purchaser_email = p_email,
    payment_intent_id = coalesce(payment_intent_id, p_payment_intent_id), stripe_event_id = coalesce(stripe_event_id, p_event_id),
    stripe_event_created_at = coalesce(stripe_event_created_at, p_event_created),
    paid_at = coalesce(paid_at, now()), artifact_ready_at = coalesce(artifact_ready_at, now()), updated_at = now()
  where id = purchase.id;
  update public.neatclock_webhook_events set outcome = 'fulfilled' where stripe_event_id = p_event_id;
  return jsonb_build_object('outcome', 'fulfilled', 'purchase_id', purchase.id);
end;
$$;

revoke all on function public.fulfill_neatclock_purchase(text,timestamptz,text,text,text,integer,text,text) from public, anon, authenticated;
grant execute on function public.fulfill_neatclock_purchase(text,timestamptz,text,text,text,integer,text,text) to service_role;
