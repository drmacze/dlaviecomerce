create table if not exists public.trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fingerprint text not null,
  label text,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique(user_id, fingerprint)
);

alter table public.trusted_devices enable row level security;

create index if not exists trusted_devices_user_idx
on public.trusted_devices(user_id, revoked_at, last_seen_at desc);
