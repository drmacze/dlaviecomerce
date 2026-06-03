import type { FastifyInstance } from 'fastify';
import { AppError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { conversationParamSchema } from '../schemas/conversation.schema.js';
import { ConversationService } from '../services/chat/conversation.service.js';
import {
  messagesPaginationQuerySchema,
  nextCursor,
  paginationQuerySchema,
} from '../utils/pagination.js';
const service = new ConversationService();
export async function conversationsRoutes(app: FastifyInstance) {
  app.get('/v1/conversations', { preHandler: requireAuth }, async (request) => {
    const userId = request.user?.id;
    if (!userId) throw new AppError('UNAUTHORIZED', 'Unauthorized.', 401);
    const q = paginationQuerySchema.parse(request.query);
    const items = await service.list(userId, q.limit, q.cursor);
    return { items, next_cursor: nextCursor(items, q.limit, 'updated_at') };
  });
  app.get(
    '/v1/conversations/:conversationId/messages',
    { preHandler: requireAuth },
    async (request) => {
      const userId = request.user?.id;
      if (!userId) throw new AppError('UNAUTHORIZED', 'Unauthorized.', 401);
      const p = conversationParamSchema.parse(request.params);
      const q = messagesPaginationQuerySchema.parse(request.query);
      const items = await service.messages(userId, p.conversationId, q.limit, q.cursor);
      return { items, next_cursor: nextCursor(items, q.limit, 'created_at') };
    },
  );
  app.delete('/v1/conversations/:conversationId', { preHandler: requireAuth }, async (request) => {
    const userId = request.user?.id;
    if (!userId) throw new AppError('UNAUTHORIZED', 'Unauthorized.', 401);
    const p = conversationParamSchema.parse(request.params);
    await service.delete(userId, p.conversationId);
    return { ok: true };
  });
}
