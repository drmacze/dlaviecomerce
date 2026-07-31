import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  and,
  asc,
  categoriesTable,
  db,
  desc,
  eq,
  ilike,
  inArray,
  inventoryMovementsTable,
  inventoryTable,
  orderItemsTable,
  ordersTable,
  or,
  paymentsTable,
  productImagesTable,
  productsTable,
  productVariantsTable,
  shippingMethodsTable,
  sql,
} from '../../lib/db/src/index.js';
import { uuidSchema } from '../commerce/validation.js';
import { AppError } from '../lib/errors.js';
import { requireCommerceAdmin } from '../middleware/commerceAdmin.js';

const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

function parseId(params: unknown, key: string): string {
  return uuidSchema.parse((params as Record<string, unknown>)[key]);
}

export async function commerceAdminReadRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/admin/commerce/overview', { preHandler: requireCommerceAdmin }, async () => {
    const [[productCounts], [orderCounts], [inventoryCounts]] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          draft: sql<number>`count(*) filter (where ${productsTable.status} = 'draft')::int`,
          active: sql<number>`count(*) filter (where ${productsTable.status} = 'active')::int`,
          archived: sql<number>`count(*) filter (where ${productsTable.status} = 'archived')::int`,
        })
        .from(productsTable),
      db
        .select({
          total: sql<number>`count(*)::int`,
          pendingPayment: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending_payment')::int`,
          paid: sql<number>`count(*) filter (where ${ordersTable.status} = 'paid')::int`,
          processing: sql<number>`count(*) filter (where ${ordersTable.status} = 'processing')::int`,
          shipped: sql<number>`count(*) filter (where ${ordersTable.status} = 'shipped')::int`,
          completed: sql<number>`count(*) filter (where ${ordersTable.status} = 'completed')::int`,
          grossPaidAmount: sql<number>`coalesce(sum(${ordersTable.totalAmount}) filter (where ${ordersTable.status} in ('paid', 'processing', 'shipped', 'completed')), 0)::int`,
        })
        .from(ordersTable),
      db
        .select({
          onHand: sql<number>`coalesce(sum(${inventoryTable.onHand}), 0)::int`,
          reserved: sql<number>`coalesce(sum(${inventoryTable.reserved}), 0)::int`,
          lowStockVariants: sql<number>`count(*) filter (where (${inventoryTable.onHand} - ${inventoryTable.reserved}) <= ${inventoryTable.reorderLevel})::int`,
        })
        .from(inventoryTable),
    ]);

    return {
      data: {
        products: productCounts ?? { total: 0, draft: 0, active: 0, archived: 0 },
        orders:
          orderCounts ??
          ({
            total: 0,
            pendingPayment: 0,
            paid: 0,
            processing: 0,
            shipped: 0,
            completed: 0,
            grossPaidAmount: 0,
          } as const),
        inventory: inventoryCounts ?? { onHand: 0, reserved: 0, lowStockVariants: 0 },
      },
    };
  });

  app.get('/v1/admin/commerce/categories', { preHandler: requireCommerceAdmin }, async () => ({
    data: await db.select().from(categoriesTable).orderBy(asc(categoriesTable.name)),
  }));

  app.get(
    '/v1/admin/commerce/shipping-methods',
    { preHandler: requireCommerceAdmin },
    async () => ({
      data: await db.select().from(shippingMethodsTable).orderBy(asc(shippingMethodsTable.name)),
    }),
  );

  app.get('/v1/admin/commerce/products', { preHandler: requireCommerceAdmin }, async (request) => {
    const query = productListQuerySchema.parse(request.query);
    const conditions = [
      ...(query.status ? [eq(productsTable.status, query.status)] : []),
      ...(query.search
        ? [
            or(
              ilike(productsTable.name, `%${query.search}%`),
              ilike(productsTable.slug, `%${query.search}%`),
            ),
          ]
        : []),
    ];
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [countRow]] = await Promise.all([
      db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          slug: productsTable.slug,
          status: productsTable.status,
          requiresShipping: productsTable.requiresShipping,
          categoryId: productsTable.categoryId,
          categoryName: categoriesTable.name,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
        .where(where)
        .orderBy(desc(productsTable.updatedAt))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(productsTable)
        .where(where),
    ]);

    const productIds = rows.map((row) => row.id);
    const [variants, images] =
      productIds.length === 0
        ? [[], []]
        : await Promise.all([
            db
              .select({
                productId: productVariantsTable.productId,
                id: productVariantsTable.id,
                isActive: productVariantsTable.isActive,
                onHand: inventoryTable.onHand,
                reserved: inventoryTable.reserved,
                lowStockThreshold: inventoryTable.reorderLevel,
              })
              .from(productVariantsTable)
              .leftJoin(inventoryTable, eq(inventoryTable.variantId, productVariantsTable.id))
              .where(inArray(productVariantsTable.productId, productIds)),
            db
              .select({
                productId: productImagesTable.productId,
                url: productImagesTable.url,
                isPrimary: productImagesTable.isPrimary,
                sortOrder: productImagesTable.sortOrder,
              })
              .from(productImagesTable)
              .where(inArray(productImagesTable.productId, productIds))
              .orderBy(desc(productImagesTable.isPrimary), asc(productImagesTable.sortOrder)),
          ]);

    return {
      data: rows.map((product) => {
        const productVariants = variants.filter((variant) => variant.productId === product.id);
        const productImages = images.filter((image) => image.productId === product.id);
        return {
          ...product,
          variantCount: productVariants.length,
          activeVariantCount: productVariants.filter((variant) => variant.isActive).length,
          availableQuantity: productVariants.reduce(
            (total, variant) =>
              total + Math.max(0, (variant.onHand ?? 0) - (variant.reserved ?? 0)),
            0,
          ),
          lowStockVariantCount: productVariants.filter(
            (variant) =>
              (variant.onHand ?? 0) - (variant.reserved ?? 0) <= (variant.lowStockThreshold ?? 0),
          ).length,
          primaryImageUrl: productImages[0]?.url ?? null,
        };
      }),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: countRow?.total ?? 0,
      },
    };
  });

  app.get(
    '/v1/admin/commerce/products/:productId',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const productId = parseId(request.params, 'productId');
      const [product] = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          slug: productsTable.slug,
          description: productsTable.description,
          status: productsTable.status,
          categoryId: productsTable.categoryId,
          categoryName: categoriesTable.name,
          requiresShipping: productsTable.requiresShipping,
          seoTitle: productsTable.seoTitle,
          seoDescription: productsTable.seoDescription,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
        .where(eq(productsTable.id, productId))
        .limit(1);
      if (!product) throw new AppError('NOT_FOUND', 'Product was not found.', 404);

      const [variants, images] = await Promise.all([
        db
          .select({
            id: productVariantsTable.id,
            sku: productVariantsTable.sku,
            name: productVariantsTable.name,
            priceAmount: productVariantsTable.priceAmount,
            compareAtAmount: productVariantsTable.compareAtAmount,
            currency: productVariantsTable.currency,
            attributes: productVariantsTable.attributes,
            weightGrams: productVariantsTable.weightGrams,
            isActive: productVariantsTable.isActive,
            onHand: inventoryTable.onHand,
            reserved: inventoryTable.reserved,
            lowStockThreshold: inventoryTable.reorderLevel,
            updatedAt: productVariantsTable.updatedAt,
          })
          .from(productVariantsTable)
          .leftJoin(inventoryTable, eq(inventoryTable.variantId, productVariantsTable.id))
          .where(eq(productVariantsTable.productId, productId))
          .orderBy(asc(productVariantsTable.name)),
        db
          .select()
          .from(productImagesTable)
          .where(eq(productImagesTable.productId, productId))
          .orderBy(desc(productImagesTable.isPrimary), asc(productImagesTable.sortOrder)),
      ]);

      return {
        data: {
          ...product,
          variants: variants.map((variant) => ({
            ...variant,
            onHand: variant.onHand ?? 0,
            reserved: variant.reserved ?? 0,
            lowStockThreshold: variant.lowStockThreshold ?? 0,
            availableQuantity: Math.max(0, (variant.onHand ?? 0) - (variant.reserved ?? 0)),
          })),
          images,
        },
      };
    },
  );

  app.get(
    '/v1/admin/commerce/inventory/:variantId/movements',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const variantId = parseId(request.params, 'variantId');
      return {
        data: await db
          .select()
          .from(inventoryMovementsTable)
          .where(eq(inventoryMovementsTable.variantId, variantId))
          .orderBy(desc(inventoryMovementsTable.createdAt))
          .limit(100),
      };
    },
  );

  app.get(
    '/v1/admin/commerce/orders/:orderId',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const orderId = parseId(request.params, 'orderId');
      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId))
        .limit(1);
      if (!order) throw new AppError('NOT_FOUND', 'Order was not found.', 404);

      const [items, payments] = await Promise.all([
        db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, orderId))
          .orderBy(asc(orderItemsTable.productName), asc(orderItemsTable.variantName)),
        db
          .select({
            id: paymentsTable.id,
            provider: paymentsTable.provider,
            status: paymentsTable.status,
            amount: paymentsTable.amount,
            currency: paymentsTable.currency,
            providerTransactionId: paymentsTable.providerTransactionId,
            expiresAt: paymentsTable.expiresAt,
            terminalProcessedAt: paymentsTable.terminalProcessedAt,
            createdAt: paymentsTable.createdAt,
            updatedAt: paymentsTable.updatedAt,
          })
          .from(paymentsTable)
          .where(eq(paymentsTable.orderId, orderId))
          .orderBy(desc(paymentsTable.createdAt)),
      ]);

      return { data: { ...order, items, payments } };
    },
  );
}
