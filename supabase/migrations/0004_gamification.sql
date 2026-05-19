create table if not exists public.l_point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, checkin_date)
);

create or replace function public.increment_l_points(target_user_id uuid, points_delta integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set l_points = greatest(0, l_points + points_delta)
  where id = target_user_id;
end;
$$;
