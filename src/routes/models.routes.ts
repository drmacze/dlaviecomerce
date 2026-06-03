import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { chatModes } from '../schemas/chat.schema.js';
export async function modelsRoutes(app: FastifyInstance) {
  app.get('/v1/models', { preHandler: requireAuth }, async () => ({
    primaryProvider: env.PRIMARY_AI_PROVIDER,
    fallbackProvider: env.FALLBACK_AI_PROVIDER,
    ragEnabled: env.ENABLE_RAG,
    fallbackEnabled: env.ENABLE_MODEL_FALLBACK,
    availableModes: chatModes,
  }));
}
