import { requireAdmin } from '@/src/server/http/auth';
import { handleJson, json, readJson } from '@/src/server/http/json';
import { kbSearchSchema } from '@/src/server/schemas/knowledge.schema';
import { knowledgeService } from '@/src/server/services';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export function POST(request: NextRequest) {
  return handleJson(async () => {
    await requireAdmin(request.headers);
    const body = kbSearchSchema.parse(await readJson(request));
    const items = await knowledgeService.search(body.query, body.limit, body.similarity_threshold);
    return json({ items });
  });
}
