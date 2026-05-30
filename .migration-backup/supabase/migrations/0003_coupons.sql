create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent',
  amount integer not null default 0,
  min_amount integer not null default 0,
  usage_limit integer,
  redeemed_count integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists coupons_code_idx on public.coupons(code);
