-- Dlavie Security & Observability Foundation
-- Run this in Supabase SQL Editor.

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  channel text not null default 'telegram',
  status text not null check (status in ('pending', 'sent', 'failed', 'skipped')),
  recipient text,
  title text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notification_logs_type_idx on public.notification_logs(type);
create index if not exists notification_logs_status_idx on public.notification_logs(status);
create index if not exists notification_logs_created_at_idx on public.notification_logs(created_at desc);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_admin_email_idx on public.admin_audit_logs(admin_email);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs(action);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);

alter table public.notification_logs enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Service role bypasses RLS. Browser clients should not directly read/write these tables.
-- Admin access should go through protected server API routes.

create policy if not exists "deny client notification log reads"
  on public.notification_logs
  for select
  using (false);

create policy if not exists "deny client notification log writes"
  on public.notification_logs
  for insert
  with check (false);

create policy if not exists "deny client audit log reads"
  on public.admin_audit_logs
  for select
  using (false);

create policy if not exists "deny client audit log writes"
  on public.admin_audit_logs
  for insert
  with check (false);
