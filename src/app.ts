import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { parseCorsOrigins } from './config/cors.js';
import { env } from './config/env.js';
import { sendError } from './lib/errors.js';
import { registerRateLimit } from './middleware/rateLimit.js';
import { registerRequestContext } from './middleware/requestContext.js';
import { chatRoutes } from './routes/chat.routes.js';
import { conversationsRoutes } from './routes/conversations.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { knowledgeRoutes } from './routes/knowledge.routes.js';
import { modelsRoutes } from './routes/models.routes.js';
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      redact: ['req.headers.authorization', 'req.headers.x-admin-api-key'],
    },
    bodyLimit: 1_000_000,
    genReqId: () => crypto.randomUUID(),
  });
  await app.register(helmet);
  await app.register(cors, { origin: parseCorsOrigins(env), credentials: true });
  await registerRequestContext(app);
  await registerRateLimit(app);
  app.setErrorHandler((error, _request, reply) => sendError(reply, error));
  await app.register(healthRoutes);
  await app.register(modelsRoutes);
  await app.register(chatRoutes);
  await app.register(conversationsRoutes);
  await app.register(knowledgeRoutes);
  return app;
}
