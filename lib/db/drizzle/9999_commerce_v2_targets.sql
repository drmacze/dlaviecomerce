create table if not exists cart_item_targets (
  cart_id uuid not null,
  variant_id uuid not null,
  kind varchar(32) not null,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_item_targets_pk primary key (cart_id, variant_id),
  constraint cart_item_targets_cart_item_fk
    foreign key (cart_id, variant_id)
    references cart_items (cart_id, variant_id)
    on delete cascade,
  constraint cart_item_targets_kind_valid
    check (kind in ('phone', 'meter_number', 'customer_id', 'game_id', 'account_id')),
  constraint cart_item_targets_value_valid
    check (char_length(value) between 3 and 64)
);

create index if not exists cart_item_targets_variant_idx
  on cart_item_targets (variant_id);
