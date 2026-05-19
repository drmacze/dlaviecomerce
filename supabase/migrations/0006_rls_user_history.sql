create policy if not exists "ledger_select_own" on public.l_point_ledger
for select using (auth.uid() = user_id);

create policy if not exists "checkins_select_own" on public.daily_checkins
for select using (auth.uid() = user_id);

create policy if not exists "orders_select_by_email" on public.orders
for select using (buyer_email = auth.jwt() ->> 'email');

create policy if not exists "order_items_select_by_order_email" on public.order_items
for select using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.buyer_email = auth.jwt() ->> 'email'
  )
);
