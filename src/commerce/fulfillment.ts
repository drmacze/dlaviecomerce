import { and, db, eq, inArray, orderItemsTable, ordersTable, sql } from '../../lib/db/src/index.js';
import {
  providerFulfillmentEventsTable,
  providerFulfillmentsTable,
} from '../../lib/db/src/schema/commerce-v2.js';
import { env } from '../config/env.js';
import { requestDigiflazzTransaction, type DigiflazzTransactionData } from './digiflazz.js';

const activeStatuses = ['pending', 'processing', 'retrying'] as const;
const terminalStatuses = ['succeeded', 'failed', 'requires_review', 'cancelled'] as const;
const maxAttempts = 6;
const processingLeaseMilliseconds = 2 * 60_000;

type FulfillmentStatus =
  | 'waiting_payment'
  | 'pending'
  | 'processing'
  | 'retrying'
  | 'succeeded'
  | 'failed'
  | 'requires_review'
  | 'cancelled';

type FulfillmentSummary = {
  total: number;
  waiting: number;
  active: number;
  succeeded: number;
  failed: number;
  requiresReview: number;
};

function providerPayload(data: DigiflazzTransactionData): Record<string, unknown> {
  return { ...data };
}

function normalizedProviderStatus(data: DigiflazzTransactionData): string {
  return (data.status ?? '').trim().toLowerCase();
}

function classifyProviderResult(
  data: DigiflazzTransactionData,
): 'succeeded' | 'retrying' | 'failed' | 'requires_review' {
  const status = normalizedProviderStatus(data);
  const code = (data.rc ?? '').trim().toUpperCase();

  if (status.includes('sukses') || status.includes('success') || code === '00') {
    return 'succeeded';
  }
  if (
    status.includes('pending') ||
    status.includes('proses') ||
    status.includes('process') ||
    ['03', '39', '68'].includes(code)
  ) {
    return 'retrying';
  }
  if (status.includes('gagal') || status.includes('failed') || status.includes('failure')) {
    return 'failed';
  }
  return 'requires_review';
}

function nextRetry(attempts: number): Date {
  const delayMinutes = Math.min(60, 2 ** Math.min(Math.max(attempts, 1), 6));
  return new Date(Date.now() + delayMinutes * 60_000);
}

function processingLease(): Date {
  return new Date(Date.now() + processingLeaseMilliseconds);
}

async function recordEvent(
  fulfillmentId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await db.insert(providerFulfillmentEventsTable).values({
    fulfillmentId,
    eventType,
    payload,
  });
}

async function refreshOrderStatus(orderId: string): Promise<FulfillmentSummary> {
  const rows = await db
    .select({ status: providerFulfillmentsTable.status })
    .from(providerFulfillmentsTable)
    .where(eq(providerFulfillmentsTable.orderId, orderId));

  const summary: FulfillmentSummary = {
    total: rows.length,
    waiting: 0,
    active: 0,
    succeeded: 0,
    failed: 0,
    requiresReview: 0,
  };

  for (const row of rows) {
    switch (row.status as FulfillmentStatus) {
      case 'waiting_payment':
        summary.waiting += 1;
        break;
      case 'pending':
      case 'processing':
      case 'retrying':
        summary.active += 1;
        break;
      case 'succeeded':
        summary.succeeded += 1;
        break;
      case 'failed':
      case 'cancelled':
        summary.failed += 1;
        break;
      case 'requires_review':
        summary.requiresReview += 1;
        break;
    }
  }

  if (summary.total > 0 && summary.succeeded === summary.total) {
    await db
      .update(ordersTable)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(and(eq(ordersTable.id, orderId), inArray(ordersTable.status, ['paid', 'processing'])));
  } else if (summary.total > 0) {
    await db
      .update(ordersTable)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(and(eq(ordersTable.id, orderId), inArray(ordersTable.status, ['paid', 'processing'])));
  }

  return summary;
}

export async function activateOrderFulfillments(orderId: string): Promise<void> {
  await db
    .update(providerFulfillmentsTable)
    .set({ status: 'pending', nextAttemptAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(providerFulfillmentsTable.orderId, orderId),
        eq(providerFulfillmentsTable.status, 'waiting_payment'),
      ),
    );
}

export async function cancelOrderFulfillments(orderId: string): Promise<void> {
  await db
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
}

export async function processOrderFulfillments(
  orderId: string,
  actor = 'payment-webhook',
): Promise<FulfillmentSummary> {
  if (!env.ENABLE_DIGIFLAZZ) return refreshOrderStatus(orderId);

  const rows = await db
    .select({
      id: providerFulfillmentsTable.id,
      orderItemId: providerFulfillmentsTable.orderItemId,
      providerReference: providerFulfillmentsTable.providerReference,
      providerSku: providerFulfillmentsTable.providerSku,
      customerReferenceValue: providerFulfillmentsTable.customerReferenceValue,
      status: providerFulfillmentsTable.status,
      attempts: providerFulfillmentsTable.attempts,
      nextAttemptAt: providerFulfillmentsTable.nextAttemptAt,
      productName: orderItemsTable.productName,
    })
    .from(providerFulfillmentsTable)
    .innerJoin(orderItemsTable, eq(orderItemsTable.id, providerFulfillmentsTable.orderItemId))
    .where(
      and(
        eq(providerFulfillmentsTable.orderId, orderId),
        inArray(providerFulfillmentsTable.status, [...activeStatuses]),
        sql`(${providerFulfillmentsTable.nextAttemptAt} is null or ${providerFulfillmentsTable.nextAttemptAt} <= now())`,
      ),
    );

  for (const row of rows) {
    const [claimed] = await db
      .update(providerFulfillmentsTable)
      .set({
        status: 'processing',
        attempts: sql`${providerFulfillmentsTable.attempts} + 1`,
        nextAttemptAt: processingLease(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(providerFulfillmentsTable.id, row.id),
          inArray(providerFulfillmentsTable.status, [...activeStatuses]),
          sql`(${providerFulfillmentsTable.nextAttemptAt} is null or ${providerFulfillmentsTable.nextAttemptAt} <= now())`,
        ),
      )
      .returning({
        id: providerFulfillmentsTable.id,
        attempts: providerFulfillmentsTable.attempts,
      });

    if (!claimed) continue;

    await recordEvent(row.id, 'provider_attempt_started', {
      actor,
      attempt: claimed.attempts,
      provider: 'digiflazz',
      productName: row.productName,
    });

    try {
      const response = await requestDigiflazzTransaction({
        skuCode: row.providerSku,
        customerNumber: row.customerReferenceValue,
        referenceId: row.providerReference,
      });
      const classifiedStatus = classifyProviderResult(response);
      const exhausted = classifiedStatus === 'retrying' && claimed.attempts >= maxAttempts;
      const nextStatus = exhausted ? 'requires_review' : classifiedStatus;
      const retrying = nextStatus === 'retrying';
      const completed = nextStatus === 'succeeded' || nextStatus === 'failed';

      await db
        .update(providerFulfillmentsTable)
        .set({
          status: nextStatus,
          providerCode: response.rc ?? null,
          providerMessage: response.message ?? null,
          serialNumber: response.sn ?? null,
          providerResponse: providerPayload(response),
          nextAttemptAt: retrying ? nextRetry(claimed.attempts) : null,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(providerFulfillmentsTable.id, row.id));

      await recordEvent(row.id, `provider_${nextStatus}`, {
        actor,
        attempt: claimed.attempts,
        response: providerPayload(response),
      });
    } catch (error) {
      const exhausted = claimed.attempts >= maxAttempts;
      const nextStatus = exhausted ? 'requires_review' : 'retrying';
      const message = error instanceof Error ? error.message : 'Unknown provider error';

      await db
        .update(providerFulfillmentsTable)
        .set({
          status: nextStatus,
          providerMessage: message.slice(0, 500),
          nextAttemptAt: exhausted ? null : nextRetry(claimed.attempts),
          updatedAt: new Date(),
        })
        .where(eq(providerFulfillmentsTable.id, row.id));

      await recordEvent(
        row.id,
        exhausted ? 'provider_requires_review' : 'provider_retry_scheduled',
        {
          actor,
          attempt: claimed.attempts,
          error: message.slice(0, 500),
        },
      );
    }
  }

  return refreshOrderStatus(orderId);
}

export async function retryOrderFulfillments(orderId: string): Promise<FulfillmentSummary> {
  await db
    .update(providerFulfillmentsTable)
    .set({
      status: 'retrying',
      nextAttemptAt: new Date(),
      providerMessage: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(providerFulfillmentsTable.orderId, orderId),
        inArray(providerFulfillmentsTable.status, [
          'failed',
          'processing',
          'requires_review',
          'retrying',
        ]),
      ),
    );
  return processOrderFulfillments(orderId, 'admin-retry');
}

export { terminalStatuses };
