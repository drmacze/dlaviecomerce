drop policy if exists trusted_devices_select_own on public.trusted_devices;
create policy trusted_devices_select_own
on public.trusted_devices
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists trusted_devices_insert_own on public.trusted_devices;
create policy trusted_devices_insert_own
on public.trusted_devices
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists trusted_devices_delete_own on public.trusted_devices;
create policy trusted_devices_delete_own
on public.trusted_devices
for delete
to authenticated
using (auth.uid() = user_id);
