'use client';

import Link from 'next/link';
import type { DlavieAccountSession } from '../../lib/supabase/account-session';
import type { AiMode, ModeContent } from './aiContent';
import { AiConsole } from './AiConsole';
import { AiModeSwitch } from './AiModeSwitch';

type AiHeroProps = {
  mode: AiMode;
  modes: ModeContent[];
  content: ModeContent;
  accountSession: DlavieAccountSession;
  onModeChange: (mode: AiMode) => void;
};

export function AiHero({ mode, modes, content, accountSession, onModeChange }: AiHeroProps) {
  const accountUser = accountSession.isAuthenticated ? accountSession.user : null;
  const isAuthenticated = Boolean(accountUser);
  const primaryHref = isAuthenticated ? '/account/dashboard' : '/account/login';
  const primaryLabel = isAuthenticated ? 'Open AI Workspace' : 'Start DLavie AI';
  const secondaryHref = isAuthenticated ? '/account/dashboard' : '/account/register';
  const secondaryLabel = isAuthenticated ? 'Continue with DLavie Account' : 'Create DLavie Account';

  return (
    <section className="dlavie-ai__hero" aria-labelledby="ai-hero-title">
      <nav className="dlavie-ai__nav" aria-label="DLavie AI navigation" data-ai-intro>
        <Link className="dlavie-ai__brand" href="/" aria-label="DLavie home">
          <span className="dlavie-ai__brand-mark">D</span>
          <span>DLavie AI</span>
        </Link>
        <div className="dlavie-ai__nav-links">
          <a href="#modes">Modes</a>
          <a href="#pricing">Access</a>
          <a href="#faq">FAQ</a>
        </div>
        <Link className="dlavie-ai__login" href={isAuthenticated ? '/account/dashboard' : '/account/login'}>
          {isAuthenticated ? 'Workspace' : 'Account'}
        </Link>
      </nav>

      <div className="dlavie-ai__hero-grid">
        <div className="dlavie-ai__hero-copy">
          <p className="dlavie-ai__eyebrow" data-ai-intro>{content.eyebrow}</p>
          <h1 id="ai-hero-title" data-ai-intro>{content.headline}</h1>
          <p className="dlavie-ai__subtitle" data-ai-intro>{content.subcopy}</p>

          <div className="dlavie-ai__account-strip" data-ai-intro>
            <span className="dlavie-ai__account-dot" aria-hidden="true" />
            {accountUser ? (
              <p>
                Signed in as <strong>{accountUser.fullName}</strong>. Your DLavie Account session is active for this workspace.
              </p>
            ) : (
              <p>Public preview is available. Sign in once to connect DLavie Account context and protected AI access.</p>
            )}
          </div>

          <div className="dlavie-ai__hero-actions" data-ai-intro>
            <Link className="ai-button ai-button--primary" href={primaryHref}>{primaryLabel}</Link>
            <Link className="ai-button ai-button--secondary" href={secondaryHref}>{secondaryLabel}</Link>
          </div>
          <AiModeSwitch mode={mode} modes={modes} onModeChange={onModeChange} />
        </div>
        <div className="dlavie-ai__hero-console" data-ai-intro>
          <AiConsole mode={mode} content={content} accountSession={accountSession} onModeChange={onModeChange} />
        </div>
      </div>
    </section>
  );
}
