create table if not exists public.reward_broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  reward_type text not null default 'coupon',
  coupon_code text,
  d_points integer not null default 0,
  target_type text not null default 'all',
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  broadcast_id uuid references public.reward_broadcasts(id) on delete cascade,
  status text not null default 'locked',
  revealed_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, broadcast_id)
);

alter table public.reward_broadcasts enable row level security;
alter table public.user_rewards enable row level security;

create policy if not exists "active reward broadcasts are readable"
on public.reward_broadcasts for select
using (is_active = true and starts_at <= now() and (expires_at is null or expires_at > now()));

create policy if not exists "users can read own rewards"
on public.user_rewards for select
using (auth.uid() = user_id);
