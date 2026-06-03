create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text, mode text not null default 'dlavie', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role text not null check (role in ('system','user','assistant','tool')),
  content text not null, model text, provider text, metadata jsonb default '{}', created_at timestamptz default now()
);
create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(), title text not null, source_type text not null default 'manual', source_url text,
  content text not null, metadata jsonb default '{}', created_by uuid references auth.users(id), created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  chunk_index integer not null, content text not null, embedding vector(1536), token_count integer, metadata jsonb default '{}', created_at timestamptz default now()
);
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, route text not null,
  provider text, model text, prompt_tokens integer default 0, completion_tokens integer default 0, total_tokens integer default 0,
  estimated_cost numeric default 0, latency_ms integer, status text not null, error_message text, metadata jsonb default '{}', created_at timestamptz default now()
);
create table if not exists public.api_events (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, event_type text not null,
  ip_hash text, user_agent text, metadata jsonb default '{}', created_at timestamptz default now()
);
create index if not exists idx_conversations_user_updated on public.conversations(user_id, updated_at desc);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at asc);
create index if not exists idx_knowledge_chunks_document on public.knowledge_chunks(document_id);
create index if not exists idx_usage_logs_user_created on public.usage_logs(user_id, created_at desc);
create index if not exists idx_knowledge_chunks_embedding on public.knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
