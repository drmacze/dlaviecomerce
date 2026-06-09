import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDlavieUserFromRequest } from '../../../../../src/lib/supabase/server-session';
const schema = z.string().uuid();
type Context = { params: Promise<{ conversationId: string }> };
const unauthorized = () => NextResponse.json({ ok: false, message: 'Login required.' }, { status: 401 });
const services = () => import('../../../../../src/server/services');
export async function GET(request: Request, context: Context) {
  const user = await getDlavieUserFromRequest(request).catch(() => null); if (!user) return unauthorized();
  const id = schema.safeParse((await context.params).conversationId); if (!id.success) return NextResponse.json({ ok: false, message: 'Conversation not found.' }, { status: 404 });
  try { const { aiHistoryService } = await services(); return NextResponse.json({ ok: true, messages: await aiHistoryService.get(user.id, id.data) }); } catch { return NextResponse.json({ ok: false, message: 'Conversation not found.' }, { status: 404 }); }
}
export async function DELETE(request: Request, context: Context) {
  const user = await getDlavieUserFromRequest(request).catch(() => null); if (!user) return unauthorized();
  const id = schema.safeParse((await context.params).conversationId); if (!id.success) return NextResponse.json({ ok: false, message: 'Conversation not found.' }, { status: 404 });
  try { const { aiHistoryService } = await services(); await aiHistoryService.delete(user.id, id.data); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ ok: false, message: 'Conversation not found.' }, { status: 404 }); }
}
