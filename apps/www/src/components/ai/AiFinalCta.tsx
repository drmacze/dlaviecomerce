import Link from 'next/link';
import type { DlavieAccountSession } from '../../lib/supabase/account-session';

type AiFinalCtaProps = {
  accountSession: DlavieAccountSession;
};

export function AiFinalCta({ accountSession }: AiFinalCtaProps) {
  const accountUser = accountSession.isAuthenticated ? accountSession.user : null;
  const isAuthenticated = Boolean(accountUser);

  return (
    <section className="dlavie-ai__section ai-final" aria-labelledby="ai-final-title" data-ai-final>
      <div data-ai-reveal>
        <p className="dlavie-ai__eyebrow">DLavie Intelligence Workspace</p>
        <h2 id="ai-final-title">
          {isAuthenticated
            ? 'Your DLavie Account is active. Continue into the AI workspace.'
            : 'Bring support, commerce, and operating agents into one premium AI surface.'}
        </h2>
        <p>
          {accountUser
            ? `Continue as ${accountUser.fullName} without logging in again. The page already detected your secure DLavie Account cookie on the server.`
            : 'Start with DLavie AI conversation mode, then unlock DLavieOS Agent workflows as protected tools come online.'}
        </p>
        <div className="ai-final__actions">
          <Link className="ai-button ai-button--primary" href={isAuthenticated ? '/account/dashboard' : '/account/login'}>
            {isAuthenticated ? 'Open AI Workspace' : 'Start DLavie AI'}
          </Link>
          <Link className="ai-button ai-button--secondary" href={isAuthenticated ? '/account/dashboard' : '/account/register'}>
            {isAuthenticated ? 'Continue with DLavie Account' : 'Create DLavie Account'}
          </Link>
        </div>
      </div>
    </section>
  );
}
