-- M2: credits system — profiles.credits_balance, ledger, product catalog,
-- 30-credit signup bonus, and the insufficient_credits job status.

-- 0. profiles — M1 never created it, so M2 does.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "Users can view own profile" on public.profiles
    for select using (id = auth.uid());
exception when duplicate_object then null; end $$;

-- 1. Balance lives on the profile; the ledger below is the audit trail.
alter table public.profiles
  add column if not exists credits_balance numeric not null default 30;

-- 2. Ledger: append-only record of every credit movement.
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('purchase', 'deduction', 'signup_bonus', 'admin_grant')),
  description text,
  job_id uuid references public.jobs(id),
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user_id
  on public.credit_transactions(user_id, created_at desc);

-- Idempotency for webhook retries: at most one purchase per payment intent.
-- Partial so signup bonuses and deductions are unconstrained.
create unique index if not exists uniq_credit_tx_payment_intent
  on public.credit_transactions(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.credit_transactions enable row level security;

do $$ begin
  create policy "Users can view own transactions" on public.credit_transactions
    for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 3. Product catalog. stripe_price_id stays null until the Stripe prices exist;
-- the checkout route refuses any product without one.
create table if not exists public.credit_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits numeric not null,
  price_usd numeric not null,
  stripe_price_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.credit_products enable row level security;

do $$ begin
  create policy "Authenticated users can view active products" on public.credit_products
    for select to authenticated using (active = true);
exception when duplicate_object then null; end $$;

insert into public.credit_products (name, credits, price_usd, stripe_price_id)
select * from (values
  ('10 Credits', 10::numeric, 10.00::numeric, null::text),
  ('45 Credits', 45::numeric, 30.00::numeric, null::text),
  ('90 Credits', 90::numeric, 60.00::numeric, null::text)
) as v(name, credits, price_usd, stripe_price_id)
where not exists (select 1 from public.credit_products);

-- 4. Every new signup gets a profile and 30 free credits.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, email, credits_balance)
    values (new.id, 'user', new.email, 30)
    on conflict (id) do nothing;
  insert into public.credit_transactions (user_id, amount, type, description)
    values (new.id, 30, 'signup_bonus', 'Welcome bonus — 30 free credits');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Jobs can now stop before Whisper when the balance is too low.
-- These are this project's actual status values plus the new one.
alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add constraint jobs_status_check
  check (status in ('pending', 'downloading', 'transcribe', 'done', 'failed', 'insufficient_credits'));

-- 6. Backfill users who signed up before the trigger existed.
insert into public.profiles (id, role, email, credits_balance)
select u.id, 'user', u.email, 30 from auth.users u
on conflict (id) do nothing;

insert into public.credit_transactions (user_id, amount, type, description)
select u.id, 30, 'signup_bonus', 'Welcome bonus — 30 free credits (backfilled)'
from auth.users u
left join public.credit_transactions ct on ct.user_id = u.id and ct.type = 'signup_bonus'
where ct.id is null;
