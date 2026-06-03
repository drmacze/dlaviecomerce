import { z } from 'zod';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { sanitizeText } from '../../utils/text.js';
import type { EmbeddingService } from '../embeddings/embedding.service.js';
import type { RetrievedChunk } from './reranker.service.js';

export const retrievalInputSchema = z.object({
  query: z.string().transform(sanitizeText).pipe(z.string().min(1).max(4000)),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(env.RAG_RETRIEVAL_MAX_RESULTS)
    .default(env.RAG_RETRIEVAL_MAX_RESULTS),
  threshold: z.coerce.number().min(0).max(1).default(env.RAG_SIMILARITY_THRESHOLD),
});

export type RetrievalInput = z.infer<typeof retrievalInputSchema>;

export class RetrievalService {
  constructor(private embeddings: EmbeddingService) {}
  async retrieve(
    query: string,
    limit = env.RAG_RETRIEVAL_MAX_RESULTS,
    threshold = env.RAG_SIMILARITY_THRESHOLD,
  ): Promise<RetrievedChunk[]> {
    const input = retrievalInputSchema.parse({ query, limit, threshold });
    const [embedding] = await this.embeddings.embed([input.query]);
    if (!embedding) return [];
    const { data, error } = await (getSupabaseAdmin() as any).rpc('match_knowledge_chunks', {
      query_embedding: `[${embedding.join(',')}]`,
      match_count: input.limit,
      similarity_threshold: input.threshold,
    });
    if (error)
      throw new AppError('RAG_ERROR', 'Knowledge retrieval failed.', 500, {
        message: error.message,
      });
    return (data ?? []).map((r: any) => ({
      chunk_id: r.chunk_id,
      document_id: r.document_id,
      title: r.title,
      content: r.content,
      metadata: r.metadata ?? {},
      similarity: Number(r.similarity),
    }));
  }
}
