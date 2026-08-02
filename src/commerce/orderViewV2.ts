import {
  and,
  db,
  desc,
  eq,
  inArray,
  orderItemsTable,
  ordersTable,
  paymentsTable,
} from '../../lib/db/src/index.js';
import {
  orderItemTargetsTable,
  providerFulfillmentsTable,
} from '../../lib/db/src/schema/commerce-v2.js';
import { AppError } from '../lib/errors.js';
import { hashSecret } from './security.js';

export async function getOrderViewV2(orderNumber: string, accessToken: string) {
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

  const items = await db
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
    .where(eq(orderItemsTable.orderId, order.id));

  const itemIds = items.map((item) => item.id);
  const [targets, fulfillments, paymentRows] = await Promise.all([
    itemIds.length > 0
      ? db
          .select({
            orderItemId: orderItemTargetsTable.orderItemId,
            kind: orderItemTargetsTable.kind,
            value: orderItemTargetsTable.value,
          })
          .from(orderItemTargetsTable)
          .where(inArray(orderItemTargetsTable.orderItemId, itemIds))
      : Promise.resolve([]),
    itemIds.length > 0
      ? db
          .select({
            orderItemId: providerFulfillmentsTable.orderItemId,
            provider: providerFulfillmentsTable.provider,
            status: providerFulfillmentsTable.status,
            attempts: providerFulfillmentsTable.attempts,
            providerCode: providerFulfillmentsTable.providerCode,
            providerMessage: providerFulfillmentsTable.providerMessage,
            serialNumber: providerFulfillmentsTable.serialNumber,
            completedAt: providerFulfillmentsTable.completedAt,
            updatedAt: providerFulfillmentsTable.updatedAt,
          })
          .from(providerFulfillmentsTable)
          .where(inArray(providerFulfillmentsTable.orderItemId, itemIds))
      : Promise.resolve([]),
    db
      .select({
        id: paymentsTable.id,
        provider: paymentsTable.provider,
        status: paymentsTable.status,
        amount: paymentsTable.amount,
        currency: paymentsTable.currency,
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

  const targetByItem = new Map(targets.map((target) => [target.orderItemId, target]));
  const fulfillmentByItem = new Map(
    fulfillments.map((fulfillment) => [fulfillment.orderItemId, fulfillment]),
  );

  return {
    ...order,
    items: items.map((item) => {
      const target = targetByItem.get(item.id);
      const fulfillment = fulfillmentByItem.get(item.id);
      return {
        ...item,
        customerReference: target ? { kind: target.kind, value: target.value } : null,
        fulfillment: fulfillment
          ? {
              provider: fulfillment.provider,
              status: fulfillment.status,
              attempts: fulfillment.attempts,
              providerCode: fulfillment.providerCode,
              providerMessage: fulfillment.providerMessage,
              serialNumber: fulfillment.serialNumber,
              completedAt: fulfillment.completedAt,
              updatedAt: fulfillment.updatedAt,
            }
          : null,
      };
    }),
    payment: paymentRows[0] ?? null,
  };
}
