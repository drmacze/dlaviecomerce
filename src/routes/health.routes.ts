import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    ok: true,
    service: env.APP_NAME,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));
}
