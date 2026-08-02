import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  and,
  cartItemsTable,
  cartsTable,
  customersTable,
  db,
  eq,
  gt,
  gte,
  inArray,
  inventoryMovementsTable,
  inventoryTable,
  orderItemsTable,
  ordersTable,
  paymentsTable,
  productsTable,
  productVariantsTable,
  sql,
} from '../../lib/db/src/index.js';
import {
  cartItemTargetsTable,
  orderItemTargetsTable,
  providerFulfillmentsTable,
} from '../../lib/db/src/schema/commerce-v2.js';
import { env } from '../config/env.js';
import {
  createSnapTransaction,
  MidtransRequestError,
  type MidtransItem,
} from '../commerce/midtrans.js';
import { getOrderViewV2 } from '../commerce/orderViewV2.js';
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
  if (typeof value !== 'string' || value.length === 0) {
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

async function releaseRejectedCheckout(orderId: string, paymentId: string): Promise<void> {
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
        reason: 'Midtrans rejected v2 checkout initialization.',
        actor: 'v2-checkout',
      });
    }

    await tx
      .update(providerFulfillmentsTable)
      .set({ status: 'cancelled', nextAttemptAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(providerFulfillmentsTable.orderId, orderId),
          inArray(providerFulfillmentsTable.status, [
            'waiting_payment',
            'pending',
            'processing',
            'retrying',
          ]),
        ),
      );
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

export async function commerceV2CheckoutRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/v2/checkout/:cartId',
    {
      config: {
        rateLimit: { max: env.CHECKOUT_RATE_LIMIT_MAX, timeWindow: '1 minute' },
      },
    },
    async (request, reply) => {
      if (!env.ENABLE_PAYMENTS || !env.MIDTRANS_SERVER_KEY) {
        throw new AppError(
          'SERVICE_UNAVAILABLE',
          'Midtrans checkout is disabled until sandbox credentials are configured.',
          503,
        );
      }
      if (!env.ENABLE_DIGIFLAZZ || !env.DIGIFLAZZ_USERNAME || !env.DIGIFLAZZ_API_KEY) {
        throw new AppError(
          'SERVICE_UNAVAILABLE',
          'Digiflazz must be configured before accepting paid digital orders.',
          503,
        );
      }

      const cartId = uuidSchema.parse((request.params as { cartId: string }).cartId);
      const cartToken = requiredHeader(request, 'x-cart-token');
      const idempotencyKey = idempotencyKeySchema.parse(requiredHeader(request, 'idempotency-key'));
      const orderAccessToken = idempotencyKeySchema.parse(
        requiredHeader(request, 'x-order-access-token'),
      );
      const input = checkoutInputSchema.parse(request.body);
      const cartTokenHash = hashSecret(cartToken);
      const idempotencyHash = hashSecret(idempotencyKey);
      const orderAccessHash = hashSecret(orderAccessToken);

      const [existing] = await db
        .select({ orderNumber: ordersTable.orderNumber })
        .from(ordersTable)
        .where(eq(ordersTable.checkoutIdempotencyKey, idempotencyHash))
        .limit(1);
      if (existing) {
        reply.header('Cache-Control', 'no-store');
        return { data: await getOrderViewV2(existing.orderNumber, orderAccessToken) };
      }

      const checkoutResult = await db
        .transaction(async (tx) => {
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
          if (!cart) {
            throw new AppError('UNAUTHORIZED', 'Cart credentials are invalid or expired.', 401);
          }

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
              customerReferenceKind: cartItemTargetsTable.kind,
              customerReferenceValue: cartItemTargetsTable.value,
            })
            .from(cartItemsTable)
            .innerJoin(productVariantsTable, eq(productVariantsTable.id, cartItemsTable.variantId))
            .innerJoin(productsTable, eq(productsTable.id, productVariantsTable.productId))
            .leftJoin(
              cartItemTargetsTable,
              and(
                eq(cartItemTargetsTable.cartId, cartItemsTable.cartId),
                eq(cartItemTargetsTable.variantId, cartItemsTable.variantId),
              ),
            )
            .where(eq(cartItemsTable.cartId, cartId));

          if (items.length === 0) throw new AppError('BAD_REQUEST', 'Cart is empty.', 400);
          if (items.some((item) => !item.variantActive || item.productStatus !== 'active')) {
            throw new AppError('CONFLICT', 'Cart contains an unavailable product.', 409);
          }
          if (items.some((item) => item.currency !== 'IDR')) {
            throw new AppError('CONFLICT', 'All cart items must use IDR.', 409);
          }
          if (items.some((item) => item.requiresShipping)) {
            throw new AppError(
              'BAD_REQUEST',
              'Commerce v2 currently accepts digital products only.',
              400,
            );
          }
          if (items.some((item) => item.quantity !== 1)) {
            throw new AppError(
              'BAD_REQUEST',
              'Digital provider products must be purchased one at a time.',
              400,
            );
          }
          if (
            items.some(
              (item) =>
                item.attributes.provider !== 'digiflazz' ||
                !item.attributes.providerSku ||
                !item.customerReferenceKind ||
                !item.customerReferenceValue,
            )
          ) {
            throw new AppError(
              'BAD_REQUEST',
              'Every product requires a valid Digiflazz SKU and destination reference.',
              400,
            );
          }

          let subtotalAmount = 0;
          for (const item of items) {
            subtotalAmount = safeAdd(subtotalAmount, safeMultiply(item.priceAmount, item.quantity));
          }
          if (subtotalAmount < 1) {
            throw new AppError('BAD_REQUEST', 'Paid checkout requires a positive amount.', 400);
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
          if (!customer) {
            throw new AppError('DATABASE_ERROR', 'Customer could not be saved.', 500);
          }

          const orderNumber = createOrderNumber(env.ORDER_PREFIX);
          const [order] = await tx
            .insert(ordersTable)
            .values({
              orderNumber,
              accessTokenHash: orderAccessHash,
              checkoutIdempotencyKey: idempotencyHash,
              cartId,
              customerId: customer.id,
              email: input.email,
              ...(input.phone ? { phone: input.phone } : {}),
              subtotalAmount,
              shippingAmount: 0,
              discountAmount: 0,
              totalAmount: subtotalAmount,
              ...(input.customerNote ? { customerNote: input.customerNote } : {}),
            })
            .returning({ id: ordersTable.id, orderNumber: ordersTable.orderNumber });
          if (!order) throw new AppError('DATABASE_ERROR', 'Order could not be created.', 500);

          const paymentItems: MidtransItem[] = [];
          for (const item of items) {
            const providerSku = item.attributes.providerSku;
            if (!providerSku || !item.customerReferenceKind || !item.customerReferenceValue) {
              throw new AppError(
                'BAD_REQUEST',
                'Order item is missing provider or destination data.',
                400,
              );
            }

            const [orderItem] = await tx
              .insert(orderItemsTable)
              .values({
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
              })
              .returning({ id: orderItemsTable.id });
            if (!orderItem) {
              throw new AppError(
                'DATABASE_ERROR',
                'Order item snapshot could not be created.',
                500,
              );
            }

            await tx.insert(orderItemTargetsTable).values({
              orderItemId: orderItem.id,
              kind: item.customerReferenceKind,
              value: item.customerReferenceValue,
            });

            const providerReference = `${order.orderNumber}-${orderItem.id.replaceAll('-', '').slice(0, 12)}`;
            await tx.insert(providerFulfillmentsTable).values({
              orderId: order.id,
              orderItemId: orderItem.id,
              provider: 'digiflazz',
              providerReference,
              providerSku,
              customerReferenceKind: item.customerReferenceKind,
              customerReferenceValue: item.customerReferenceValue,
              status: 'waiting_payment',
            });

            paymentItems.push({
              id: item.sku,
              price: item.priceAmount,
              quantity: item.quantity,
              name: `${item.productName} - ${item.variantName}`,
            });
          }

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
              reason: 'Stock reserved for pending v2 payment.',
              actor: 'v2-checkout',
            });
          }

          const expiresAt = new Date(Date.now() + env.PAYMENT_EXPIRY_MINUTES * 60_000);
          const [payment] = await tx
            .insert(paymentsTable)
            .values({
              orderId: order.id,
              provider: 'midtrans',
              providerOrderId: order.orderNumber,
              status: 'pending',
              amount: subtotalAmount,
              expiresAt,
            })
            .returning({ id: paymentsTable.id });
          if (!payment) throw new AppError('DATABASE_ERROR', 'Payment could not be created.', 500);

          return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentId: payment.id,
            totalAmount: subtotalAmount,
            paymentItems,
            expiresAt,
          };
        })
        .catch(async (error: unknown) => {
          const [replayed] = await db
            .select({ orderNumber: ordersTable.orderNumber })
            .from(ordersTable)
            .where(eq(ordersTable.checkoutIdempotencyKey, idempotencyHash))
            .limit(1);
          if (!replayed) throw error;
          return { replayedOrderNumber: replayed.orderNumber } as const;
        });

      if ('replayedOrderNumber' in checkoutResult) {
        reply.header('Cache-Control', 'no-store');
        return {
          data: await getOrderViewV2(checkoutResult.replayedOrderNumber, orderAccessToken),
        };
      }
      const checkout = checkoutResult;

      try {
        const snap = await createSnapTransaction({
          providerOrderId: checkout.orderNumber,
          orderNumber: checkout.orderNumber,
          amount: checkout.totalAmount,
          items: checkout.paymentItems,
          customer: {
            fullName: input.fullName,
            email: input.email,
            ...(input.phone ? { phone: input.phone } : {}),
          },
          finishPath: `/v2/orders/${encodeURIComponent(checkout.orderNumber)}`,
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
        if (error instanceof MidtransRequestError && error.outcome === 'rejected') {
          await releaseRejectedCheckout(checkout.orderId, checkout.paymentId);
        } else {
          await db
            .update(paymentsTable)
            .set({ status: 'requires_review', updatedAt: new Date() })
            .where(eq(paymentsTable.id, checkout.paymentId));
        }
        throw error;
      }

      reply.header('Cache-Control', 'no-store');
      return reply.status(201).send({
        data: await getOrderViewV2(checkout.orderNumber, orderAccessToken),
      });
    },
  );

  app.get(
    '/v2/orders/:orderNumber',
    {
      config: {
        rateLimit: { max: env.CHECKOUT_RATE_LIMIT_MAX, timeWindow: '1 minute' },
      },
    },
    async (request, reply) => {
      const orderNumber = orderNumberSchema.parse(
        (request.params as { orderNumber: string }).orderNumber,
      );
      const accessToken = idempotencyKeySchema.parse(requiredHeader(request, 'x-order-token'));
      reply.header('Cache-Control', 'no-store');
      return { data: await getOrderViewV2(orderNumber, accessToken) };
    },
  );
}
