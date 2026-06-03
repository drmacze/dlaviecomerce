import type { EmbeddingProvider } from './embedding-provider.interface.js';
export class EmbeddingService {
  constructor(private provider: EmbeddingProvider) {}
  async embed(texts: string[], batchSize = 64): Promise<number[][]> {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += batchSize)
      out.push(...(await this.provider.embed(texts.slice(i, i + batchSize))));
    return out;
  }
}
