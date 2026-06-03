import { env } from '../../config/env.js';
import type { RetrievalService } from './retrieval.service.js';
import { RerankerService, type RetrievedChunk } from './reranker.service.js';
export class RagService {
  constructor(
    private retrieval: RetrievalService,
    private reranker = new RerankerService(),
  ) {}
  async context(
    query: string,
    limit = env.RAG_RETRIEVAL_MAX_RESULTS,
    threshold = env.RAG_SIMILARITY_THRESHOLD,
  ): Promise<RetrievedChunk[]> {
    return this.reranker.rerank(await this.retrieval.retrieve(query, limit, threshold));
  }
}
