import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  and,
  cartItemsTable,
  cartsTable,
  customersTable,
  db,
  desc,
  eq,
  gt,
  gte,
  inventoryMovementsTable,
  inventoryTable,
  orderItemsTable,
  ordersTable,
  paymentsTable,
  productsTable,
  productVariantsTable,
  shippingMethodsTable,
  sql,
} from '../../lib/db/src/index.js';
import { env } from '../config/env.js';
import {
  createSnapTransaction,
  MidtransRequestError,
  type MidtransItem,
} from '../commerce/midtrans.js';
import { createOrderNumber, hashSecret } from '../commerce/security.js';
import {
  checkoutInputSchema,
  idempotencyKeySchema,
  orderNumberSchema,
  uuidSchema,
} from '../commerce/validation.js';
import { AppError } from '../lib/errors.js';

function requiredHeader(request: FastifyRequest, name: string): string {
  const value = request.headers[name];
  if (typeof value !== 'string') {
    throw new AppError('BAD_REQUEST', `${name} header is required.`, 400);
  }
  return value;
}

function safeAdd(left: number, right: number): number {
  const value = left + right;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new AppError('BAD_REQUEST', 'Order amount exceeds the supported range.', 400);
  }
  return value;
}

function safeMultiply(left: number, right: number): number {
  const value = left * right;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new AppError('BAD_REQUEST', 'Order amount exceeds the supported range.', 400);
  }
  return value;
}

async function orderView(orderNumber: string, accessToken: string) {
  const [order] = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      email: ordersTable.email,
      phone: ordersTable.phone,
      status: ordersTable.status,
      currency: ordersTable.currency,
      subtotalAmount: ordersTable.subtotalAmount,
      shippingAmount: ordersTable.shippingAmount,
      discountAmount: ordersTable.discountAmount,
      totalAmount: ordersTable.totalAmount,
      shippingAddress: ordersTable.shippingAddress,
      customerNote: ordersTable.customerNote,
      paidAt: ordersTable.paidAt,
      cancelledAt: ordersTable.cancelledAt,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
    })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.orderNumber, orderNumber),
        eq(ordersTable.accessTokenHash, hashSecret(accessToken)),
      ),
    )
    .limit(1);

  if (!order) throw new AppError('UNAUTHORIZED', 'Order credentials are invalid.', 401);

  const [items, paymentRows] = await Promise.all([
    db
      .select({
        id: orderItemsTable.id,
        sku: orderItemsTable.sku,
        productName: orderItemsTable.productName,
        variantName: orderItemsTable.variantName,
        attributes: orderItemsTable.attributes,
        quantity: orderItemsTable.quantity,
        unitPriceAmount: orderItemsTable.unitPriceAmount,
        lineTotalAmount: orderItemsTable.lineTotalAmount,
      })
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id)),
    db
      .select({
        id: paymentsTable.id,
        provider: paymentsTable.provider,
        status: paymentsTable.status,
        amount: paymentsTable.amount,
        currency: paymentsTable.currency,
        checkoutToken: paymentsTable.checkoutToken,
        checkoutUrl: paymentsTable.checkoutUrl,
        expiresAt: paymentsTable.expiresAt,
        createdAt: paymentsTable.createdAt,
        updatedAt: paymentsTable.updatedAt,
      })
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, order.id))
      .orderBy(desc(paymentsTable.createdAt))
      .limit(1),
  ]);

  return { ...order, items, payment: paymentRows[0] ?? null };
}

async function releaseRejectedOrder(orderId: string, paymentId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [payment] = await tx
      .select({ terminalProcessedAt: paymentsTable.terminalProcessedAt })
      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentId))
      .limit(1);
    if (!payment || payment.terminalProcessedAt) return;

    const items = await tx
      .select({ variantId: orderItemsTable.variantId, quantity: orderItemsTable.quantity })
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, orderId));

    for (const item of items) {
      if (!item.variantId) continue;
      const [released] = await tx
        .update(inventoryTable)
        .set({
          reserved: sql`${inventoryTable.reserved} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(inventoryTable.variantId, item.variantId),
            gte(inventoryTable.reserved, item.quantity),
          ),
        )
        .returning({ variantId: inventoryTable.variantId });
      if (!released) {
        throw new AppError('DATABASE_ERROR', 'Reserved inventory could not be released.', 500);
      }
      await tx.insert(inventoryMovementsTable).values({
        variantId: item.variantId,
        orderId,
        type: 'release',
        quantityDelta: item.quantity,
        reason: 'Payment provider rejected checkout initialization.',
        actor: 'system',
      });
    }

    await tx
      .update(paymentsTable)
      .set({ status: 'failed', terminalProcessedAt: new Date(), updatedAt: new Date() })
      .where(eq(paymentsTable.id, paymentId));
    await tx
      .update(ordersTable)
      .set({ status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));
  });
}

export async function commerceCheckoutRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/v1/checkout/:cartId',
    {
      config: {
        rateLimit: { max: env.CHECKOUT_RATE_LIMIT_MAX, timeWindow: '1 minute' },
      },
    },
    async (request, reply) => {
      if (!env.ENABLE_PAYMENTS) {
        throw new AppError(
          'SERVICE_UNAVAILABLE',
          'Checkout is disabled until payments are configured.',
          503,
        );
      }

      const cartId = uuidSchema.parse((request.params as { cartId: string }).cartId);
      const cartToken = requiredHeader(request, 'x-cart-token');
      const idempotencyKey = idempotencyKeySchema.parse(requiredHeader(request, 'idempotency-key'));
      const input = checkoutInputSchema.parse(request.body);
      const cartTokenHash = hashSecret(cartToken);
      const idempotencyHash = hashSecret(idempotencyKey);

      const [existing] = await db
        .select({ orderNumber: ordersTable.orderNumber })
        .from(ordersTable)
        .where(eq(ordersTable.checkoutIdempotencyKey, idempotencyHash))
        .limit(1);
      if (existing) {
        reply.header('Cache-Control', 'no-store');
        return { data: await orderView(existing.orderNumber, idempotencyKey) };
      }

      const checkout = await db.transaction(async (tx) => {
        const [cart] = await tx
          .select({ id: cartsTable.id })
          .from(cartsTable)
          .where(
            and(
              eq(cartsTable.id, cartId),
              eq(cartsTable.sessionTokenHash, cartTokenHash),
              eq(cartsTable.status, 'active'),
              gt(cartsTable.expiresAt, new Date()),
            ),
          )
          .limit(1);
        if (!cart)
          throw new AppError('UNAUTHORIZED', 'Cart credentials are invalid or expired.', 401);

        const items = await tx
          .select({
            variantId: productVariantsTable.id,
            productId: productsTable.id,
            sku: productVariantsTable.sku,
            productName: productsTable.name,
            variantName: productVariantsTable.name,
            attributes: productVariantsTable.attributes,
            priceAmount: productVariantsTable.priceAmount,
            currency: productVariantsTable.currency,
            quantity: cartItemsTable.quantity,
            requiresShipping: productsTable.requiresShipping,
            variantActive: productVariantsTable.isActive,
            productStatus: productsTable.status,
          })
          .from(cartItemsTable)
          .innerJoin(productVariantsTable, eq(productVariantsTable.id, cartItemsTable.variantId))
          .innerJoin(productsTable, eq(productsTable.id, productVariantsTable.productId))
          .where(eq(cartItemsTable.cartId, cartId));

        if (items.length === 0) throw new AppError('BAD_REQUEST', 'Cart is empty.', 400);
        if (items.some((item) => !item.variantActive || item.productStatus !== 'active')) {
          throw new AppError('CONFLICT', 'Cart contains an unavailable product.', 409);
        }
        if (items.some((item) => item.currency !== 'IDR')) {
          throw new AppError('CONFLICT', 'All cart items must use IDR.', 409);
        }

        let subtotalAmount = 0;
        for (const item of items) {
          subtotalAmount = safeAdd(subtotalAmount, safeMultiply(item.priceAmount, item.quantity));
        }

        const requiresShipping = items.some((item) => item.requiresShipping);
        let shippingMethodId: string | undefined;
        let shippingAmount = 0;
        if (requiresShipping) {
          if (!input.shippingAddress || !input.shippingMethodId) {
            throw new AppError(
              'BAD_REQUEST',
              'Shipping address and shipping method are required for physical products.',
              400,
            );
          }
          const [method] = await tx
            .select({
              id: shippingMethodsTable.id,
              flatRateAmount: shippingMethodsTable.flatRateAmount,
              freeAboveAmount: shippingMethodsTable.freeAboveAmount,
            })
            .from(shippingMethodsTable)
            .where(
              and(
                eq(shippingMethodsTable.id, input.shippingMethodId),
                eq(shippingMethodsTable.isActive, true),
              ),
            )
            .limit(1);
          if (!method) throw new AppError('NOT_FOUND', 'Shipping method was not found.', 404);
          shippingMethodId = method.id;
          shippingAmount =
            method.freeAboveAmount !== null && subtotalAmount >= method.freeAboveAmount
              ? 0
              : method.flatRateAmount;
        } else if (input.shippingMethodId || input.shippingAddress) {
          throw new AppError(
            'BAD_REQUEST',
            'Shipping details are not accepted for a digital-only cart.',
            400,
          );
        }

        const totalAmount = safeAdd(subtotalAmount, shippingAmount);
        if (totalAmount < 1) {
          throw new AppError(
            'BAD_REQUEST',
            'Paid checkout requires a total amount of at least IDR 1.',
            400,
          );
        }

        const [claimedCart] = await tx
          .update(cartsTable)
          .set({ status: 'converted', updatedAt: new Date() })
          .where(and(eq(cartsTable.id, cartId), eq(cartsTable.status, 'active')))
          .returning({ id: cartsTable.id });
        if (!claimedCart) {
          throw new AppError('CONFLICT', 'Cart has already been checked out.', 409);
        }

        const [customer] = await tx
          .insert(customersTable)
          .values({
            email: input.email,
            fullName: input.fullName,
            ...(input.phone ? { phone: input.phone } : {}),
          })
          .onConflictDoUpdate({
            target: customersTable.email,
            set: {
              fullName: input.fullName,
              ...(input.phone ? { phone: input.phone } : {}),
              updatedAt: new Date(),
            },
          })
          .returning({ id: customersTable.id });
        if (!customer) throw new AppError('DATABASE_ERROR', 'Customer could not be saved.', 500);

        const orderNumber = createOrderNumber(env.ORDER_PREFIX);
        const [order] = await tx
          .insert(ordersTable)
          .values({
            orderNumber,
            accessTokenHash: idempotencyHash,
            checkoutIdempotencyKey: idempotencyHash,
            cartId,
            customerId: customer.id,
            ...(shippingMethodId ? { shippingMethodId } : {}),
            email: input.email,
            ...(input.phone ? { phone: input.phone } : {}),
            subtotalAmount,
            shippingAmount,
            discountAmount: 0,
            totalAmount,
            ...(input.shippingAddress ? { shippingAddress: input.shippingAddress } : {}),
            ...(input.customerNote ? { customerNote: input.customerNote } : {}),
          })
          .returning({ id: ordersTable.id, orderNumber: ordersTable.orderNumber });
        if (!order) throw new AppError('DATABASE_ERROR', 'Order could not be created.', 500);

        await tx.insert(orderItemsTable).values(
          items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName,
            variantName: item.variantName,
            attributes: item.attributes,
            quantity: item.quantity,
            unitPriceAmount: item.priceAmount,
            lineTotalAmount: safeMultiply(item.priceAmount, item.quantity),
          })),
        );

        for (const item of items) {
          const [reserved] = await tx
            .update(inventoryTable)
            .set({
              reserved: sql`${inventoryTable.reserved} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(inventoryTable.variantId, item.variantId),
                gte(sql`${inventoryTable.onHand} - ${inventoryTable.reserved}`, item.quantity),
              ),
            )
            .returning({ variantId: inventoryTable.variantId });
          if (!reserved) {
            throw new AppError('CONFLICT', `Insufficient stock for SKU ${item.sku}.`, 409);
          }
          await tx.insert(inventoryMovementsTable).values({
            variantId: item.variantId,
            orderId: order.id,
            type: 'reserve',
            quantityDelta: -item.quantity,
            reason: 'Stock reserved for pending payment.',
            actor: 'checkout',
          });
        }

        const expiresAt = new Date(Date.now() + env.PAYMENT_EXPIRY_MINUTES * 60 * 1000);
        const [payment] = await tx
          .insert(paymentsTable)
          .values({
            orderId: order.id,
            provider: 'midtrans',
            providerOrderId: order.orderNumber,
            status: 'pending',
            amount: totalAmount,
            expiresAt,
          })
          .returning({ id: paymentsTable.id });
        if (!payment) throw new AppError('DATABASE_ERROR', 'Payment could not be created.', 500);

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentId: payment.id,
          totalAmount,
          shippingAmount,
          items,
          expiresAt,
        };
      });

      const paymentItems: MidtransItem[] = checkout.items.map((item) => ({
        id: item.sku,
        price: item.priceAmount,
        quantity: item.quantity,
        name: `${item.productName} - ${item.variantName}`,
      }));
      if (checkout.shippingAmount > 0) {
        paymentItems.push({
          id: 'SHIPPING',
          price: checkout.shippingAmount,
          quantity: 1,
          name: 'Shipping',
        });
      }

      try {
        const snap = await createSnapTransaction({
          providerOrderId: checkout.orderNumber,
          orderNumber: checkout.orderNumber,
          amount: checkout.totalAmount,
          items: paymentItems,
          customer: {
            fullName: input.fullName,
            email: input.email,
            ...(input.phone ? { phone: input.phone } : {}),
            ...(input.shippingAddress ? { shippingAddress: input.shippingAddress } : {}),
          },
        });
        await db
          .update(paymentsTable)
          .set({
            checkoutToken: snap.token,
            checkoutUrl: snap.redirectUrl,
            providerResponse: snap.raw,
            updatedAt: new Date(),
          })
          .where(eq(paymentsTable.id, checkout.paymentId));
      } catch (error) {
        if (error instanceof MidtransRequestError) {
          if (error.outcome === 'rejected') {
            await releaseRejectedOrder(checkout.orderId, checkout.paymentId);
          } else {
            await db
              .update(paymentsTable)
              .set({ status: 'requires_review', updatedAt: new Date() })
              .where(eq(paymentsTable.id, checkout.paymentId));
          }
        }
        throw error;
      }

      reply.header('Cache-Control', 'no-store');
      return reply
        .status(201)
        .send({ data: await orderView(checkout.orderNumber, idempotencyKey) });
    },
  );

  app.get('/v1/orders/:orderNumber', async (request, reply) => {
    const orderNumber = orderNumberSchema.parse(
      (request.params as { orderNumber: string }).orderNumber,
    );
    const orderToken = idempotencyKeySchema.parse(requiredHeader(request, 'x-order-token'));
    reply.header('Cache-Control', 'no-store');
    return { data: await orderView(orderNumber, orderToken) };
  });
}
