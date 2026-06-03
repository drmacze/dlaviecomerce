import { describe, expect, it } from 'vitest';
import { getEnv } from '../src/config/env.js';
import { formatError } from '../src/lib/errors.js';
import { documentIdParamSchema } from '../src/schemas/common.schema.js';
import { kbSearchSchema } from '../src/schemas/knowledge.schema.js';

describe('security hardening', () => {
  const productionBase = {
    NODE_ENV: 'production',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    SUPABASE_JWT_SECRET: 'jwt',
    ADMIN_API_KEY: 'admin',
    OPENAI_API_KEY: 'openai',
    ENABLE_MODEL_FALLBACK: 'false',
  };

  it('rejects wildcard CORS in production', () => {
    expect(() => getEnv({ ...productionBase, CORS_ORIGINS: '*' })).toThrow(/CORS_ORIGINS/);
  });

  it('validates knowledge document ids as UUIDs', () => {
    expect(() => documentIdParamSchema.parse({ documentId: 'not-a-uuid' })).toThrow();
  });

  it('parses knowledge search fields explicitly', () => {
    const body = kbSearchSchema.parse({ query: 'hello', limit: 3, similarity_threshold: 0.8 });
    expect(body.query).toBe('hello');
    expect(body.limit).toBe(3);
    expect(body.similarity_threshold).toBe(0.8);
  });

  it('supports a structured not-implemented error code', () => {
    expect(formatError('NOT_IMPLEMENTED', 'Not ready')).toEqual({
      error: { code: 'NOT_IMPLEMENTED', message: 'Not ready', details: {} },
    });
  });
});
