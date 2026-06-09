create table if not exists public.dlavie_ai_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  history_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dlavie_ai_preferences enable row level security;
create policy "Users can read own ai preferences" on public.dlavie_ai_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own ai preferences" on public.dlavie_ai_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own ai preferences" on public.dlavie_ai_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
