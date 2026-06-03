import { AppError } from '../../lib/errors.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { EmbeddingService } from '../embeddings/embedding.service.js';
import { ChunkerService } from '../rag/chunker.service.js';
import { RetrievalService } from '../rag/retrieval.service.js';
export class KnowledgeService {
  constructor(
    private chunker: ChunkerService,
    private embeddings: EmbeddingService,
    private retrieval: RetrievalService,
  ) {}
  async createDocument(input: {
    title: string;
    content: string;
    source_type: string;
    source_url?: string | undefined;
    metadata: Record<string, unknown>;
    created_by?: string | undefined;
  }) {
    const { data: doc, error } = await (getSupabaseAdmin() as any)
      .from('knowledge_documents')
      .insert({
        title: input.title,
        content: input.content,
        source_type: input.source_type,
        source_url: input.source_url,
        metadata: input.metadata,
        created_by: input.created_by,
      })
      .select('id')
      .single();
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to insert knowledge document.', 500, {
        message: error.message,
      });
    const chunks = this.chunker.chunk(input.content, {
      title: input.title,
      source_type: input.source_type,
      source_url: input.source_url,
    });
    const vectors = await this.embeddings.embed(chunks.map((c) => c.content));
    const rows = chunks.map((c, i) => ({
      document_id: doc.id,
      chunk_index: i,
      content: c.content,
      embedding: vectors[i] ? `[${vectors[i]!.join(',')}]` : null,
      token_count: c.token_count,
      metadata: c.metadata,
    }));
    const { error: chunkError } = await (getSupabaseAdmin() as any)
      .from('knowledge_chunks')
      .insert(rows);
    if (chunkError)
      throw new AppError('DATABASE_ERROR', 'Failed to insert knowledge chunks.', 500, {
        message: chunkError.message,
      });
    return { document_id: doc.id, chunks_created: chunks.length };
  }
  async list(limit: number, cursor?: string) {
    let q = (getSupabaseAdmin() as any)
      .from('knowledge_documents')
      .select('id,title,source_type,source_url,metadata,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (cursor) q = q.lt('created_at', cursor);
    const { data, error } = await q;
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to list documents.', 500, {
        message: error.message,
      });
    return data ?? [];
  }
  async delete(id: string) {
    const { error } = await (getSupabaseAdmin() as any)
      .from('knowledge_documents')
      .delete()
      .eq('id', id);
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to delete document.', 500, {
        message: error.message,
      });
  }
  async search(query: string, limit: number, threshold: number) {
    return this.retrieval.retrieve(query, limit, threshold);
  }
}
