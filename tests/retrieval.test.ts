import { describe, expect, it } from 'vitest';
import { retrievalInputSchema } from '../src/services/rag/retrieval.service.js';

describe('retrieval input validation', () => {
  it('rejects empty queries', () => {
    expect(() => retrievalInputSchema.parse({ query: '   ', limit: 3, threshold: 0.7 })).toThrow();
  });

  it('rejects invalid limits', () => {
    expect(() =>
      retrievalInputSchema.parse({ query: 'hello', limit: 999, threshold: 0.7 }),
    ).toThrow();
  });

  it('rejects invalid thresholds', () => {
    expect(() =>
      retrievalInputSchema.parse({ query: 'hello', limit: 3, threshold: 1.5 }),
    ).toThrow();
  });

  it('sanitizes unsafe control characters from query', () => {
    const input = retrievalInputSchema.parse({
      query: 'hello\u0000 world',
      limit: 2,
      threshold: 0.5,
    });
    expect(input.query).toBe('hello world');
  });
});
