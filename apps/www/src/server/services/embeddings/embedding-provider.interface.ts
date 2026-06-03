export interface EmbeddingProvider {
  name: string;
  embed(texts: string[]): Promise<number[][]>;
}
