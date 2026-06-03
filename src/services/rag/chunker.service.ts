import { normalizeWhitespace } from '../../utils/text.js';
import { estimateTokens } from '../../utils/token-estimator.js';
export type Chunk = { content: string; token_count: number; metadata: Record<string, unknown> };
export type ChunkOptions = {
  title?: string | undefined;
  source_type?: string | undefined;
  source_url?: string | undefined;
  targetTokens?: number;
  overlapTokens?: number;
};
export class ChunkerService {
  chunk(content: string, options: ChunkOptions = {}): Chunk[] {
    const target = options.targetTokens ?? 1000;
    const overlap = options.overlapTokens ?? 125;
    const paragraphs = normalizeWhitespace(content)
      .split(/\n\s*\n/)
      .filter(Boolean);
    const chunks: string[] = [];
    let current = '';
    for (const paragraph of paragraphs) {
      if (estimateTokens(`${current}\n\n${paragraph}`) > target && current) {
        chunks.push(current);
        current = this.tail(current, overlap);
      }
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
    if (current) chunks.push(current);
    return chunks
      .flatMap((chunk) => this.splitOversized(chunk, target, overlap))
      .map((chunk, i) => ({
        content: chunk,
        token_count: estimateTokens(chunk),
        metadata: {
          title: options.title,
          source_type: options.source_type,
          source_url: options.source_url,
          chunk_index: i,
        },
      }));
  }
  private splitOversized(text: string, target: number, overlap: number): string[] {
    const approxChars = target * 4;
    const overlapChars = overlap * 4;
    if (text.length <= approxChars * 1.3) return [text];
    const out: string[] = [];
    for (let start = 0; start < text.length; start += approxChars - overlapChars)
      out.push(text.slice(start, start + approxChars));
    return out;
  }
  private tail(text: string, tokens: number): string {
    return text.slice(Math.max(0, text.length - tokens * 4));
  }
}
