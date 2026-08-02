import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { parseCorsOrigins } from './config/cors.js';
import { env } from './config/env.js';
import { AppError, sendError } from './lib/errors.js';
import { registerRateLimit } from './middleware/rateLimit.js';
import { registerRequestContext } from './middleware/requestContext.js';
import { healthRoutes } from './routes/health.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      redact: [
        'req.headers.authorization',
        'req.headers.x-admin-api-key',
        'req.headers.x-cart-token',
        'req.headers.idempotency-key',
        'req.headers.x-order-token',
        'req.headers.x-order-access-token',
      ],
    },
    bodyLimit: 1_000_000,
    trustProxy: env.TRUST_PROXY,
    genReqId: () => crypto.randomUUID(),
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
  await app.register(cors, {
    origin: parseCorsOrigins(env),
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'Idempotency-Key',
      'X-Admin-Api-Key',
      'X-Cart-Token',
      'X-Order-Token',
      'X-Order-Access-Token',
    ],
    maxAge: 600,
  });
  await registerRequestContext(app);
  await registerRateLimit(app);

  app.setErrorHandler((error, request, reply) => {
    if (!(error instanceof AppError) || error.statusCode >= 500) {
      request.log.error({ err: error }, 'Request failed');
    }
    return sendError(reply, error);
  });

  await app.register(healthRoutes);

  if (env.ENABLE_COMMERCE) {
    const [
      catalog,
      admin,
      adminRead,
      cart,
      checkout,
      webhook,
      provider,
      v2Checkout,
      v2Webhook,
      v2Fulfillment,
    ] = await Promise.all([
      import('./routes/commerce.catalog.routes.js'),
      import('./routes/commerce.admin.routes.js'),
      import('./routes/commerce.admin.read.routes.js'),
      import('./routes/commerce.cart.routes.js'),
      import('./routes/commerce.checkout.routes.js'),
      import('./routes/commerce.webhook.routes.js'),
      import('./routes/commerce.provider.routes.js'),
      import('./routes/commerce.v2.checkout.routes.js'),
      import('./routes/commerce.v2.webhook.routes.js'),
      import('./routes/commerce.v2.fulfillment.routes.js'),
    ]);
    await app.register(catalog.commerceCatalogRoutes);
    await app.register(adminRead.commerceAdminReadRoutes);
    await app.register(admin.commerceAdminRoutes);
    await app.register(provider.commerceProviderRoutes);
    await app.register(cart.commerceCartRoutes);
    await app.register(checkout.commerceCheckoutRoutes);
    await app.register(v2Checkout.commerceV2CheckoutRoutes);
    await app.register(v2Fulfillment.commerceV2FulfillmentRoutes);
    if (env.ENABLE_PAYMENTS) {
      await app.register(webhook.commerceWebhookRoutes);
      await app.register(v2Webhook.commerceV2WebhookRoutes);
    }
  }

  return app;
}
