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
set d_points = greatest(d_points, coalesce(l_points, 0)),
    referral_code = coalesce(referral_code, upper(substr(replace(id::text, '-', ''), 1, 8)))
where referral_code is null or d_points = 0;

create unique index if not exists profiles_referral_code_key on public.profiles(referral_code);
