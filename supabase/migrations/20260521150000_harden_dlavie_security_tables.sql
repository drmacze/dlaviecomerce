alter table public.login_events enable row level security;
alter table public.trusted_devices enable row level security;

create index if not exists login_events_user_id_created_at_idx
on public.login_events(user_id, created_at desc);

create index if not exists trusted_devices_user_id_last_seen_idx
on public.trusted_devices(user_id, last_seen_at desc);

create unique index if not exists trusted_devices_user_fingerprint_idx
on public.trusted_devices(user_id, fingerprint);
