drop policy if exists "ledger_select_own" on public.l_point_ledger;
drop policy if exists "checkins_select_own" on public.daily_checkins;
drop policy if exists "orders_select_by_email" on public.orders;
drop policy if exists "order_items_select_by_order_email" on public.order_items;

create policy "ledger_select_own" on public.l_point_ledger
for select using (auth.uid() = user_id);

create policy "checkins_select_own" on public.daily_checkins
for select using (auth.uid() = user_id);

create policy "orders_select_by_email" on public.orders
for select using (buyer_email = auth.jwt() ->> 'email');

create policy "order_items_select_by_order_email" on public.order_items
for select using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.buyer_email = auth.jwt() ->> 'email'
  )
);
