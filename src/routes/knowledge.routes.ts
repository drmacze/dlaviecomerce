import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/admin.js';
import { documentCreateSchema, kbSearchSchema } from '../schemas/knowledge.schema.js';
import { documentIdParamSchema } from '../schemas/common.schema.js';
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
    const { documentId } = documentIdParamSchema.parse(request.params);
    await service.delete(documentId);
    return { ok: true };
  });
  app.post('/v1/kb/search', { preHandler: requireAdmin }, async (request) => {
    const body = kbSearchSchema.parse(request.body);
    return {
      items: await service.search(body.query, body.limit, body.similarity_threshold),
    };
  });
}
