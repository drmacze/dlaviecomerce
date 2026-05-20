alter table public.profiles
add column if not exists d_balance integer not null default 0,
add column if not exists d_points integer not null default 0,
add column if not exists vip_level text not null default 'free',
add column if not exists referral_code text,
add column if not exists referred_by uuid references public.profiles(id),
add column if not exists affiliate_enabled boolean not null default false,
add column if not exists affiliate_rank text not null default 'starter',
add column if not exists security_score integer not null default 65,
add column if not exists last_seen_at timestamptz;

update public.profiles
set
  d_points = greatest(d_points, coalesce(l_points, 0)),
  referral_code = coalesce(referral_code, upper(substr(replace(id::text, '-', ''), 1, 8)))
where referral_code is null or d_points = 0;

create unique index if not exists profiles_referral_code_key on public.profiles(referral_code);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('topup','purchase','cashback','reward','refund','adjustment')),
  amount integer not null,
  status text not null default 'pending' check (status in ('pending','success','failed','cancelled')),
  provider text,
  reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid references public.profiles(id) on delete set null,
  referral_code text not null,
  status text not null default 'clicked' check (status in ('clicked','signed_up','purchased','rewarded')),
  reward_points integer not null default 0,
  created_at timestamptz not null default now(),
  unique(referrer_id, referred_id)
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  source text,
  session_id text,
  converted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount integer not null default 0,
  rate numeric(6,3) not null default 0.05,
  status text not null default 'pending' check (status in ('pending','approved','paid','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device text,
  ip text,
  location text,
  user_agent text,
  risk_level text not null default 'low' check (risk_level in ('low','medium','high')),
  created_at timestamptz not null default now()
);

create table if not exists public.vip_tiers (
  id text primary key,
  name text not null,
  price integer,
  d_point_multiplier numeric(5,2) not null default 1,
  cashback_percent numeric(5,2) not null default 0,
  affiliate_multiplier numeric(5,2) not null default 1,
  perks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.vip_tiers(id, name, price, d_point_multiplier, cashback_percent, affiliate_multiplier, perks) values
('silver','Silver',29000,1.20,2.5,1.10,'["Starter aura","Daily bonus","Basic drops"]'::jsonb),
('gold','Gold',59000,1.50,5.0,1.50,'["Gold aura","Cashback+","Affiliate boost"]'::jsonb),
('platinum','Platinum',129000,2.00,7.5,2.00,'["Secret products","Priority AI","Mystery vault"]'::jsonb),
('black','Black',null,3.00,10.0,'["Elite lounge","Private drops","Founder badge"]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  d_point_multiplier = excluded.d_point_multiplier,
  cashback_percent = excluded.cashback_percent,
  affiliate_multiplier = excluded.affiliate_multiplier,
  perks = excluded.perks;

create table if not exists public.reward_vault_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_type text not null default 'mystery',
  title text not null,
  amount integer not null default 0,
  status text not null default 'revealed' check (status in ('locked','revealed','claimed','expired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.login_events enable row level security;
alter table public.vip_tiers enable row level security;
alter table public.reward_vault_claims enable row level security;

create index if not exists wallet_transactions_user_created_idx on public.wallet_transactions(user_id, created_at desc);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id, created_at desc);
create index if not exists affiliate_commissions_affiliate_idx on public.affiliate_commissions(affiliate_id, created_at desc);
create index if not exists login_events_user_created_idx on public.login_events(user_id, created_at desc);
create index if not exists reward_claims_user_created_idx on public.reward_vault_claims(user_id, created_at desc);
