import { requireAuth } from '@/src/server/http/auth';
import { handleJson, json, readJson } from '@/src/server/http/json';
import { chatRequestSchema } from '@/src/server/schemas/chat.schema';
import { chatService } from '@/src/server/services';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export function POST(request: NextRequest) {
  return handleJson(async () => {
    const user = await requireAuth(request.headers);
    const body = chatRequestSchema.parse(await readJson(request));
    return json(await chatService.send(user.id, body, Date.now()));
  });
}
