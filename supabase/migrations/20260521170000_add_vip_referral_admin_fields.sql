alter table public.profiles add column if not exists vip_tier text not null default 'free';
alter table public.profiles add column if not exists premium_expires_at timestamptz;
alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id);
alter table public.profiles add column if not exists referral_earnings numeric not null default 0;
alter table public.profiles add column if not exists cashback_rate numeric not null default 0;

create unique index if not exists profiles_referral_code_unique on public.profiles(referral_code) where referral_code is not null;
create index if not exists profiles_vip_tier_idx on public.profiles(vip_tier);
create index if not exists wallet_transactions_type_status_idx on public.wallet_transactions(type, status);
