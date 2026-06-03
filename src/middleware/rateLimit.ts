import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { formatError } from '../lib/errors.js';

export async function registerRateLimit(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    keyGenerator: (request) => `${request.user?.id ?? 'anon'}:${request.ip}`,
    errorResponseBuilder: () => formatError('RATE_LIMITED', 'Rate limit exceeded.'),
  });
}
