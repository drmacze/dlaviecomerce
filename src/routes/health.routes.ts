import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

const version = '1.1.0';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    ok: true,
    service: env.APP_NAME,
    version,
    features: {
      commerce: env.ENABLE_COMMERCE,
      payments: env.ENABLE_PAYMENTS,
      ai: env.ENABLE_AI,
    },
    timestamp: new Date().toISOString(),
  }));

  app.get('/health/live', async () => ({
    ok: true,
    service: env.APP_NAME,
    version,
    timestamp: new Date().toISOString(),
  }));

  app.get('/health/ready', async (_request, reply) => {
    const checks: Record<string, { ok: boolean; latencyMs?: number }> = {};

    if (env.ENABLE_COMMERCE) {
      const startedAt = performance.now();
      try {
        const { pool } = await import('../../lib/db/src/index.js');
        await pool.query('select 1');
        checks.database = { ok: true, latencyMs: Math.round(performance.now() - startedAt) };
      } catch {
        checks.database = { ok: false };
      }
    }

    const ok = Object.values(checks).every((check) => check.ok);
    return reply.status(ok ? 200 : 503).send({
      ok,
      service: env.APP_NAME,
      version,
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
