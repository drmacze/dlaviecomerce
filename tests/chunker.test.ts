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

  it('preserves markdown heading hierarchy in chunk metadata', () => {
    const chunks = new ChunkerService().chunk(
      `# Product\n\nIntro paragraph.\n\n## Pricing\n\n- Basic plan\n- Pro plan\n\n## Security\n\n| Control | Status |\n| --- | --- |\n| RLS | Enabled |`,
      { targetTokens: 80, overlapTokens: 10, title: 'DLavie Docs' },
    );

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((chunk) => chunk.metadata.headings.includes('Pricing'))).toBe(true);
    expect(chunks.some((chunk) => chunk.metadata.block_types.includes('table'))).toBe(true);
    expect(chunks.every((chunk) => chunk.metadata.title === 'DLavie Docs')).toBe(true);
  });

  it('handles structured plain text headings', () => {
    const chunks = new ChunkerService().chunk(
      `Overview:\nThis is a structured document.\n\nRequirements:\n1. Keep backend only.\n2. Validate input.`,
      { targetTokens: 60, overlapTokens: 5 },
    );

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((chunk) => chunk.metadata.block_types.includes('structured'))).toBe(true);
  });
});
