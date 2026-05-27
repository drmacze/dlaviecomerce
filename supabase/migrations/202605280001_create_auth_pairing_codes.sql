create table if not exists public.auth_pairing_codes (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('telegram', 'whatsapp')),
  code_hash text not null,
  external_id text not null,
  display_name text,
  email text,
  next_path text not null default '/dashboard',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_pairing_codes_lookup_idx
  on public.auth_pairing_codes (channel, code_hash, expires_at)
  where used_at is null;

alter table public.auth_pairing_codes enable row level security;

drop policy if exists "auth_pairing_codes_service_only" on public.auth_pairing_codes;
create policy "auth_pairing_codes_service_only"
  on public.auth_pairing_codes
  for all
  using (false)
  with check (false);
