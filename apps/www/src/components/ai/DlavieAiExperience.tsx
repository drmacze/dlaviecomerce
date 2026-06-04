'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, registerDlavieGsap, ScrollTrigger } from '@dlavie/animations';
import { createLenis } from '../../motion/createLenis';

type Mode = 'ai' | 'agent';

type Feature = {
  title: string;
  text: string;
  meta: string;
};

const aiFeatures: Feature[] = [
  {
    title: 'Context memory',
    text: 'Keep answers aligned with DLavie Account, products, documentation, and user workspace intent.',
    meta: 'Memory layer',
  },
  {
    title: 'AI conversations',
    text: 'Create polished responses, summaries, plans, support replies, and product guidance in seconds.',
    meta: 'Conversation engine',
  },
  {
    title: 'Multi-language support',
    text: 'Serve Indonesian and global users with a clean intelligence surface built for commerce and support.',
    meta: 'Language routing',
  },
  {
    title: 'Voice-ready control',
    text: 'Prepared UI layer for future voice actions, quick commands, and low-friction mobile interaction.',
    meta: 'Command input',
  },
];

const agentFeatures: Feature[] = [
  {
    title: 'Workflow automation',
    text: 'Transform user intent into structured steps, product actions, commerce flows, and operational tasks.',
    meta: 'Agent runtime',
  },
  {
    title: 'Tool orchestration',
    text: 'Prepare a secure surface for connectors, account data, dashboards, memory, and business actions.',
    meta: 'Tool layer',
  },
  {
    title: 'Commerce operations',
    text: 'Route order checks, PPOB actions, product tasks, and admin workflows into one operating surface.',
    meta: 'Commerce rail',
  },
  {
    title: 'Decision monitoring',
    text: 'Expose agent status, confidence, queue state, and human handoff triggers before execution.',
    meta: 'Safety checks',
  },
];

const faqs = [
  ['What is DLavie AI?', 'A conversational intelligence surface for support, product guidance, planning, summaries, and ecosystem navigation.'],
  ['How is DLavieOS Agent different?', 'DLavieOS Agent is the execution layer. It can be connected to workflows, tools, dashboards, commerce operations, and future automations.'],
  ['Does this connect to my DLavie Account?', 'Yes. The interface is designed to use DLavie Account access and card status before unlocking protected AI features.'],
  ['Is the backend already required?', 'The page is UI-ready and backend-ready. Connect your AI endpoint to the console action when the backend route is finalized.'],
];

const planCards = [
  ['Starter', 'For testing DLavie AI', 'Rp0', ['AI landing access', 'Account gated flow', 'Basic prompts']],
  ['Operator', 'For active workspaces', 'Rp29k', ['Priority AI surface', 'Agent mode preview', 'Workflow console UI']],
  ['Enterprise', 'For DLavie operations', 'Custom', ['Private routing', 'Team access', 'Advanced integrations']],
];

export function DlavieAiExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('ai');
  const [thinking, setThinking] = useState(false);
  const [consoleText, setConsoleText] = useState('How can DLavie help you today?');

  const features = mode === 'ai' ? aiFeatures : agentFeatures;
  const headline = mode === 'ai'
    ? 'AI customer intelligence that never sleeps.'
    : 'Operating agents for workflows, commerce, and tools.';
  const subcopy = mode === 'ai'
    ? 'DLavie AI helps users ask, plan, summarize, compare, write, and navigate the DLavie ecosystem from one cinematic command surface.'
    : 'DLavieOS Agent turns intent into structured action, preparing workflows, tool calls, commerce tasks, and secure operational routes.';

  const consoleLines = useMemo(() => {
    return mode === 'ai'
      ? ['Reading context', 'Composing answer', 'Checking DLavie docs']
      : ['Planning workflow', 'Checking tools', 'Preparing action queue'];
  }, [mode]);

  useEffect(() => {
    registerDlavieGsap();
    const lenis = createLenis();
    const root = rootRef.current;
    if (!root) return () => lenis.destroy();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return () => lenis.destroy();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-ai-intro]',
        { y: 34, opacity: 0, filter: 'blur(18px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.95, stagger: 0.08, ease: 'power3.out' },
      );

      gsap.utils.toArray<HTMLElement>('[data-ai-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 44, opacity: 0, filter: 'blur(16px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 82%',
            },
          },
        );
      });

      gsap.to('.dlavie-ai__aurora', {
        xPercent: 8,
        yPercent: -6,
        scale: 1.08,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.ai-console__orb', {
        boxShadow: '0 0 60px rgba(89, 128, 255, 0.7), 0 0 120px rgba(88, 202, 255, 0.34)',
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-mode-swap]',
        { y: 18, opacity: 0, filter: 'blur(12px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, stagger: 0.04, ease: 'power3.out' },
      );
    }, root);

    return () => ctx.revert();
  }, [mode]);

  function runThinking(prompt: string) {
    setConsoleText(prompt);
    setThinking(true);
    window.setTimeout(() => setThinking(false), 2200);
  }

  return (
    <div ref={rootRef} className="dlavie-ai" data-mode={mode}>
      <div className="dlavie-ai__background" aria-hidden="true">
        <span className="dlavie-ai__aurora" />
        <span className="dlavie-ai__grid" />
        <span className="dlavie-ai__beam dlavie-ai__beam--left" />
        <span className="dlavie-ai__beam dlavie-ai__beam--right" />
      </div>

      <header className="dlavie-ai__nav" data-ai-intro>
        <Link href="/" className="dlavie-ai__brand" aria-label="DLavie home">DLavie</Link>
        <nav aria-label="DLavie AI navigation">
          <a href="#features">Feature</a>
          <a href="#business">Business</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <Link href="/account/login" className="dlavie-ai__signup">Sign in</Link>
      </header>

      <main>
        <section className="dlavie-ai__hero" aria-labelledby="dlavie-ai-title">
          <div className="dlavie-ai__hero-copy">
            <p className="dlavie-ai__eyebrow" data-ai-intro>DLavie intelligence workspace</p>
            <h1 id="dlavie-ai-title" data-ai-intro data-mode-swap>{headline}</h1>
            <p data-ai-intro data-mode-swap>{subcopy}</p>
            <div className="dlavie-ai__actions" data-ai-intro>
              <button type="button" onClick={() => runThinking(mode === 'ai' ? 'Create a support response for a DLavie customer.' : 'Plan an agent workflow for commerce operations.')}>Run AI preview</button>
              <Link href="/account/register">Create account</Link>
            </div>
          </div>

          <div className="ai-console" data-ai-intro>
            <div className="ai-console__chrome">
              <span>DLavie {mode === 'ai' ? 'AI' : 'OS Agent'} / Console</span>
              <div>
                <button type="button" aria-pressed={mode === 'ai'} onClick={() => setMode('ai')}>AI</button>
                <button type="button" aria-pressed={mode === 'agent'} onClick={() => setMode('agent')}>Agent</button>
              </div>
            </div>
            <div className="ai-console__body">
              <p className="ai-console__prompt">{consoleText}</p>
              <div className="ai-console__thinking" data-active={thinking ? 'true' : 'false'} aria-live="polite">
                <span className="ai-console__orb" />
                <div>
                  <strong>{thinking ? 'Thinking' : 'Ready'}</strong>
                  <p>{thinking ? consoleLines.join(' / ') : 'Choose a task or ask DLavie to begin.'}</p>
                </div>
              </div>
              <div className="ai-console__input">
                <button type="button">+</button>
                <input readOnly value={mode === 'ai' ? 'Ask DLavie to summarize customer intent...' : 'Ask Agent to prepare a workflow...'} aria-label="DLavie AI prompt preview" />
                <button type="button" onClick={() => runThinking('Analyze DLavie customer intent and propose the next best action.')}>Go</button>
              </div>
            </div>
          </div>
        </section>

        <section className="ai-logo-rail" aria-label="DLavie ecosystem connectors" data-ai-reveal>
          {['DLavieOS', 'Commerce', 'PPOB', 'Wallet', 'Dashboard'].map((item) => <span key={item}>{item}</span>)}
        </section>

        <section id="features" className="ai-section ai-section--features" aria-labelledby="features-title">
          <div className="ai-section__heading" data-ai-reveal>
            <h2 id="features-title">Everything you need to automate intelligence.</h2>
            <p>From AI-powered chat responses to workflow automation, DLavie connects support, commerce, and operations.</p>
          </div>
          <div className="ai-feature-grid">
            {features.map((feature, index) => (
              <article className="ai-feature-card" key={feature.title} data-ai-reveal>
                <div className="ai-feature-card__visual">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i />
                </div>
                <p>{feature.meta}</p>
                <h3>{feature.title}</h3>
                <span>{feature.text}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="business" className="ai-section ai-section--business" aria-labelledby="business-title">
          <div className="ai-section__heading" data-ai-reveal>
            <h2 id="business-title">Built for every type of business.</h2>
            <p>From startups to DLavie operators, the same intelligence surface scales with users, dashboards, and workflows.</p>
          </div>
          <div className="ai-business-panel" data-ai-reveal>
            {['SaaS companies', 'E-commerce stores', 'PPOB operators', 'Creator support', 'Internal teams'].map((item) => (
              <div key={item}><strong>{item}</strong><span>Automate support, context, and decisions with DLavie AI.</span></div>
            ))}
          </div>
        </section>

        <section className="ai-section ai-section--testimonial" aria-labelledby="testimonial-title">
          <div className="ai-testimonial" data-ai-reveal>
            <p>What early users love about DLavie</p>
            <h2 id="testimonial-title">It feels like a command center, not a chatbot.</h2>
            <span>DLavie AI combines premium interaction, account identity, and backend-ready AI routing into one focused workspace.</span>
          </div>
        </section>

        <section id="pricing" className="ai-section ai-section--pricing" aria-labelledby="pricing-title">
          <div className="ai-section__heading" data-ai-reveal>
            <h2 id="pricing-title">Select a plan that suits your business.</h2>
            <p>Plans are visual placeholders until final pricing and backend entitlement rules are connected.</p>
          </div>
          <div className="ai-plan-grid">
            {planCards.map(([name, description, price, items]) => (
              <article className="ai-plan-card" key={name} data-ai-reveal>
                <p>{description}</p>
                <h3>{name}</h3>
                <strong>{price}</strong>
                <Link href="/account/register">Start now</Link>
                <ul>{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="ai-section ai-section--faq" aria-labelledby="faq-title">
          <div className="ai-section__heading" data-ai-reveal>
            <h2 id="faq-title">Frequently asked questions.</h2>
            <p>Clear rules for DLavie AI, DLavieOS Agent, account access, and backend activation.</p>
          </div>
          <div className="ai-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question} data-ai-reveal>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="ai-section ai-section--insights" aria-labelledby="insights-title">
          <div className="ai-section__heading" data-ai-reveal>
            <h2 id="insights-title">Our insights.</h2>
            <p>Operational notes for the next DLavie AI milestones.</p>
          </div>
          <div className="ai-insight-grid" data-ai-reveal>
            {['Backend routing', 'Memory model', 'Agent safety', 'Mobile command'].map((item) => <article key={item}><span>{item}</span></article>)}
          </div>
        </section>

        <section className="ai-final" data-ai-reveal>
          <h2>Let us build the DLavie intelligence layer.</h2>
          <p>Connect DLavie Account, backend AI, and agent workflows into a single elegant product experience.</p>
          <Link href="/account/register">Get started</Link>
        </section>
      </main>
    </div>
  );
}
