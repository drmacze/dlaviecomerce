import 'server-only';
import crypto from 'node:crypto';
import type { FastifyInstance, HTTPMethods } from 'fastify';

export class EmbeddedCommerceConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmbeddedCommerceConfigurationError';
  }
}

type EmbeddedState = {
  app?: Promise<FastifyInstance>;
  internalAdminKey?: string;
};

const state = globalThis as typeof globalThis & { __dlavieEmbeddedCommerce?: EmbeddedState };
state.__dlavieEmbeddedCommerce ??= {};

function deploymentOrigin(explicitOrigin?: string): string {
  if (explicitOrigin) return new URL(explicitOrigin).origin;

  const storefrontUrl = process.env.STOREFRONT_URL?.trim();
  if (storefrontUrl) return new URL(storefrontUrl).origin;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return new URL(`https://${vercelUrl}`).origin;

  return 'http://localhost:3000';
}

function ensureEmbeddedEnvironment(origin: string): void {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new EmbeddedCommerceConfigurationError(
      'Neon is not connected. DATABASE_URL is unavailable to the Vercel project.',
    );
  }

  state.__dlavieEmbeddedCommerce ??= {};
  state.__dlavieEmbeddedCommerce.internalAdminKey ??= crypto.randomBytes(32).toString('hex');

  process.env.ENABLE_COMMERCE = 'true';
  process.env.ENABLE_PAYMENTS ??= 'false';
  process.env.ENABLE_AI ??= 'false';
  process.env.DATABASE_POOL_MAX ??= '1';
  process.env.DATABASE_SSL_MODE ??= 'require';
  process.env.ADMIN_API_KEY ??= state.__dlavieEmbeddedCommerce.internalAdminKey;
  process.env.API_BASE_URL ??= origin;
  process.env.STOREFRONT_URL ??= origin;
  process.env.CORS_ORIGINS ??= origin;
  process.env.TRUST_PROXY ??= 'true';
}

async function createEmbeddedApp(origin: string): Promise<FastifyInstance> {
  ensureEmbeddedEnvironment(origin);

  const [{ pool }, { runMigrations }] = await Promise.all([
    import('../../../../lib/db/src/index'),
    import('../../../../lib/db/src/migrate'),
  ]);

  await runMigrations(pool, {
    log: (message) => console.info(`[commerce-migration] ${message}`),
  });

  const { buildApp } = await import('../../../../src/app');
  const app = await buildApp();
  await app.ready();
  return app;
}

async function embeddedApp(origin?: string): Promise<FastifyInstance> {
  const resolvedOrigin = deploymentOrigin(origin);
  state.__dlavieEmbeddedCommerce ??= {};
  state.__dlavieEmbeddedCommerce.app ??= createEmbeddedApp(resolvedOrigin).catch((error) => {
    if (state.__dlavieEmbeddedCommerce) state.__dlavieEmbeddedCommerce.app = undefined;
    throw error;
  });
  return state.__dlavieEmbeddedCommerce.app;
}

function responseHeaders(source: Record<string, string | string[] | undefined>): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(name, entry);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  headers.set('Cache-Control', 'no-store');
  return headers;
}

export async function embeddedCommerceFetch(
  pathname: string,
  options: {
    method?: string;
    headers?: Headers;
    body?: ArrayBuffer;
    origin?: string;
  } = {},
): Promise<Response> {
  const app = await embeddedApp(options.origin);
  const result = await app.inject({
    method: (options.method ?? 'GET') as HTTPMethods,
    url: pathname,
    headers: options.headers ? Object.fromEntries(options.headers.entries()) : undefined,
    payload: options.body ? Buffer.from(options.body) : undefined,
  });

  return new Response(result.rawPayload, {
    status: result.statusCode,
    headers: responseHeaders(result.headers),
  });
}
