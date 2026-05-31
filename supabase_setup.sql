-- DLAVIE AI Workspace schema setup
-- Jalankan di Supabase SQL Editor. Script ini idempotent untuk tabel utama AI Workspace.

create extension if not exists "pgcrypto";

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  purpose text,
  source text,
  profession text,
  tier text not null default 'free' check (tier in ('free','pro','max','basic','core','custom')),
  has_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Percakapan Baru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null default 'chat_event',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.users_profile enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.usage_logs enable row level security;

drop policy if exists "users_profile_owner_select" on public.users_profile;
create policy "users_profile_owner_select" on public.users_profile for select using (auth.uid() = id);
drop policy if exists "users_profile_owner_insert" on public.users_profile;
create policy "users_profile_owner_insert" on public.users_profile for insert with check (auth.uid() = id);
drop policy if exists "users_profile_owner_update" on public.users_profile;
create policy "users_profile_owner_update" on public.users_profile for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "chat_sessions_owner_all" on public.chat_sessions;
create policy "chat_sessions_owner_all" on public.chat_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "messages_owner_all" on public.messages;
create policy "messages_owner_all" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "usage_logs_owner_select" on public.usage_logs;
create policy "usage_logs_owner_select" on public.usage_logs for select using (auth.uid() = user_id);
drop policy if exists "usage_logs_owner_insert" on public.usage_logs;
create policy "usage_logs_owner_insert" on public.usage_logs for insert with check (auth.uid() = user_id);

create or replace function public.dlavie_ai_rate_limit(p_user_id uuid, p_limit int default 10)
returns table(allowed boolean, used int, remaining int, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int;
  v_oldest timestamptz;
begin
  select count(*), min(created_at)
    into v_used, v_oldest
  from public.usage_logs
  where user_id = p_user_id
    and event = 'chat_event'
    and created_at >= now() - interval '1 hour';

  return query select
    v_used < p_limit,
    v_used,
    greatest(p_limit - v_used, 0),
    coalesce(v_oldest + interval '1 hour', now() + interval '1 hour');
end;
$$;

create index if not exists usage_logs_user_created_idx on public.usage_logs(user_id, created_at desc);
create index if not exists chat_sessions_user_created_idx on public.chat_sessions(user_id, created_at desc);
create index if not exists messages_session_created_idx on public.messages(session_id, created_at asc);
