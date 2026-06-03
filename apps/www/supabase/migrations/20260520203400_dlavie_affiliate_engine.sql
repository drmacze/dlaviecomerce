create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  source text,
  session_id text,
  converted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount integer not null default 0,
  rate numeric(6,3) not null default 0.05,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_commissions enable row level security;
create index if not exists affiliate_commissions_affiliate_idx on public.affiliate_commissions(affiliate_id, created_at desc);
