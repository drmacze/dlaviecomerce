import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDlavieUserFromRequest } from '../../../../src/lib/supabase/server-session';

const patchSchema = z.object({ historyEnabled: z.boolean() }).strict();
const unauthorized = () => NextResponse.json({ ok: false, message: 'Login required.' }, { status: 401 });
const services = () => import('../../../../src/server/services');

export async function GET(request: Request) {
  const user = await getDlavieUserFromRequest(request).catch(() => null);
  if (!user) return unauthorized();
  try { const { aiPreferencesService } = await services(); return NextResponse.json({ ok: true, preferences: await aiPreferencesService.get(user.id) }); }
  catch { return NextResponse.json({ ok: false, message: 'Unable to load preferences.' }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  const user = await getDlavieUserFromRequest(request).catch(() => null);
  if (!user) return unauthorized();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid preferences.', issues: parsed.error.issues }, { status: 400 });
  try { const { aiPreferencesService } = await services(); return NextResponse.json({ ok: true, preferences: await aiPreferencesService.update(user.id, parsed.data.historyEnabled) }); }
  catch { return NextResponse.json({ ok: false, message: 'Unable to update preferences.' }, { status: 500 }); }
}
