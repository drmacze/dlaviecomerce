import 'dotenv/config';
import { z } from 'zod';

const boolish = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const optionalSecret = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined));

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(8787),
    APP_NAME: z.string().default('DLavie Platform API'),
    API_BASE_URL: z.string().url().default('http://localhost:8787'),
    STOREFRONT_URL: z.string().url().default('http://localhost:3000'),
    CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
    TRUST_PROXY: boolish.default(false),

    ENABLE_AI: boolish.default(false),
    ENABLE_COMMERCE: boolish.default(false),
    ENABLE_PAYMENTS: boolish.default(false),

    DATABASE_URL: optionalSecret,
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
    DATABASE_SSL_MODE: z.enum(['disable', 'require', 'verify-full']).default('disable'),

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

    MIDTRANS_SERVER_KEY: optionalSecret,
    MIDTRANS_IS_PRODUCTION: boolish.default(false),
    PAYMENT_EXPIRY_MINUTES: z.coerce.number().int().min(15).max(1440).default(60),
    ORDER_PREFIX: z.string().regex(/^[A-Z0-9]{2,8}$/).default('DLV'),
    CART_TTL_DAYS: z.coerce.number().int().min(1).max(30).default(14),

    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_WINDOW: z.string().default('1 minute'),
    CHECKOUT_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(60).default(10),
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

    if (value.ENABLE_PAYMENTS && !value.ENABLE_COMMERCE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ENABLE_PAYMENTS'],
        message: 'ENABLE_PAYMENTS requires ENABLE_COMMERCE=true.',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function getEnv(
  input: NodeJS.ProcessEnv = process.env,
  options?: { allowTestDefaults?: boolean },
): Env {
  const env = envSchema.parse(input);
  const relaxed = env.NODE_ENV === 'test' || options?.allowTestDefaults;
  const missing: string[] = [];

  if (!relaxed && env.ENABLE_COMMERCE) {
    if (!env.DATABASE_URL) missing.push('DATABASE_URL');
    if (!env.ADMIN_API_KEY) missing.push('ADMIN_API_KEY');
  }

  if (!relaxed && env.ENABLE_AI) {
    for (const key of [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_JWT_SECRET',
      'OPENAI_API_KEY',
    ] as const) {
      if (!env[key]) missing.push(key);
    }

    if (env.ENABLE_MODEL_FALLBACK && (!env.HUGGINGFACE_API_KEY || !env.HUGGINGFACE_CHAT_MODEL)) {
      missing.push('HUGGINGFACE_API_KEY', 'HUGGINGFACE_CHAT_MODEL');
    }
  }

  if (!relaxed && env.ENABLE_PAYMENTS && !env.MIDTRANS_SERVER_KEY) {
    missing.push('MIDTRANS_SERVER_KEY');
  }

  if (!relaxed && env.ADMIN_API_KEY && env.ADMIN_API_KEY.length < 32) {
    missing.push('ADMIN_API_KEY(minimum 32 characters)');
  }

  if (env.NODE_ENV === 'production') {
    const origins = env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (origins.length === 0) missing.push('CORS_ORIGINS');
    if (origins.some((origin) => origin === '*' || origin.includes('*'))) {
      missing.push('CORS_ORIGINS(no wildcard in production)');
    }
    if (!env.API_BASE_URL.startsWith('https://')) missing.push('API_BASE_URL(https required)');
    if (!env.STOREFRONT_URL.startsWith('https://')) missing.push('STOREFRONT_URL(https required)');
    if (env.ENABLE_PAYMENTS && !env.MIDTRANS_IS_PRODUCTION) {
      missing.push('MIDTRANS_IS_PRODUCTION(true required when payments are enabled in production)');
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing or invalid environment variables: ${[...new Set(missing)].join(', ')}`);
  }

  return env;
}

export const env = getEnv();
