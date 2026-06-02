create extension if not exists pgcrypto;

create schema if not exists commerce;
create schema if not exists ai;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth0_user_id text unique,
  email text unique,
  full_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists commerce.transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  type text not null default 'ppob',
  status text not null default 'created',
  amount numeric(14,2) not null default 0,
  provider_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists commerce.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai.usage_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  feature text not null,
  units integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table commerce.transactions enable row level security;
alter table commerce.audit_logs enable row level security;
alter table ai.usage_logs enable row level security;
