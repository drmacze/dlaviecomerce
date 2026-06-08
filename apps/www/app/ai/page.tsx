import { cookies } from 'next/headers';
import { DlavieAiAppShell } from '../../src/components/ai/DlavieAiAppShell';
import { createAccountSessionView } from '../../src/lib/supabase/account-session';
import { validateDlavieAccessToken } from '../../src/lib/supabase/server-session';
import { DLAVIE_ACCESS_COOKIE } from '../../src/lib/supabase/session';

export const metadata = { title: 'DLavie AI', description: 'Account-aware DLavie AI workspace.' };
export const dynamic = 'force-dynamic';

export default async function AiPage() {
  const store = await cookies();
  const user = await validateDlavieAccessToken(store.get(DLAVIE_ACCESS_COOKIE)?.value).catch(() => null);
  return <DlavieAiAppShell accountSession={createAccountSessionView(user)} />;
}
