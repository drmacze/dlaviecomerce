-- Follow-up hardening for environments that applied the initial policies before
-- conversation/message browser writes were removed.
drop policy if exists "conversations insert own" on public.conversations;
drop policy if exists "conversations delete own" on public.conversations;
drop policy if exists "messages insert own" on public.messages;

revoke execute on function public.match_knowledge_chunks(vector, integer, double precision) from public;
revoke execute on function public.match_knowledge_chunks(vector, integer, double precision) from anon;
revoke execute on function public.match_knowledge_chunks(vector, integer, double precision) from authenticated;
grant execute on function public.match_knowledge_chunks(vector, integer, double precision) to service_role;
