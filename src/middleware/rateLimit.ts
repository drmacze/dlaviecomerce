import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { formatError } from '../lib/errors.js';
import { getBearerToken } from '../lib/http.js';
import { sha256 } from '../utils/crypto.js';

export async function registerRateLimit(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    keyGenerator: (request) => {
      const token = getBearerToken(request);
      const principal = token ? `bearer:${sha256(token).slice(0, 16)}` : 'anon';
      return `${principal}:${request.ip}`;
    },
    errorResponseBuilder: () => formatError('RATE_LIMITED', 'Rate limit exceeded.'),
  });
}
