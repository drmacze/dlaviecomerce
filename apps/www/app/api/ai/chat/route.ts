import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDlavieUserFromRequest } from '../../../../src/lib/supabase/server-session';
import { chatRequestSchema } from '../../../../src/server/schemas/chat.schema';
import { aiPreferencesService, chatService } from '../../../../src/server/services';
import { shouldPersistAiHistory } from '../../../../src/server/services/ai-history/persistence';

const schema = z.object({
  message: z.string().trim().min(1).max(12000),
  mode: z.enum(['fast', 'private', 'dlavie', 'general']).default('fast'),
  conversationId: z.string().uuid().optional(),
  metadata: z.object({ history_enabled: z.boolean().default(false) }).passthrough().default({ history_enabled: false }),
}).strict();

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid chat request.', issues: parsed.error.issues }, { status: 400 });
  const user = await getDlavieUserFromRequest(request).catch(() => null);
  const preference = user ? await aiPreferencesService.get(user.id).catch(() => ({ historyEnabled: false })) : { historyEnabled: false };
  const persist = shouldPersistAiHistory({ authenticated: Boolean(user), serverHistoryEnabled: preference.historyEnabled, clientHistoryEnabled: parsed.data.metadata.history_enabled, mode: parsed.data.mode });
  const providerRequest = chatRequestSchema.parse({
    conversation_id: persist ? parsed.data.conversationId : undefined,
    mode: parsed.data.mode === 'dlavie' ? 'dlavie' : 'general',
    use_rag: false,
    stream: false,
    messages: [{ role: 'user', content: parsed.data.message }],
    metadata: { ...parsed.data.metadata, requested_mode: parsed.data.mode },
  });
  try {
    const result = await chatService.send(user?.id, providerRequest, Date.now(), { persist });
    return NextResponse.json({ ok: true, answer: result.answer, source: result.provider, mode: parsed.data.mode, conversationId: result.conversation_id, persisted: result.persisted });
  } catch {
    return NextResponse.json({ ok: false, message: 'AI provider is currently unavailable.' }, { status: 503 });
  }
}
