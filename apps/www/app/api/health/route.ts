import { json } from '@/src/server/http/json';
import { env } from '@/src/server/config/env';

export const runtime = 'nodejs';

export function GET() {
  return json({
    ok: true,
    service: env.APP_NAME,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
