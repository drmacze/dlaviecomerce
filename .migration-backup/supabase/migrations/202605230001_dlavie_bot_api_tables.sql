-- Dlavie Bot API tables
-- Run this in Supabase SQL editor if these tables do not exist yet.

create table if not exists public.bot_features (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text,
  action text,
  enabled boolean not null default true,
  menu boolean not null default true,
  sort_order integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'umum',
  enabled boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ppob_products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text not null,
  provider text,
  price numeric not null default 0,
  admin_fee numeric not null default 0,
  description text,
  enabled boolean not null default true,
  sort_order integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deposit_methods (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  min_amount numeric not null default 0,
  max_amount numeric,
  admin_fee numeric not null default 0,
  enabled boolean not null default true,
  sort_order integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  channel text not null default 'whatsapp',
  wa_number text,
  account_id text,
  category text not null default 'lainnya',
  subject text not null,
  description text,
  photo_url text,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ppob_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  channel text not null default 'whatsapp',
  wa_number text,
  account_id text,
  product_id text,
  product_code text,
  product_name text,
  target text,
  customer_note text,
  price numeric not null default 0,
  status text not null default 'pending',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deposit_requests (
  id uuid primary key default gen_random_uuid(),
  deposit_number text unique not null,
  channel text not null default 'whatsapp',
  wa_number text,
  account_id text,
  method_id text,
  method_name text,
  amount numeric not null default 0,
  status text not null default 'pending',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_links (
  id uuid primary key default gen_random_uuid(),
  wa_number text not null,
  email text,
  account_id text,
  connect_code text not null,
  status text not null default 'pending',
  expires_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_wa_number on public.support_tickets (wa_number);
create index if not exists idx_ppob_products_category on public.ppob_products (category);
create index if not exists idx_whatsapp_links_wa_code_status on public.whatsapp_links (wa_number, connect_code, status);

