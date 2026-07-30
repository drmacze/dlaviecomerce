import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export type ProductAttributes = Record<string, string>;

export type AddressSnapshot = {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | undefined;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
};

export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived']);
export const cartStatusEnum = pgEnum('cart_status', ['active', 'converted', 'abandoned']);
export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'authorized',
  'paid',
  'failed',
  'expired',
  'cancelled',
  'refunded',
  'partially_refunded',
  'requires_review',
]);
export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', [
  'restock',
  'reserve',
  'release',
  'sale',
  'return',
  'adjustment',
]);

const auditColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const customersTable = pgTable(
  'customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    authSubject: text('auth_subject'),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    phone: text('phone'),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('customers_auth_subject_unique').on(table.authSubject),
    uniqueIndex('customers_email_unique').on(table.email),
  ],
);

export const categoriesTable = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('categories_slug_unique').on(table.slug),
    index('categories_active_sort_idx').on(table.isActive, table.sortOrder),
    check('categories_sort_order_non_negative', sql`${table.sortOrder} >= 0`),
  ],
);

export const productsTable = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => categoriesTable.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description').notNull(),
    status: productStatusEnum('status').default('draft').notNull(),
    requiresShipping: boolean('requires_shipping').default(false).notNull(),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('products_slug_unique').on(table.slug),
    index('products_catalog_idx').on(table.status, table.categoryId, table.createdAt),
  ],
);

export const productImagesTable = pgTable(
  'product_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    altText: text('alt_text').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('product_images_product_url_unique').on(table.productId, table.url),
    index('product_images_product_sort_idx').on(table.productId, table.sortOrder),
    check('product_images_sort_order_non_negative', sql`${table.sortOrder} >= 0`),
  ],
);

export const productVariantsTable = pgTable(
  'product_variants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    name: text('name').notNull(),
    priceAmount: integer('price_amount').notNull(),
    compareAtAmount: integer('compare_at_amount'),
    costAmount: integer('cost_amount'),
    currency: varchar('currency', { length: 3 }).default('IDR').notNull(),
    weightGrams: integer('weight_grams').default(0).notNull(),
    attributes: jsonb('attributes').$type<ProductAttributes>().default({}).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('product_variants_sku_unique').on(table.sku),
    index('product_variants_product_active_idx').on(table.productId, table.isActive),
    check('product_variants_price_non_negative', sql`${table.priceAmount} >= 0`),
    check(
      'product_variants_compare_at_valid',
      sql`${table.compareAtAmount} is null or ${table.compareAtAmount} >= ${table.priceAmount}`,
    ),
    check(
      'product_variants_cost_non_negative',
      sql`${table.costAmount} is null or ${table.costAmount} >= 0`,
    ),
    check('product_variants_weight_non_negative', sql`${table.weightGrams} >= 0`),
  ],
);

export const inventoryTable = pgTable(
  'inventory',
  {
    variantId: uuid('variant_id')
      .primaryKey()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    onHand: integer('on_hand').default(0).notNull(),
    reserved: integer('reserved').default(0).notNull(),
    reorderLevel: integer('reorder_level').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('inventory_on_hand_non_negative', sql`${table.onHand} >= 0`),
    check('inventory_reserved_non_negative', sql`${table.reserved} >= 0`),
    check('inventory_reserved_not_above_on_hand', sql`${table.reserved} <= ${table.onHand}`),
    check('inventory_reorder_non_negative', sql`${table.reorderLevel} >= 0`),
  ],
);

export const shippingMethodsTable = pgTable(
  'shipping_methods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    flatRateAmount: integer('flat_rate_amount').notNull(),
    freeAboveAmount: integer('free_above_amount'),
    isActive: boolean('is_active').default(true).notNull(),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('shipping_methods_code_unique').on(table.code),
    index('shipping_methods_active_idx').on(table.isActive),
    check('shipping_methods_flat_rate_non_negative', sql`${table.flatRateAmount} >= 0`),
    check(
      'shipping_methods_free_above_non_negative',
      sql`${table.freeAboveAmount} is null or ${table.freeAboveAmount} >= 0`,
    ),
  ],
);

export const cartsTable = pgTable(
  'carts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').references(() => customersTable.id, { onDelete: 'set null' }),
    sessionTokenHash: text('session_token_hash').notNull(),
    status: cartStatusEnum('status').default('active').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('carts_session_token_hash_unique').on(table.sessionTokenHash),
    index('carts_customer_status_idx').on(table.customerId, table.status),
    index('carts_expiry_idx').on(table.status, table.expiresAt),
  ],
);

export const cartItemsTable = pgTable(
  'cart_items',
  {
    cartId: uuid('cart_id')
      .notNull()
      .references(() => cartsTable.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.cartId, table.variantId], name: 'cart_items_pk' }),
    index('cart_items_variant_idx').on(table.variantId),
    check('cart_items_quantity_valid', sql`${table.quantity} between 1 and 99`),
  ],
);

export const ordersTable = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderNumber: text('order_number').notNull(),
    accessTokenHash: text('access_token_hash').notNull(),
    checkoutIdempotencyKey: text('checkout_idempotency_key').notNull(),
    cartId: uuid('cart_id').references(() => cartsTable.id, { onDelete: 'set null' }),
    customerId: uuid('customer_id').references(() => customersTable.id, { onDelete: 'set null' }),
    shippingMethodId: uuid('shipping_method_id').references(() => shippingMethodsTable.id, {
      onDelete: 'set null',
    }),
    email: text('email').notNull(),
    phone: text('phone'),
    status: orderStatusEnum('status').default('pending_payment').notNull(),
    currency: varchar('currency', { length: 3 }).default('IDR').notNull(),
    subtotalAmount: integer('subtotal_amount').notNull(),
    shippingAmount: integer('shipping_amount').default(0).notNull(),
    discountAmount: integer('discount_amount').default(0).notNull(),
    totalAmount: integer('total_amount').notNull(),
    shippingAddress: jsonb('shipping_address').$type<AddressSnapshot>(),
    customerNote: text('customer_note'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('orders_order_number_unique').on(table.orderNumber),
    uniqueIndex('orders_checkout_idempotency_unique').on(table.checkoutIdempotencyKey),
    uniqueIndex('orders_access_token_hash_unique').on(table.accessTokenHash),
    index('orders_customer_created_idx').on(table.customerId, table.createdAt),
    index('orders_status_created_idx').on(table.status, table.createdAt),
    check('orders_subtotal_non_negative', sql`${table.subtotalAmount} >= 0`),
    check('orders_shipping_non_negative', sql`${table.shippingAmount} >= 0`),
    check('orders_discount_non_negative', sql`${table.discountAmount} >= 0`),
    check(
      'orders_total_consistent',
      sql`${table.totalAmount} = ${table.subtotalAmount} + ${table.shippingAmount} - ${table.discountAmount} and ${table.totalAmount} >= 0`,
    ),
  ],
);

export const orderItemsTable = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => productsTable.id, { onDelete: 'set null' }),
    variantId: uuid('variant_id').references(() => productVariantsTable.id, {
      onDelete: 'set null',
    }),
    sku: text('sku').notNull(),
    productName: text('product_name').notNull(),
    variantName: text('variant_name').notNull(),
    attributes: jsonb('attributes').$type<ProductAttributes>().default({}).notNull(),
    quantity: integer('quantity').notNull(),
    unitPriceAmount: integer('unit_price_amount').notNull(),
    lineTotalAmount: integer('line_total_amount').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('order_items_order_idx').on(table.orderId),
    index('order_items_variant_idx').on(table.variantId),
    check('order_items_quantity_positive', sql`${table.quantity} > 0`),
    check('order_items_unit_price_non_negative', sql`${table.unitPriceAmount} >= 0`),
    check(
      'order_items_line_total_consistent',
      sql`${table.lineTotalAmount} = ${table.unitPriceAmount} * ${table.quantity}`,
    ),
  ],
);

export const paymentsTable = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerOrderId: text('provider_order_id').notNull(),
    providerTransactionId: text('provider_transaction_id'),
    status: paymentStatusEnum('status').default('pending').notNull(),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).default('IDR').notNull(),
    checkoutToken: text('checkout_token'),
    checkoutUrl: text('checkout_url'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    terminalProcessedAt: timestamp('terminal_processed_at', { withTimezone: true }),
    providerResponse: jsonb('provider_response').$type<Record<string, unknown>>(),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('payments_provider_order_unique').on(table.provider, table.providerOrderId),
    index('payments_order_created_idx').on(table.orderId, table.createdAt),
    index('payments_status_created_idx').on(table.status, table.createdAt),
    check('payments_amount_non_negative', sql`${table.amount} >= 0`),
  ],
);

export const paymentEventsTable = pgTable(
  'payment_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    paymentId: uuid('payment_id')
      .notNull()
      .references(() => paymentsTable.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    eventFingerprint: text('event_fingerprint').notNull(),
    eventType: text('event_type').notNull(),
    payloadHash: text('payload_hash').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('payment_events_provider_fingerprint_unique').on(
      table.provider,
      table.eventFingerprint,
    ),
    index('payment_events_payment_processed_idx').on(table.paymentId, table.processedAt),
  ],
);

export const inventoryMovementsTable = pgTable(
  'inventory_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: 'restrict' }),
    orderId: uuid('order_id').references(() => ordersTable.id, { onDelete: 'set null' }),
    type: inventoryMovementTypeEnum('type').notNull(),
    quantityDelta: integer('quantity_delta').notNull(),
    reason: text('reason').notNull(),
    actor: text('actor').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('inventory_movements_variant_created_idx').on(table.variantId, table.createdAt),
    index('inventory_movements_order_idx').on(table.orderId),
    check('inventory_movements_delta_non_zero', sql`${table.quantityDelta} <> 0`),
  ],
);
