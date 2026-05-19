create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_email text not null,
  total_amount integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty integer not null default 1,
  price integer not null default 0,
  created_at timestamptz not null default now()
);
