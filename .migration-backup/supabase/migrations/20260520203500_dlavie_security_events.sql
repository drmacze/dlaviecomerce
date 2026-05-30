create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device text,
  ip text,
  location text,
  user_agent text,
  risk_level text not null default 'low',
  created_at timestamptz not null default now()
);

alter table public.login_events enable row level security;
create index if not exists login_events_user_created_idx on public.login_events(user_id, created_at desc);
