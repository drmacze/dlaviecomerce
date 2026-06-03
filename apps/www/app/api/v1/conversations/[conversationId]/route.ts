import { requireAuth } from '@/src/server/http/auth';
import { handleJson, json } from '@/src/server/http/json';
import { conversationParamSchema } from '@/src/server/schemas/conversation.schema';
import { conversationService } from '@/src/server/services';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ conversationId: string }> };

export function DELETE(request: NextRequest, context: RouteContext) {
  return handleJson(async () => {
    const user = await requireAuth(request.headers);
    const params = conversationParamSchema.parse(await context.params);
    await conversationService.delete(user.id, params.conversationId);
    return json({ ok: true });
  });
}
