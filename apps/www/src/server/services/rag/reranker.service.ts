export type RetrievedChunk = {
  chunk_id: string;
  document_id: string;
  title?: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};
export class RerankerService {
  rerank(chunks: RetrievedChunk[]): RetrievedChunk[] {
    return [...chunks].sort((a, b) => b.similarity - a.similarity);
  }
}
