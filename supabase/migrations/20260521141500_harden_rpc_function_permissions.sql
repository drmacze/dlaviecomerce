alter function public.increment_l_points(uuid, integer)
set search_path = public, pg_temp;

revoke execute on function public.increment_l_points(uuid, integer) from public;
revoke execute on function public.increment_l_points(uuid, integer) from anon;
revoke execute on function public.increment_l_points(uuid, integer) from authenticated;
grant execute on function public.increment_l_points(uuid, integer) to service_role;

revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
grant execute on function public.rls_auto_enable() to service_role;
