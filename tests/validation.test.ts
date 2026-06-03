import { describe, expect, it } from 'vitest';
import { getEnv } from '../src/config/env.js';
import { formatError } from '../src/lib/errors.js';
import { chatRequestSchema } from '../src/schemas/chat.schema.js';
describe('validation', () => {
  it('rejects invalid chat input', () => {
    expect(() => chatRequestSchema.parse({ messages: [{ role: 'tool', content: '' }] })).toThrow();
  });
  it('production env catches missing required vars', () => {
    expect(() => getEnv({ NODE_ENV: 'production' })).toThrow(/Missing required/);
  });
  it('formats errors consistently', () => {
    expect(formatError('BAD_REQUEST', 'Bad')).toEqual({
      error: { code: 'BAD_REQUEST', message: 'Bad', details: {} },
    });
  });
});
