create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  amount integer not null,
  status text not null default 'pending',
  provider text,
  reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;
create index if not exists wallet_transactions_user_created_idx on public.wallet_transactions(user_id, created_at desc);
