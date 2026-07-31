import { sql } from 'drizzle-orm';
import {
  check,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const cartItemTargetsTable = pgTable(
  'cart_item_targets',
  {
    cartId: uuid('cart_id').notNull(),
    variantId: uuid('variant_id').notNull(),
    kind: varchar('kind', { length: 32 }).notNull(),
    value: text('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.cartId, table.variantId], name: 'cart_item_targets_pk' }),
    index('cart_item_targets_variant_idx').on(table.variantId),
    check(
      'cart_item_targets_kind_valid',
      sql`${table.kind} in ('phone', 'meter_number', 'customer_id', 'game_id', 'account_id')`,
    ),
    check('cart_item_targets_value_valid', sql`char_length(${table.value}) between 3 and 64`),
  ],
);
