import type { RetrievalService } from './retrieval.service.js';
import { RerankerService, type RetrievedChunk } from './reranker.service.js';
export class RagService {
  constructor(
    private retrieval: RetrievalService,
    private reranker = new RerankerService(),
  ) {}
  async context(query: string, limit = 5, threshold = 0.72): Promise<RetrievedChunk[]> {
    return this.reranker.rerank(await this.retrieval.retrieve(query, limit, threshold));
  }
}
