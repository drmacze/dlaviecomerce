import { optionalAuth } from '@/src/server/http/auth';
import { handleJson, json, readJson } from '@/src/server/http/json';
import { appChatRequestSchema } from '@/src/server/schemas/app-chat.schema';
import { appChatService } from '@/src/server/services';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export function POST(request: NextRequest) {
  return handleJson(async () => {
    const body = appChatRequestSchema.parse(await readJson(request));
    const user = await optionalAuth(request.headers);
    return json(await appChatService.send(body, user?.id));
  });
}
