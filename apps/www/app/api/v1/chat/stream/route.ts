import { requireAuth } from '@/src/server/http/auth';
import { handleJson } from '@/src/server/http/json';
import { AppError } from '@/src/server/lib/errors';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export function POST(request: NextRequest) {
  return handleJson(async () => {
    await requireAuth(request.headers);
    throw new AppError(
      'NOT_IMPLEMENTED',
      'Streaming is not implemented yet. Use POST /api/v1/chat while SSE integration is completed.',
      501,
    );
  });
}
