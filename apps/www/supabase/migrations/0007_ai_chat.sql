create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  title text not null default 'Lumina Chat',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

drop policy if exists "ai_sessions_select_by_email" on public.ai_chat_sessions;
drop policy if exists "ai_messages_select_by_session_email" on public.ai_chat_messages;

create policy "ai_sessions_select_by_email" on public.ai_chat_sessions
for select using (user_email = auth.jwt() ->> 'email');

create policy "ai_messages_select_by_session_email" on public.ai_chat_messages
for select using (
  exists (
    select 1 from public.ai_chat_sessions
    where ai_chat_sessions.id = ai_chat_messages.session_id
    and ai_chat_sessions.user_email = auth.jwt() ->> 'email'
  )
);
