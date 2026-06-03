import { requireAuth } from '@/src/server/http/auth';
import { handleJson, json } from '@/src/server/http/json';
import { conversationParamSchema } from '@/src/server/schemas/conversation.schema';
import { conversationService } from '@/src/server/services';
import { messagesPaginationQuerySchema, nextCursor } from '@/src/server/utils/pagination';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ conversationId: string }> };

export function GET(request: NextRequest, context: RouteContext) {
  return handleJson(async () => {
    const user = await requireAuth(request.headers);
    const params = conversationParamSchema.parse(await context.params);
    const q = messagesPaginationQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const items = await conversationService.messages(user.id, params.conversationId, q.limit, q.cursor);
    return json({ items, next_cursor: nextCursor(items, q.limit, 'created_at') });
  });
}
