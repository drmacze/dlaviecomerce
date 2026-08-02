import type { FastifyInstance } from 'fastify';
import { providerMode } from '../commerce/providerReadiness.js';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export async function registerProviderEnvironmentGuard(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', async (request) => {
    if (request.method !== 'POST' || request.routeOptions.url !== '/v2/checkout/:cartId') {
      return;
    }

    const mode = providerMode({
      commerceEnabled: env.ENABLE_COMMERCE,
      paymentsEnabled: env.ENABLE_PAYMENTS,
      midtransConfigured: Boolean(env.MIDTRANS_SERVER_KEY),
      midtransProduction: env.MIDTRANS_IS_PRODUCTION,
      digiflazzEnabled: env.ENABLE_DIGIFLAZZ,
      digiflazzConfigured: Boolean(env.DIGIFLAZZ_USERNAME && env.DIGIFLAZZ_API_KEY),
      digiflazzTesting: env.DIGIFLAZZ_TESTING,
      databaseConfigured: Boolean(env.DATABASE_URL),
      sessionSecretConfigured: Boolean(process.env.COMMERCE_SESSION_SECRET),
      adminKeyConfigured: Boolean(env.ADMIN_API_KEY),
    });

    if (mode === 'mismatch') {
      throw new AppError(
        'SERVICE_UNAVAILABLE',
        'Midtrans and Digiflazz environments must both use sandbox/testing or both use production.',
        503,
      );
    }
  });
}
