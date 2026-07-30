import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  and,
  categoriesTable,
  db,
  desc,
  eq,
  gte,
  inventoryMovementsTable,
  inventoryTable,
  ordersTable,
  productImagesTable,
  productsTable,
  productVariantsTable,
  shippingMethodsTable,
  sql,
} from '../../lib/db/src/index.js';
import {
  categoryInputSchema,
  imageInputSchema,
  inventoryAdjustmentSchema,
  productInputSchema,
  productPatchSchema,
  shippingMethodInputSchema,
  uuidSchema,
  variantInputSchema,
  variantPatchSchema,
} from '../commerce/validation.js';
import { AppError } from '../lib/errors.js';
import { requireCommerceAdmin } from '../middleware/commerceAdmin.js';

const categoryPatchSchema = categoryInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
const shippingPatchSchema = shippingMethodInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  status: z
    .enum([
      'pending_payment',
      'paid',
      'processing',
      'shipped',
      'completed',
      'cancelled',
      'refunded',
    ])
    .optional(),
});
const orderStatusPatchSchema = z.object({
  status: z.enum(['processing', 'shipped', 'completed']),
});

function parseId(params: unknown, key: string): string {
  const value = (params as Record<string, unknown>)[key];
  return uuidSchema.parse(value);
}

async function assertProductReady(productId: string): Promise<void> {
  const [[variant], [image]] = await Promise.all([
    db
      .select({ id: productVariantsTable.id })
      .from(productVariantsTable)
      .where(
        and(eq(productVariantsTable.productId, productId), eq(productVariantsTable.isActive, true)),
      )
      .limit(1),
    db
      .select({ id: productImagesTable.id })
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .limit(1),
  ]);

  if (!variant || !image) {
    throw new AppError(
      'CONFLICT',
      'A product needs at least one active variant and one image before activation.',
      409,
    );
  }
}

export async function commerceAdminRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/v1/admin/commerce/categories',
    { preHandler: requireCommerceAdmin },
    async (request, reply) => {
      const input = categoryInputSchema.parse(request.body);
      const [category] = await db.insert(categoriesTable).values(input).returning();
      return reply.status(201).send({ data: category });
    },
  );

  app.patch(
    '/v1/admin/commerce/categories/:categoryId',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const categoryId = parseId(request.params, 'categoryId');
      const input = categoryPatchSchema.parse(request.body);
      const [category] = await db
        .update(categoriesTable)
        .set(input)
        .where(eq(categoriesTable.id, categoryId))
        .returning();
      if (!category) throw new AppError('NOT_FOUND', 'Category was not found.', 404);
      return { data: category };
    },
  );

  app.post(
    '/v1/admin/commerce/products',
    { preHandler: requireCommerceAdmin },
    async (request, reply) => {
      const input = productInputSchema.parse(request.body);
      if (input.status === 'active') {
        throw new AppError(
          'CONFLICT',
          'Create the product as draft, then add a variant and image before activation.',
          409,
        );
      }
      const [product] = await db.insert(productsTable).values(input).returning();
      return reply.status(201).send({ data: product });
    },
  );

  app.patch(
    '/v1/admin/commerce/products/:productId',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const productId = parseId(request.params, 'productId');
      const input = productPatchSchema.parse(request.body);
      if (input.status === 'active') await assertProductReady(productId);
      const [product] = await db
        .update(productsTable)
        .set(input)
        .where(eq(productsTable.id, productId))
        .returning();
      if (!product) throw new AppError('NOT_FOUND', 'Product was not found.', 404);
      return { data: product };
    },
  );

  app.post(
    '/v1/admin/commerce/products/:productId/variants',
    { preHandler: requireCommerceAdmin },
    async (request, reply) => {
      const productId = parseId(request.params, 'productId');
      const input = variantInputSchema.parse(request.body);
      if (input.compareAtAmount !== undefined && input.compareAtAmount < input.priceAmount) {
        throw new AppError('BAD_REQUEST', 'compareAtAmount cannot be lower than priceAmount.', 400);
      }

      const [product] = await db
        .select({ id: productsTable.id })
        .from(productsTable)
        .where(eq(productsTable.id, productId))
        .limit(1);
      if (!product) throw new AppError('NOT_FOUND', 'Product was not found.', 404);

      const variant = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(productVariantsTable)
          .values({ ...input, productId })
          .returning();
        if (!created) throw new AppError('DATABASE_ERROR', 'Variant could not be created.', 500);
        await tx.insert(inventoryTable).values({ variantId: created.id });
        return created;
      });

      return reply.status(201).send({ data: variant });
    },
  );

  app.patch(
    '/v1/admin/commerce/variants/:variantId',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const variantId = parseId(request.params, 'variantId');
      const input = variantPatchSchema.parse(request.body);
      const [current] = await db
        .select({
          priceAmount: productVariantsTable.priceAmount,
          compareAtAmount: productVariantsTable.compareAtAmount,
        })
        .from(productVariantsTable)
        .where(eq(productVariantsTable.id, variantId))
        .limit(1);
      if (!current) throw new AppError('NOT_FOUND', 'Variant was not found.', 404);

      const nextPrice = input.priceAmount ?? current.priceAmount;
      const nextCompareAt = input.compareAtAmount ?? current.compareAtAmount;
      if (nextCompareAt !== null && nextCompareAt !== undefined && nextCompareAt < nextPrice) {
        throw new AppError('BAD_REQUEST', 'compareAtAmount cannot be lower than priceAmount.', 400);
      }

      const [variant] = await db
        .update(productVariantsTable)
        .set(input)
        .where(eq(productVariantsTable.id, variantId))
        .returning();
      return { data: variant };
    },
  );

  app.post(
    '/v1/admin/commerce/products/:productId/images',
    { preHandler: requireCommerceAdmin },
    async (request, reply) => {
      const productId = parseId(request.params, 'productId');
      const input = imageInputSchema.parse(request.body);
      const image = await db.transaction(async (tx) => {
        const [product] = await tx
          .select({ id: productsTable.id })
          .from(productsTable)
          .where(eq(productsTable.id, productId))
          .limit(1);
        if (!product) throw new AppError('NOT_FOUND', 'Product was not found.', 404);

        const [existingImage] = await tx
          .select({ id: productImagesTable.id })
          .from(productImagesTable)
          .where(eq(productImagesTable.productId, productId))
          .limit(1);
        const shouldBePrimary = input.isPrimary || !existingImage;
        if (shouldBePrimary) {
          await tx
            .update(productImagesTable)
            .set({ isPrimary: false })
            .where(eq(productImagesTable.productId, productId));
        }
        const [created] = await tx
          .insert(productImagesTable)
          .values({ ...input, productId, isPrimary: shouldBePrimary })
          .returning();
        return created;
      });
      return reply.status(201).send({ data: image });
    },
  );

  app.post(
    '/v1/admin/commerce/shipping-methods',
    { preHandler: requireCommerceAdmin },
    async (request, reply) => {
      const input = shippingMethodInputSchema.parse(request.body);
      const [method] = await db.insert(shippingMethodsTable).values(input).returning();
      return reply.status(201).send({ data: method });
    },
  );

  app.patch(
    '/v1/admin/commerce/shipping-methods/:methodId',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const methodId = parseId(request.params, 'methodId');
      const input = shippingPatchSchema.parse(request.body);
      const [method] = await db
        .update(shippingMethodsTable)
        .set(input)
        .where(eq(shippingMethodsTable.id, methodId))
        .returning();
      if (!method) throw new AppError('NOT_FOUND', 'Shipping method was not found.', 404);
      return { data: method };
    },
  );

  app.post(
    '/v1/admin/commerce/inventory/:variantId/adjustments',
    { preHandler: requireCommerceAdmin },
    async (request, reply) => {
      const variantId = parseId(request.params, 'variantId');
      const input = inventoryAdjustmentSchema.parse(request.body);
      const inventory = await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(inventoryTable)
          .set({
            onHand: sql`${inventoryTable.onHand} + ${input.delta}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(inventoryTable.variantId, variantId),
              gte(sql`${inventoryTable.onHand} + ${input.delta}`, inventoryTable.reserved),
              gte(sql`${inventoryTable.onHand} + ${input.delta}`, 0),
            ),
          )
          .returning();
        if (!updated) {
          throw new AppError(
            'CONFLICT',
            'Inventory adjustment would make stock negative or lower than reserved stock.',
            409,
          );
        }
        await tx.insert(inventoryMovementsTable).values({
          variantId,
          type: input.delta > 0 ? 'restock' : 'adjustment',
          quantityDelta: input.delta,
          reason: input.reason,
          actor: 'admin-api-key',
        });
        return updated;
      });
      return reply.status(201).send({ data: inventory });
    },
  );

  app.get('/v1/admin/commerce/orders', { preHandler: requireCommerceAdmin }, async (request) => {
    const query = adminOrdersQuerySchema.parse(request.query);
    const where = query.status ? eq(ordersTable.status, query.status) : undefined;
    const orders = await db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        email: ordersTable.email,
        status: ordersTable.status,
        totalAmount: ordersTable.totalAmount,
        currency: ordersTable.currency,
        createdAt: ordersTable.createdAt,
        paidAt: ordersTable.paidAt,
      })
      .from(ordersTable)
      .where(where)
      .orderBy(desc(ordersTable.createdAt))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);
    return { data: orders, pagination: { page: query.page, limit: query.limit } };
  });

  app.patch(
    '/v1/admin/commerce/orders/:orderId/status',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const orderId = parseId(request.params, 'orderId');
      const input = orderStatusPatchSchema.parse(request.body);
      const allowedPrevious: Record<typeof input.status, string[]> = {
        processing: ['paid'],
        shipped: ['processing'],
        completed: ['shipped', 'processing'],
      };
      const [current] = await db
        .select({ status: ordersTable.status })
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId))
        .limit(1);
      if (!current) throw new AppError('NOT_FOUND', 'Order was not found.', 404);
      if (!allowedPrevious[input.status].includes(current.status)) {
        throw new AppError(
          'CONFLICT',
          `Order cannot move from ${current.status} to ${input.status}.`,
          409,
        );
      }
      const [order] = await db
        .update(ordersTable)
        .set({ status: input.status })
        .where(eq(ordersTable.id, orderId))
        .returning();
      return { data: order };
    },
  );
}
