'use client';

import Link from 'next/link';
import type { AiMode, ModeContent } from './aiContent';
import { AiConsole } from './AiConsole';
import { AiModeSwitch } from './AiModeSwitch';

type AiHeroProps = {
  mode: AiMode;
  modes: ModeContent[];
  content: ModeContent;
  onModeChange: (mode: AiMode) => void;
};

export function AiHero({ mode, modes, content, onModeChange }: AiHeroProps) {
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
        <Link className="dlavie-ai__login" href="/account/login">Account</Link>
      </nav>

      <div className="dlavie-ai__hero-grid">
        <div className="dlavie-ai__hero-copy">
          <p className="dlavie-ai__eyebrow" data-ai-intro>{content.eyebrow}</p>
          <h1 id="ai-hero-title" data-ai-intro>{content.headline}</h1>
          <p className="dlavie-ai__subtitle" data-ai-intro>{content.subcopy}</p>
          <div className="dlavie-ai__hero-actions" data-ai-intro>
            <Link className="ai-button ai-button--primary" href="/account/login">Start DLavie AI</Link>
            <a className="ai-button ai-button--secondary" href="#modes">Explore Agent Mode</a>
          </div>
          <AiModeSwitch mode={mode} modes={modes} onModeChange={onModeChange} />
        </div>
        <div className="dlavie-ai__hero-console" data-ai-intro>
          <AiConsole mode={mode} content={content} onModeChange={onModeChange} />
        </div>
      </div>
    </section>
  );
}
