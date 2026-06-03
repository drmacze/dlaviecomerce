import { requireAdmin } from '@/src/server/http/auth';
import { handleJson, json } from '@/src/server/http/json';
import { documentIdParamSchema } from '@/src/server/schemas/common.schema';
import { knowledgeService } from '@/src/server/services';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ documentId: string }> };

export function DELETE(request: NextRequest, context: RouteContext) {
  return handleJson(async () => {
    await requireAdmin(request.headers);
    const params = documentIdParamSchema.parse(await context.params);
    await knowledgeService.delete(params.documentId);
    return json({ ok: true });
  });
}
