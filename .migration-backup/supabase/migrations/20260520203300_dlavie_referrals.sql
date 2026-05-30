create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid references public.profiles(id) on delete set null,
  referral_code text not null,
  status text not null default 'clicked',
  reward_points integer not null default 0,
  created_at timestamptz not null default now(),
  unique(referrer_id, referred_id)
);

alter table public.referrals enable row level security;
create index if not exists referrals_referrer_idx on public.referrals(referrer_id, created_at desc);
