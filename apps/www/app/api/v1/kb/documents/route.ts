import { requireAdmin } from '@/src/server/http/auth';
import { handleJson, json, readJson } from '@/src/server/http/json';
import { documentCreateSchema } from '@/src/server/schemas/knowledge.schema';
import { knowledgeService } from '@/src/server/services';
import { nextCursor, paginationQuerySchema } from '@/src/server/utils/pagination';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export function POST(request: NextRequest) {
  return handleJson(async () => {
    const user = await requireAdmin(request.headers);
    const body = documentCreateSchema.parse(await readJson(request));
    return json(await knowledgeService.createDocument({ ...body, created_by: user?.id }), { status: 201 });
  });
}

export function GET(request: NextRequest) {
  return handleJson(async () => {
    await requireAdmin(request.headers);
    const q = paginationQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const items = await knowledgeService.list(q.limit, q.cursor);
    return json({ items, next_cursor: nextCursor(items, q.limit, 'created_at') });
  });
}
