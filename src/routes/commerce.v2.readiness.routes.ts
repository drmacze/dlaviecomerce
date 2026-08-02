import type { FastifyInstance } from 'fastify';
import { buildProviderReadiness } from '../commerce/providerReadiness.js';
import { env } from '../config/env.js';
import { requireCommerceAdmin } from '../middleware/commerceAdmin.js';

function configured(value: string | undefined, minimumLength = 1): boolean {
  return Boolean(value && value.trim().length >= minimumLength);
}

export async function commerceV2ReadinessRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/v2/admin/commerce/readiness',
    { preHandler: requireCommerceAdmin },
    async (_request, reply) => {
      const data = buildProviderReadiness({
        commerceEnabled: env.ENABLE_COMMERCE,
        paymentsEnabled: env.ENABLE_PAYMENTS,
        midtransConfigured: configured(env.MIDTRANS_SERVER_KEY, 16),
        midtransProduction: env.MIDTRANS_IS_PRODUCTION,
        digiflazzEnabled: env.ENABLE_DIGIFLAZZ,
        digiflazzConfigured:
          configured(env.DIGIFLAZZ_USERNAME) && configured(env.DIGIFLAZZ_API_KEY, 16),
        digiflazzTesting: env.DIGIFLAZZ_TESTING,
        databaseConfigured: configured(env.DATABASE_URL),
        sessionSecretConfigured: configured(process.env.COMMERCE_SESSION_SECRET, 32),
        adminKeyConfigured: configured(env.ADMIN_API_KEY, 32),
      });

      reply.header('Cache-Control', 'no-store');
      return { data };
    },
  );
}
