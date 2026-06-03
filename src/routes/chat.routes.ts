import type { FastifyInstance } from 'fastify';
import { AppError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { chatRequestSchema } from '../schemas/chat.schema.js';
import { ProviderRegistry } from '../services/ai/provider-registry.js';
import { ChatService } from '../services/chat/chat.service.js';
import { ConversationService } from '../services/chat/conversation.service.js';
import { ModelRouterService } from '../services/chat/model-router.service.js';
import { PromptService } from '../services/chat/prompt.service.js';
import { EmbeddingService } from '../services/embeddings/embedding.service.js';
import { OpenAIEmbeddingProvider } from '../services/embeddings/openai-embedding.provider.js';
import { RagService } from '../services/rag/rag.service.js';
import { RetrievalService } from '../services/rag/retrieval.service.js';
const embeddings = new EmbeddingService(new OpenAIEmbeddingProvider());
const rag = new RagService(new RetrievalService(embeddings));
const chatService = new ChatService(
  new ConversationService(),
  new ProviderRegistry(),
  new ModelRouterService(),
  new PromptService(),
  rag,
);
export async function chatRoutes(app: FastifyInstance) {
  app.post('/v1/chat', { preHandler: requireAuth }, async (request) => {
    const userId = request.user?.id;
    if (!userId) throw new AppError('UNAUTHORIZED', 'Unauthorized.', 401);
    const body = chatRequestSchema.parse(request.body);
    return chatService.send(userId, body, request.requestStart ?? Date.now());
  });
  app.post('/v1/chat/stream', { preHandler: requireAuth }, async (_request, reply) =>
    reply
      .status(501)
      .send({
        error: {
          code: 'BAD_REQUEST',
          message:
            'Streaming is not implemented yet. Use POST /v1/chat; docs describe SSE integration steps.',
          details: {},
        },
      }),
  );
}
