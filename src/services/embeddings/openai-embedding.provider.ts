import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import type { EmbeddingProvider } from './embedding-provider.interface.js';
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = 'openai';
  async embed(texts: string[]): Promise<number[][]> {
    const clean = texts.filter((t) => t.trim().length > 0);
    if (clean.length === 0) return [];
    if (!env.OPENAI_API_KEY)
      throw new AppError('AI_PROVIDER_ERROR', 'Embedding API key is not configured.', 502);
    const res = await fetch(`${env.OPENAI_BASE_URL.replace(/\/$/, '')}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_EMBEDDING_MODEL,
        input: clean,
        dimensions: env.OPENAI_EMBEDDING_DIMENSIONS,
      }),
    });
    if (!res.ok)
      throw new AppError('AI_PROVIDER_ERROR', 'Embedding request failed.', 502, {
        status: res.status,
      });
    const json = (await res.json()) as any;
    return (json.data as any[])
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding as number[]);
  }
}
