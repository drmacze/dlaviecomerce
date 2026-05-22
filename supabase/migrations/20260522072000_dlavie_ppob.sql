create table if not exists public.ppob_products (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'digiflazz',
  sku_code text not null,
  product_name text not null,
  category text not null default 'Digital',
  brand text,
  product_type text,
  description text,
  provider_price integer not null default 0,
  margin integer not null default 0,
  selling_price integer not null default 0,
  stock integer not null default 0,
  unlimited_stock boolean not null default true,
  multi boolean not null default false,
  buyer_product_status boolean not null default true,
  seller_product_status boolean not null default true,
  is_active boolean not null default true,
  raw jsonb not null default '{}'::jsonb,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, sku_code)
);

create table if not exists public.ppob_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.ppob_products(id) on delete set null,
  ref_id text not null unique,
  provider text not null default 'digiflazz',
  sku_code text not null,
  product_name text not null,
  customer_no text not null,
  provider_price integer not null default 0,
  margin integer not null default 0,
  selling_price integer not null default 0,
  status text not null default 'pending',
  provider_status text,
  provider_rc text,
  provider_message text,
  serial_number text,
  wallet_transaction_id uuid references public.wallet_transactions(id) on delete set null,
  refund_wallet_transaction_id uuid references public.wallet_transactions(id) on delete set null,
  raw_response jsonb not null default '{}'::jsonb,
  raw_callback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  settled_at timestamptz
);

alter table public.ppob_products enable row level security;
alter table public.ppob_orders enable row level security;

drop policy if exists "ppob active products are public" on public.ppob_products;
create policy "ppob active products are public"
  on public.ppob_products
  for select
  using (is_active = true);

drop policy if exists "users can view own ppob orders" on public.ppob_orders;
create policy "users can view own ppob orders"
  on public.ppob_orders
  for select
  using (auth.uid() = user_id);

create index if not exists ppob_products_category_idx on public.ppob_products(category, brand);
create index if not exists ppob_products_active_price_idx on public.ppob_products(is_active, selling_price);
create index if not exists ppob_orders_user_created_idx on public.ppob_orders(user_id, created_at desc);
create index if not exists ppob_orders_ref_idx on public.ppob_orders(ref_id);
create index if not exists ppob_orders_status_idx on public.ppob_orders(status, created_at desc);
