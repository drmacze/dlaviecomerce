create table if not exists order_item_targets (
  order_item_id uuid primary key,
  kind varchar(32) not null,
  value text not null,
  created_at timestamptz not null default now(),
  constraint order_item_targets_order_item_fk
    foreign key (order_item_id)
    references order_items (id)
    on delete cascade,
  constraint order_item_targets_kind_valid
    check (kind in ('phone', 'meter_number', 'customer_id', 'game_id', 'account_id')),
  constraint order_item_targets_value_valid
    check (char_length(value) between 3 and 64)
);

create index if not exists order_item_targets_kind_idx
  on order_item_targets (kind);
