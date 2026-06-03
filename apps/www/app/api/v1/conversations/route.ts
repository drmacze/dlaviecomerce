import { requireAuth } from '@/src/server/http/auth';
import { handleJson, json } from '@/src/server/http/json';
import { conversationService } from '@/src/server/services';
import { nextCursor, paginationQuerySchema } from '@/src/server/utils/pagination';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  return handleJson(async () => {
    const user = await requireAuth(request.headers);
    const q = paginationQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const items = await conversationService.list(user.id, q.limit, q.cursor);
    return json({ items, next_cursor: nextCursor(items, q.limit, 'updated_at') });
  });
}
