import type { Metadata } from 'next';
import { DlavieAiAppShell } from '../../src/components/ai/DlavieAiAppShell';
import { getDlavieServerAccountSession } from '../../src/lib/supabase/server-session';

export const metadata: Metadata = {
  title: 'DLavie AI — Mobile AI App',
  description: 'A premium mobile-first DLavie AI app shell for account, commerce, PPOB, website, and automation assistance.',
};

export default async function AiPage() {
  const accountSession = await getDlavieServerAccountSession();
  return <DlavieAiAppShell accountSession={accountSession} />;
}
