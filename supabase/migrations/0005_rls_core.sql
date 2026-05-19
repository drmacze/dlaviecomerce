alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.l_point_ledger enable row level security;
alter table public.daily_checkins enable row level security;

create policy if not exists "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy if not exists "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy if not exists "products_public_select_published" on public.products for select using (is_published = true);
create policy if not exists "coupons_public_select_active" on public.coupons for select using (is_active = true);
