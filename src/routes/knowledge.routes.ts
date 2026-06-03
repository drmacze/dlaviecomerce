import type { FastifyInstance } from 'fastify';
import { AppError } from '../lib/errors.js';
import { requireAdmin } from '../middleware/admin.js';
import { documentCreateSchema, kbSearchSchema } from '../schemas/knowledge.schema.js';
import { KnowledgeService } from '../services/knowledge/knowledge.service.js';
import { ChunkerService } from '../services/rag/chunker.service.js';
import { EmbeddingService } from '../services/embeddings/embedding.service.js';
import { OpenAIEmbeddingProvider } from '../services/embeddings/openai-embedding.provider.js';
import { RetrievalService } from '../services/rag/retrieval.service.js';
import { paginationQuerySchema, nextCursor } from '../utils/pagination.js';
const embeddings = new EmbeddingService(new OpenAIEmbeddingProvider());
const service = new KnowledgeService(
  new ChunkerService(),
  embeddings,
  new RetrievalService(embeddings),
);
export async function knowledgeRoutes(app: FastifyInstance) {
  app.post('/v1/kb/documents', { preHandler: requireAdmin }, async (request) =>
    service.createDocument({
      ...documentCreateSchema.parse(request.body),
      created_by: request.user?.id,
    }),
  );
  app.get('/v1/kb/documents', { preHandler: requireAdmin }, async (request) => {
    const q = paginationQuerySchema.parse(request.query);
    const items = await service.list(q.limit, q.cursor);
    return { items, next_cursor: nextCursor(items, q.limit, 'created_at') };
  });
  app.delete('/v1/kb/documents/:documentId', { preHandler: requireAdmin }, async (request) => {
    const id = (request.params as { documentId?: string }).documentId;
    if (!id) throw new AppError('VALIDATION_ERROR', 'documentId is required.', 400);
    await service.delete(id);
    return { ok: true };
  });
  app.post('/v1/kb/search', { preHandler: requireAdmin }, async (request) => ({
    items: await service.search(
      ...(Object.values(kbSearchSchema.parse(request.body)) as [string, number, number]),
    ),
  }));
}
