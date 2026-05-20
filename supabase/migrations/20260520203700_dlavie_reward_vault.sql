create table if not exists public.reward_vault_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_type text not null default 'mystery',
  title text not null,
  amount integer not null default 0,
  status text not null default 'revealed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.reward_vault_claims enable row level security;
create index if not exists reward_claims_user_created_idx on public.reward_vault_claims(user_id, created_at desc);
