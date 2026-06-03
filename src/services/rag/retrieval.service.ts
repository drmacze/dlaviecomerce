import { AppError } from '../../lib/errors.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import type { EmbeddingService } from '../embeddings/embedding.service.js';
import type { RetrievedChunk } from './reranker.service.js';
export class RetrievalService {
  constructor(private embeddings: EmbeddingService) {}
  async retrieve(query: string, limit = 5, threshold = 0.72): Promise<RetrievedChunk[]> {
    const [embedding] = await this.embeddings.embed([query]);
    if (!embedding) return [];
    const { data, error } = await (getSupabaseAdmin() as any).rpc('match_knowledge_chunks', {
      query_embedding: `[${embedding.join(',')}]`,
      match_count: limit,
      similarity_threshold: threshold,
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
