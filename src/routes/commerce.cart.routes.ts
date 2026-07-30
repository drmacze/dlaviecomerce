import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  and,
  cartItemsTable,
  cartsTable,
  db,
  eq,
  inventoryTable,
  productImagesTable,
  productsTable,
  productVariantsTable,
  sql,
} from '../../lib/db/src/index.js';
import { env } from '../config/env.js';
import { generateOpaqueToken, hashSecret } from '../commerce/security.js';
import { cartItemQuantitySchema, uuidSchema } from '../commerce/validation.js';
import { AppError } from '../lib/errors.js';

function headerValue(request: FastifyRequest, name: string): string {
  const value = request.headers[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new AppError('UNAUTHORIZED', `${name} header is required.`, 401);
  }
  return value;
}

async function requireActiveCart(cartId: string, token: string) {
  const [cart] = await db
    .select()
    .from(cartsTable)
    .where(
      and(
        eq(cartsTable.id, cartId),
        eq(cartsTable.sessionTokenHash, hashSecret(token)),
        eq(cartsTable.status, 'active'),
      ),
    )
    .limit(1);

  if (!cart) throw new AppError('UNAUTHORIZED', 'Cart credentials are invalid.', 401);
  if (cart.expiresAt <= new Date()) {
    throw new AppError('CONFLICT', 'Cart has expired. Create a new cart.', 409);
  }
  return cart;
}

async function buildCartView(cartId: string) {
  const [cart] = await db
    .select({
      id: cartsTable.id,
      status: cartsTable.status,
      expiresAt: cartsTable.expiresAt,
      updatedAt: cartsTable.updatedAt,
    })
    .from(cartsTable)
    .where(eq(cartsTable.id, cartId))
    .limit(1);
  if (!cart) throw new AppError('NOT_FOUND', 'Cart was not found.', 404);

  const items = await db
    .select({
      variantId: cartItemsTable.variantId,
      quantity: cartItemsTable.quantity,
      sku: productVariantsTable.sku,
      variantName: productVariantsTable.name,
      priceAmount: productVariantsTable.priceAmount,
      currency: productVariantsTable.currency,
      attributes: productVariantsTable.attributes,
      variantActive: productVariantsTable.isActive,
      productId: productsTable.id,
      productName: productsTable.name,
      productSlug: productsTable.slug,
      productStatus: productsTable.status,
      requiresShipping: productsTable.requiresShipping,
      availableQuantity: sql<number>`coalesce(${inventoryTable.onHand} - ${inventoryTable.reserved}, 0)`,
      imageUrl: sql<string | null>`(
        select pi.url
        from ${productImagesTable} pi
        where pi.product_id = ${productsTable.id}
        order by pi.is_primary desc, pi.sort_order asc
        limit 1
      )`,
    })
    .from(cartItemsTable)
    .innerJoin(productVariantsTable, eq(productVariantsTable.id, cartItemsTable.variantId))
    .innerJoin(productsTable, eq(productsTable.id, productVariantsTable.productId))
    .leftJoin(inventoryTable, eq(inventoryTable.variantId, productVariantsTable.id))
    .where(eq(cartItemsTable.cartId, cartId));

  let subtotalAmount = 0;
  const data = items.map((item) => {
    const lineTotalAmount = item.priceAmount * item.quantity;
    if (!Number.isSafeInteger(lineTotalAmount)) {
      throw new AppError('DATABASE_ERROR', 'Cart total exceeds the supported range.', 500);
    }
    subtotalAmount += lineTotalAmount;
    if (!Number.isSafeInteger(subtotalAmount)) {
      throw new AppError('DATABASE_ERROR', 'Cart total exceeds the supported range.', 500);
    }
    return {
      variantId: item.variantId,
      quantity: item.quantity,
      sku: item.sku,
      variantName: item.variantName,
      attributes: item.attributes,
      product: {
        id: item.productId,
        name: item.productName,
        slug: item.productSlug,
        imageUrl: item.imageUrl,
        requiresShipping: item.requiresShipping,
      },
      unitPriceAmount: item.priceAmount,
      lineTotalAmount,
      currency: item.currency,
      availableQuantity: item.availableQuantity,
      purchasable:
        item.variantActive &&
        item.productStatus === 'active' &&
        item.availableQuantity >= item.quantity,
    };
  });

  return {
    id: cart.id,
    status: cart.status,
    expiresAt: cart.expiresAt,
    updatedAt: cart.updatedAt,
    currency: 'IDR',
    subtotalAmount,
    items: data,
  };
}

export async function commerceCartRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v1/carts', async (_request, reply) => {
    const token = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + env.CART_TTL_DAYS * 24 * 60 * 60 * 1000);
    const [cart] = await db
      .insert(cartsTable)
      .values({ sessionTokenHash: hashSecret(token), expiresAt })
      .returning({ id: cartsTable.id, expiresAt: cartsTable.expiresAt });
    if (!cart) throw new AppError('DATABASE_ERROR', 'Cart could not be created.', 500);

    reply.header('Cache-Control', 'no-store');
    return reply.status(201).send({
      data: {
        id: cart.id,
        token,
        expiresAt: cart.expiresAt,
      },
    });
  });

  app.get('/v1/carts/:cartId', async (request, reply) => {
    const cartId = uuidSchema.parse((request.params as { cartId: string }).cartId);
    const token = headerValue(request, 'x-cart-token');
    await requireActiveCart(cartId, token);
    reply.header('Cache-Control', 'no-store');
    return { data: await buildCartView(cartId) };
  });

  app.put('/v1/carts/:cartId/items/:variantId', async (request, reply) => {
    const params = request.params as { cartId: string; variantId: string };
    const cartId = uuidSchema.parse(params.cartId);
    const variantId = uuidSchema.parse(params.variantId);
    const { quantity } = cartItemQuantitySchema.parse(request.body);
    const token = headerValue(request, 'x-cart-token');
    await requireActiveCart(cartId, token);

    const [variant] = await db
      .select({
        id: productVariantsTable.id,
        availableQuantity: sql<number>`${inventoryTable.onHand} - ${inventoryTable.reserved}`,
      })
      .from(productVariantsTable)
      .innerJoin(productsTable, eq(productsTable.id, productVariantsTable.productId))
      .innerJoin(inventoryTable, eq(inventoryTable.variantId, productVariantsTable.id))
      .where(
        and(
          eq(productVariantsTable.id, variantId),
          eq(productVariantsTable.isActive, true),
          eq(productsTable.status, 'active'),
        ),
      )
      .limit(1);

    if (!variant) throw new AppError('NOT_FOUND', 'Purchasable variant was not found.', 404);
    if (variant.availableQuantity < quantity) {
      throw new AppError('CONFLICT', 'Requested quantity exceeds available stock.', 409, {
        availableQuantity: variant.availableQuantity,
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(cartItemsTable)
        .values({ cartId, variantId, quantity })
        .onConflictDoUpdate({
          target: [cartItemsTable.cartId, cartItemsTable.variantId],
          set: { quantity, updatedAt: new Date() },
        });
      await tx.update(cartsTable).set({ updatedAt: new Date() }).where(eq(cartsTable.id, cartId));
    });

    reply.header('Cache-Control', 'no-store');
    return { data: await buildCartView(cartId) };
  });

  app.delete('/v1/carts/:cartId/items/:variantId', async (request, reply) => {
    const params = request.params as { cartId: string; variantId: string };
    const cartId = uuidSchema.parse(params.cartId);
    const variantId = uuidSchema.parse(params.variantId);
    const token = headerValue(request, 'x-cart-token');
    await requireActiveCart(cartId, token);

    await db.transaction(async (tx) => {
      await tx
        .delete(cartItemsTable)
        .where(and(eq(cartItemsTable.cartId, cartId), eq(cartItemsTable.variantId, variantId)));
      await tx.update(cartsTable).set({ updatedAt: new Date() }).where(eq(cartsTable.id, cartId));
    });

    reply.header('Cache-Control', 'no-store');
    return { data: await buildCartView(cartId) };
  });

  app.delete('/v1/carts/:cartId', async (request, reply) => {
    const cartId = uuidSchema.parse((request.params as { cartId: string }).cartId);
    const token = headerValue(request, 'x-cart-token');
    await requireActiveCart(cartId, token);
    await db
      .update(cartsTable)
      .set({ status: 'abandoned', updatedAt: new Date() })
      .where(eq(cartsTable.id, cartId));
    return reply.status(204).send();
  });
}
