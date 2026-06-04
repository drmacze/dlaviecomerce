import { DlavieAiExperience } from '../../src/components/ai/DlavieAiExperience';
import { getDlavieAccountSession } from '../../src/lib/supabase/server-session';

export const metadata = {
  title: 'DLavie AI — Customer Intelligence Workspace',
  description: 'A modern DLavie AI workspace for conversations, workflow agents, commerce operations, and account-connected intelligence.',
};

export default async function AiPage() {
  const accountSession = await getDlavieAccountSession();

  return <DlavieAiExperience accountSession={accountSession} />;
}
