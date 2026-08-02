import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { orderItemsTable, ordersTable } from './commerce.js';

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

export const orderItemTargetsTable = pgTable(
  'order_item_targets',
  {
    orderItemId: uuid('order_item_id')
      .primaryKey()
      .references(() => orderItemsTable.id, { onDelete: 'cascade' }),
    kind: varchar('kind', { length: 32 }).notNull(),
    value: text('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check(
      'order_item_targets_kind_valid',
      sql`${table.kind} in ('phone', 'meter_number', 'customer_id', 'game_id', 'account_id')`,
    ),
    check('order_item_targets_value_valid', sql`char_length(${table.value}) between 3 and 64`),
  ],
);

export const providerFulfillmentsTable = pgTable(
  'provider_fulfillments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    orderItemId: uuid('order_item_id')
      .notNull()
      .references(() => orderItemsTable.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 32 }).notNull(),
    providerReference: text('provider_reference').notNull(),
    providerSku: text('provider_sku').notNull(),
    customerReferenceKind: varchar('customer_reference_kind', { length: 32 }).notNull(),
    customerReferenceValue: text('customer_reference_value').notNull(),
    status: varchar('status', { length: 32 }).default('waiting_payment').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }),
    providerCode: text('provider_code'),
    providerMessage: text('provider_message'),
    serialNumber: text('serial_number'),
    providerResponse: jsonb('provider_response').$type<Record<string, unknown>>(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('provider_fulfillments_order_item_unique').on(table.orderItemId),
    uniqueIndex('provider_fulfillments_reference_unique').on(
      table.provider,
      table.providerReference,
    ),
    index('provider_fulfillments_order_status_idx').on(table.orderId, table.status),
    index('provider_fulfillments_retry_idx').on(table.status, table.nextAttemptAt),
    check(
      'provider_fulfillments_status_valid',
      sql`${table.status} in ('waiting_payment', 'pending', 'processing', 'retrying', 'succeeded', 'failed', 'requires_review', 'cancelled')`,
    ),
    check('provider_fulfillments_attempts_non_negative', sql`${table.attempts} >= 0`),
    check(
      'provider_fulfillments_reference_kind_valid',
      sql`${table.customerReferenceKind} in ('phone', 'meter_number', 'customer_id', 'game_id', 'account_id')`,
    ),
  ],
);

export const providerFulfillmentEventsTable = pgTable(
  'provider_fulfillment_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fulfillmentId: uuid('fulfillment_id')
      .notNull()
      .references(() => providerFulfillmentsTable.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('provider_fulfillment_events_fulfillment_idx').on(table.fulfillmentId, table.createdAt),
  ],
);
