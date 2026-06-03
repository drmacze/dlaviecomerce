import { env } from '@/src/server/config/env';
import { requireAuth } from '@/src/server/http/auth';
import { handleJson, json } from '@/src/server/http/json';
import { chatModes } from '@/src/server/schemas/chat.schema';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  return handleJson(async () => {
    await requireAuth(request.headers);
    return json({
      primaryProvider: env.PRIMARY_AI_PROVIDER,
      fallbackProvider: env.FALLBACK_AI_PROVIDER,
      ragEnabled: env.ENABLE_RAG,
      fallbackEnabled: env.ENABLE_MODEL_FALLBACK,
      availableModes: chatModes,
    });
  });
}
