import { describe, expect, it } from 'vitest';
import { ChunkerService } from '../src/services/rag/chunker.service.js';
describe('chunker', () => {
  it('splits long content', () => {
    const text = Array.from({ length: 300 }, (_, i) => `Paragraph ${String(i)} `.repeat(20)).join(
      '\n\n',
    );
    const chunks = new ChunkerService().chunk(text, { targetTokens: 300, overlapTokens: 30 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.metadata.chunk_index).toBe(0);
  });
});
