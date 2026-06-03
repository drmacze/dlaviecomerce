alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.usage_logs enable row level security;
alter table public.api_events enable row level security;

-- Browser clients may read their own profile and chat history, but writes are intentionally
-- performed through the backend service-role API so clients cannot forge assistant/system
-- messages, modify ownership fields, or bypass usage logging.
create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "conversations read own" on public.conversations for select using (auth.uid() = user_id);
create policy "messages read own" on public.messages for select using (auth.uid() = user_id);

-- Knowledge, usage, and event tables have no browser policies by design. The service-role
-- backend bypasses RLS for vetted admin operations and usage/event writes.
