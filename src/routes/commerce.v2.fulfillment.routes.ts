import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { and, db, eq, inArray, ordersTable, sql } from '../../lib/db/src/index.js';
import { providerFulfillmentsTable } from '../../lib/db/src/schema/commerce-v2.js';
import { processOrderFulfillments, retryOrderFulfillments } from '../commerce/fulfillment.js';
import { orderNumberSchema } from '../commerce/validation.js';
import { AppError } from '../lib/errors.js';
import { requireCommerceAdmin } from '../middleware/commerceAdmin.js';

const processDueSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
});

export async function commerceV2FulfillmentRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/v2/admin/commerce/orders/:orderNumber/fulfillments/retry',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const orderNumber = orderNumberSchema.parse(
        (request.params as { orderNumber: string }).orderNumber,
      );
      const [order] = await db
        .select({ id: ordersTable.id })
        .from(ordersTable)
        .where(eq(ordersTable.orderNumber, orderNumber))
        .limit(1);
      if (!order) throw new AppError('NOT_FOUND', 'Order was not found.', 404);

      const data = await retryOrderFulfillments(order.id);
      request.log.info({ orderId: order.id, orderNumber, data }, 'Fulfillment retry completed');
      return { data };
    },
  );

  app.post(
    '/v2/admin/commerce/fulfillments/process-due',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const input = processDueSchema.parse(request.body ?? {});
      const dueOrders = await db
        .selectDistinct({ orderId: providerFulfillmentsTable.orderId })
        .from(providerFulfillmentsTable)
        .where(
          and(
            inArray(providerFulfillmentsTable.status, ['pending', 'retrying']),
            sql`(${providerFulfillmentsTable.nextAttemptAt} is null or ${providerFulfillmentsTable.nextAttemptAt} <= now())`,
          ),
        )
        .limit(input.limit);

      const results = [];
      for (const order of dueOrders) {
        const summary = await processOrderFulfillments(order.orderId, 'admin-reconciliation');
        results.push({ orderId: order.orderId, summary });
      }

      request.log.info({ processedOrders: results.length }, 'Due fulfillments processed');
      return { data: results };
    },
  );
}
