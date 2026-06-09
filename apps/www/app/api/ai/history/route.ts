import { NextResponse } from 'next/server';
import { getDlavieUserFromRequest } from '../../../../src/lib/supabase/server-session';
const unauthorized = () => NextResponse.json({ ok: false, message: 'Login required.' }, { status: 401 });
const services = () => import('../../../../src/server/services');
export async function GET(request: Request) {
  const user = await getDlavieUserFromRequest(request).catch(() => null); if (!user) return unauthorized();
  try { const { aiHistoryService, aiPreferencesService } = await services(); const preferences = await aiPreferencesService.get(user.id); return NextResponse.json({ ok: true, historyEnabled: preferences.historyEnabled, items: preferences.historyEnabled ? await aiHistoryService.list(user.id) : [] }); }
  catch { return NextResponse.json({ ok: false, message: 'Unable to load history.' }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  const user = await getDlavieUserFromRequest(request).catch(() => null); if (!user) return unauthorized();
  try { const { aiHistoryService } = await services(); await aiHistoryService.deleteAll(user.id); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ ok: false, message: 'Unable to delete history.' }, { status: 500 }); }
}
