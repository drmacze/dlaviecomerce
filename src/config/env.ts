import 'dotenv/config';
import { z } from 'zod';

const boolish = z.string().transform((v) => v === 'true');
const optionalSecret = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(8787),
    APP_NAME: z.string().default('DLavie AI Backend'),
    API_BASE_URL: z.string().url().default('http://localhost:8787'),
    CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
    SUPABASE_URL: optionalSecret,
    SUPABASE_ANON_KEY: optionalSecret,
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
    SUPABASE_JWT_SECRET: optionalSecret,
    ADMIN_API_KEY: optionalSecret,
    PRIMARY_AI_PROVIDER: z.string().default('openai'),
    OPENAI_API_KEY: optionalSecret,
    OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
    OPENAI_CHAT_MODEL: z.string().default('gpt-4.1-mini'),
    OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
    OPENAI_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536),
    FALLBACK_AI_PROVIDER: z.string().default('huggingface'),
    HUGGINGFACE_API_KEY: optionalSecret,
    HUGGINGFACE_CHAT_MODEL: optionalSecret,
    ENABLE_RAG: boolish.default(true),
    RAG_CHUNK_TARGET_TOKENS: z.coerce.number().int().min(200).max(4000).default(1000),
    RAG_CHUNK_OVERLAP_TOKENS: z.coerce.number().int().min(0).max(1000).default(125),
    RAG_RETRIEVAL_MAX_RESULTS: z.coerce.number().int().min(1).max(20).default(5),
    RAG_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.72),
    ENABLE_MODEL_FALLBACK: boolish.default(true),
    ENABLE_USAGE_LOGGING: boolish.default(true),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_WINDOW: z.string().default('1 minute'),
    LOG_LEVEL: z.string().default('info'),
  })
  .superRefine((value, ctx) => {
    if (value.RAG_CHUNK_OVERLAP_TOKENS >= value.RAG_CHUNK_TARGET_TOKENS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RAG_CHUNK_OVERLAP_TOKENS'],
        message: 'RAG_CHUNK_OVERLAP_TOKENS must be lower than RAG_CHUNK_TARGET_TOKENS.',
      });
    }
  });
export type Env = z.infer<typeof envSchema>;

export function getEnv(
  input: NodeJS.ProcessEnv = process.env,
  options?: { allowTestDefaults?: boolean },
): Env {
  const env = envSchema.parse(input);
  const isTestRelaxed = env.NODE_ENV === 'test' || options?.allowTestDefaults;
  const missing: string[] = [];
  if (!isTestRelaxed || env.NODE_ENV === 'production') {
    for (const key of [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_JWT_SECRET',
      'ADMIN_API_KEY',
      'OPENAI_API_KEY',
    ] as const) {
      if (!env[key]) missing.push(key);
    }
    if (env.ENABLE_MODEL_FALLBACK && (!env.HUGGINGFACE_API_KEY || !env.HUGGINGFACE_CHAT_MODEL)) {
      missing.push('HUGGINGFACE_API_KEY', 'HUGGINGFACE_CHAT_MODEL');
    }
  }
  if (env.NODE_ENV === 'production') {
    const origins = env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    if (origins.length === 0) missing.push('CORS_ORIGINS');
    if (origins.some((origin) => origin === '*' || origin.includes('*')))
      missing.push('CORS_ORIGINS(no wildcard in production)');
  }
  if (missing.length > 0)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  return env;
}

export const env = getEnv();
