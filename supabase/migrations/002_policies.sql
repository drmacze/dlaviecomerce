alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.usage_logs enable row level security;
alter table public.api_events enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "conversations read own" on public.conversations for select using (auth.uid() = user_id);
create policy "conversations insert own" on public.conversations for insert with check (auth.uid() = user_id);
create policy "conversations delete own" on public.conversations for delete using (auth.uid() = user_id);
create policy "messages read own" on public.messages for select using (auth.uid() = user_id);
create policy "messages insert own" on public.messages for insert with check (auth.uid() = user_id);
-- Knowledge and usage tables are intentionally managed by backend service-role clients.
