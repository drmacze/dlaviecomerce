create table if not exists order_item_targets (
  order_item_id uuid primary key references order_items (id) on delete cascade,
  kind varchar(32) not null,
  value text not null,
  created_at timestamptz not null default now(),
  constraint order_item_targets_kind_valid
    check (kind in ('phone', 'meter_number', 'customer_id', 'game_id', 'account_id')),
  constraint order_item_targets_value_valid
    check (char_length(value) between 3 and 64)
);

create table if not exists provider_fulfillments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  order_item_id uuid not null references order_items (id) on delete cascade,
  provider varchar(32) not null,
  provider_reference text not null,
  provider_sku text not null,
  customer_reference_kind varchar(32) not null,
  customer_reference_value text not null,
  status varchar(32) not null default 'waiting_payment',
  attempts integer not null default 0,
  next_attempt_at timestamptz,
  provider_code text,
  provider_message text,
  serial_number text,
  provider_response jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_fulfillments_order_item_unique unique (order_item_id),
  constraint provider_fulfillments_reference_unique unique (provider, provider_reference),
  constraint provider_fulfillments_status_valid
    check (status in ('waiting_payment', 'pending', 'processing', 'retrying', 'succeeded', 'failed', 'requires_review', 'cancelled')),
  constraint provider_fulfillments_attempts_non_negative check (attempts >= 0),
  constraint provider_fulfillments_reference_kind_valid
    check (customer_reference_kind in ('phone', 'meter_number', 'customer_id', 'game_id', 'account_id')),
  constraint provider_fulfillments_reference_value_valid
    check (char_length(customer_reference_value) between 3 and 64)
);

create index if not exists provider_fulfillments_order_status_idx
  on provider_fulfillments (order_id, status);
create index if not exists provider_fulfillments_retry_idx
  on provider_fulfillments (status, next_attempt_at);

create table if not exists provider_fulfillment_events (
  id uuid primary key default gen_random_uuid(),
  fulfillment_id uuid not null references provider_fulfillments (id) on delete cascade,
  event_type varchar(64) not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists provider_fulfillment_events_fulfillment_idx
  on provider_fulfillment_events (fulfillment_id, created_at);
