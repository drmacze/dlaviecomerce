import pino from 'pino';
import { getEnv } from '../config/env.js';

const redact = [
  'req.headers.authorization',
  'req.headers.x-admin-api-key',
  'authorization',
  'x-admin-api-key',
  '*.apiKey',
  '*.serviceRoleKey',
];
export function createLogger() {
  const env = getEnv(process.env, { allowTestDefaults: true });
  return pino({ level: env.LOG_LEVEL, redact });
}
export const logger = createLogger();
