import type { FastifyInstance } from 'fastify';
import {
  and,
  db,
  eq,
  gte,
  inventoryMovementsTable,
  inventoryTable,
  orderItemsTable,
  ordersTable,
  paymentEventsTable,
  paymentsTable,
  sql,
} from '../../lib/db/src/index.js';
import { providerFulfillmentsTable } from '../../lib/db/src/schema/commerce-v2.js';
import { processOrderFulfillments } from '../commerce/fulfillment.js';
import {
  mapMidtransStatus,
  parseGrossAmount,
  verifyMidtransSignature,
  type LocalPaymentStatus,
} from '../commerce/midtrans.js';
import { hashPayload } from '../commerce/security.js';
import { midtransWebhookSchema } from '../commerce/validation.js';
import { AppError } from '../lib/errors.js';

const paidOrderStates = new Set(['paid', 'processing', 'shipped', 'completed']);

export async function commerceV2WebhookRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v2/webhooks/midtrans', async (request, reply) => {
    const payload = midtransWebhookSchema.parse(request.body);
    if (
      !verifyMidtransSignature({
        orderId: payload.order_id,
        statusCode: payload.status_code,
        grossAmount: payload.gross_amount,
        signatureKey: payload.signature_key,
      })
    ) {
      throw new AppError('UNAUTHORIZED', 'Invalid Midtrans notification signature.', 401);
    }

    const grossAmount = parseGrossAmount(payload.gross_amount);
    const [paymentSnapshot] = await db
      .select({
        id: paymentsTable.id,
        orderId: paymentsTable.orderId,
        amount: paymentsTable.amount,
      })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.provider, 'midtrans'),
          eq(paymentsTable.providerOrderId, payload.order_id),
        ),
      )
      .limit(1);

    if (!paymentSnapshot) throw new AppError('NOT_FOUND', 'Payment transaction was not found.', 404);
    if (paymentSnapshot.amount !== grossAmount) {
      await db
        .update(paymentsTable)
        .set({ status: 'requires_review', providerResponse: payload, updatedAt: new Date() })
        .where(eq(paymentsTable.id, paymentSnapshot.id));
      throw new AppError('CONFLICT', 'Payment amount does not match the order total.', 409);
    }

    const eventFingerprint = hashPayload({
      orderId: payload.order_id,
      transactionId: payload.transaction_id ?? null,
      transactionStatus: payload.transaction_status,
      statusCode: payload.status_code,
      grossAmount: payload.gross_amount,
      fraudStatus: payload.fraud_status ?? null,
      settlementTime: payload.settlement_time ?? null,
    });
    const payloadHash = hashPayload(payload);

    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`select id from payments where id = ${paymentSnapshot.id} for update`);

      const [payment] = await tx
        .select({
          id: paymentsTable.id,
          orderId: paymentsTable.orderId,
          status: paymentsTable.status,
          terminalProcessedAt: paymentsTable.terminalProcessedAt,
        })
        .from(paymentsTable)
        .where(eq(paymentsTable.id, paymentSnapshot.id))
        .limit(1);
      if (!payment) throw new AppError('NOT_FOUND', 'Payment transaction was not found.', 404);

      const [order] = await tx
        .select({ status: ordersTable.status })
        .from(ordersTable)
        .where(eq(ordersTable.id, payment.orderId))
        .limit(1);
      if (!order) throw new AppError('NOT_FOUND', 'Order was not found.', 404);

      const [event] = await tx
        .insert(paymentEventsTable)
        .values({
          paymentId: payment.id,
          provider: 'midtrans-v2',
          eventFingerprint,
          eventType: payload.transaction_status,
          payloadHash,
          payload,
        })
        .onConflictDoNothing({
          target: [paymentEventsTable.provider, paymentEventsTable.eventFingerprint],
        })
        .returning({ id: paymentEventsTable.id });

      let nextStatus = mapMidtransStatus(
        payload.transaction_status,
        payload.fraud_status,
        payment.status as LocalPaymentStatus,
      );

      if (
        nextStatus === 'paid' &&
        ((payment.terminalProcessedAt && payment.status !== 'paid') || order.status === 'cancelled')
      ) {
        nextStatus = 'requires_review';
      }
      if (
        ['failed', 'expired', 'cancelled'].includes(nextStatus) &&
        paidOrderStates.has(order.status)
      ) {
        nextStatus = 'requires_review';
      }

      if (!event) {
        return {
          duplicate: true,
          status: payment.status,
          orderId: payment.orderId,
          processFulfillment: payment.status === 'paid',
        };
      }

      await tx
        .update(paymentsTable)
        .set({
          status: nextStatus,
          ...(payload.transaction_id ? { providerTransactionId: payload.transaction_id } : {}),
          providerResponse: payload,
          updatedAt: new Date(),
        })
        .where(eq(paymentsTable.id, payment.id));

      let processFulfillment = false;
      if (nextStatus === 'paid' && !payment.terminalProcessedAt) {
        const items = await tx
          .select({ variantId: orderItemsTable.variantId, quantity: orderItemsTable.quantity })
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, payment.orderId));

        for (const item of items) {
          if (!item.variantId) continue;
          const [deducted] = await tx
            .update(inventoryTable)
            .set({
              onHand: sql`${inventoryTable.onHand} - ${item.quantity}`,
              reserved: sql`${inventoryTable.reserved} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(inventoryTable.variantId, item.variantId),
                gte(inventoryTable.onHand, item.quantity),
                gte(inventoryTable.reserved, item.quantity),
              ),
            )
            .returning({ variantId: inventoryTable.variantId });
          if (!deducted) {
            throw new AppError('DATABASE_ERROR', 'Paid inventory could not be finalized.', 500);
          }
          await tx.insert(inventoryMovementsTable).values({
            variantId: item.variantId,
            orderId: payment.orderId,
            type: 'sale',
            quantityDelta: -item.quantity,
            reason: 'Payment confirmed by Midtrans v2 webhook.',
            actor: 'midtrans-v2-webhook',
          });
        }

        await tx
          .update(paymentsTable)
          .set({ terminalProcessedAt: new Date(), updatedAt: new Date() })
          .where(eq(paymentsTable.id, payment.id));
        await tx
          .update(ordersTable)
          .set({ status: 'processing', paidAt: new Date(), updatedAt: new Date() })
          .where(eq(ordersTable.id, payment.orderId));
        await tx
          .update(providerFulfillmentsTable)
          .set({ status: 'pending', nextAttemptAt: new Date(), updatedAt: new Date() })
          .where(
            and(
              eq(providerFulfillmentsTable.orderId, payment.orderId),
              eq(providerFulfillmentsTable.status, 'waiting_payment'),
            ),
          );
        processFulfillment = true;
      } else if (nextStatus === 'paid') {
        processFulfillment = true;
      }

      if (
        ['failed', 'expired', 'cancelled'].includes(nextStatus) &&
        !payment.terminalProcessedAt &&
        order.status === 'pending_payment'
      ) {
        const items = await tx
          .select({ variantId: orderItemsTable.variantId, quantity: orderItemsTable.quantity })
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, payment.orderId));

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
            throw new AppError('DATABASE_ERROR', 'Expired inventory could not be released.', 500);
          }
          await tx.insert(inventoryMovementsTable).values({
            variantId: item.variantId,
            orderId: payment.orderId,
            type: 'release',
            quantityDelta: item.quantity,
            reason: `Midtrans v2 payment became ${nextStatus}.`,
            actor: 'midtrans-v2-webhook',
          });
        }

        await tx
          .update(paymentsTable)
          .set({ terminalProcessedAt: new Date(), updatedAt: new Date() })
          .where(eq(paymentsTable.id, payment.id));
        await tx
          .update(ordersTable)
          .set({ status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() })
          .where(eq(ordersTable.id, payment.orderId));
        await tx
          .update(providerFulfillmentsTable)
          .set({ status: 'cancelled', nextAttemptAt: null, updatedAt: new Date() })
          .where(eq(providerFulfillmentsTable.orderId, payment.orderId));
      }

      if (nextStatus === 'refunded') {
        await tx
          .update(ordersTable)
          .set({ status: 'refunded', updatedAt: new Date() })
          .where(eq(ordersTable.id, payment.orderId));
      }

      return {
        duplicate: false,
        status: nextStatus,
        orderId: payment.orderId,
        processFulfillment,
      };
    });

    if (result.processFulfillment) {
      try {
        await processOrderFulfillments(result.orderId, 'midtrans-v2-webhook');
      } catch (error) {
        request.log.error(
          { err: error, orderId: result.orderId },
          'Paid order fulfillment processing failed after webhook commit',
        );
      }
    }

    return reply.status(200).send({
      ok: true,
      duplicate: result.duplicate,
      status: result.status,
    });
  });
}
