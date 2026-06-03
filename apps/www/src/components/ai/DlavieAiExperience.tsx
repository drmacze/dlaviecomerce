'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, registerDlavieGsap, ScrollTrigger, ScrollToPlugin } from '@dlavie/animations';
import { createLenis } from '../../motion/createLenis';
import { SvgIcon } from '../ui/SvgIcon';

type ProductMode = 'ai' | 'agent';

type ProductContent = {
  mode: ProductMode;
  eyebrow: string;
  title: string;
  label: string;
  description: string;
  cta: string;
  secondary: string;
  tone: string;
  metrics: Array<{ label: string; value: string }>;
  features: Array<{ title: string; text: string }>;
  orbits: string[];
};

const CONTENT: Record<ProductMode, ProductContent> = {
  ai: {
    mode: 'ai',
    eyebrow: 'DLavie AI',
    label: 'Intelligence layer',
    title: 'AI for faster ideas, answers, and decisions.',
    description: 'DLavie AI is the conversational intelligence layer for users who need answers, content, summaries, planning, and product guidance inside the DLavie ecosystem.',
    cta: 'Start DLavie AI',
    secondary: 'Explore Agent Mode',
    tone: 'violet',
    metrics: [
      { label: 'Mode', value: 'Assistant' },
      { label: 'Focus', value: 'Creative + Search' },
      { label: 'Access', value: 'DLavie Card' },
    ],
    features: [
      { title: 'Conversational assistant', text: 'Ask, plan, compare, rewrite, summarize, and create with a focused DLavie-native assistant experience.' },
      { title: 'Product guidance', text: 'Guide users toward DLavieOS, Commerce, automation flows, and account actions without leaving the ecosystem.' },
      { title: 'Knowledge workspace', text: 'Prepare a future knowledge layer for documentation, FAQ, product specs, and user-specific context.' },
    ],
    orbits: ['Prompt', 'Context', 'Answer', 'Insight'],
  },
  agent: {
    mode: 'agent',
    eyebrow: 'DLavieOS Agent',
    label: 'Operating layer',
    title: 'Agents that can operate workflows, tools, and commerce systems.',
    description: 'DLavieOS Agent is the execution layer for users who need structured workflows, autonomous task routing, commerce actions, and connected operations.',
    cta: 'Open Agent Console',
    secondary: 'Switch to DLavie AI',
    tone: 'coral',
    metrics: [
      { label: 'Mode', value: 'Agentic' },
      { label: 'Focus', value: 'Workflow + Action' },
      { label: 'Access', value: 'Verified Card' },
    ],
    features: [
      { title: 'Workflow execution', text: 'Turn user intent into structured steps, product actions, commerce flows, and automation pipelines.' },
      { title: 'Tool-ready interface', text: 'Prepare a future operating surface for connectors, memory, workspace actions, and secure task delegation.' },
      { title: 'Commerce operations', text: 'Route orders, PPOB, dashboards, and business actions through an intelligent agent layer.' },
    ],
    orbits: ['Memory', 'Tools', 'Orders', 'Actions'],
  },
};

export function DlavieAiExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ProductMode>('ai');
  const content = CONTENT[mode];

  const alternateMode = useMemo<ProductMode>(() => (mode === 'ai' ? 'agent' : 'ai'), [mode]);

  useEffect(() => {
    registerDlavieGsap();
    gsap.registerPlugin(ScrollToPlugin);
    const lenis = createLenis();
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 180);

    return () => {
      window.clearTimeout(refresh);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl
        .fromTo('.ai-hero__eyebrow, .ai-hero h1, .ai-hero__copy, .ai-hero__actions',
          { y: 28, opacity: 0, filter: 'blur(14px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.075 })
        .fromTo('.ai-visual__node', { scale: 0.72, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.85, stagger: 0.08 }, '-=0.5')
        .fromTo('.ai-feature-card', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.76, stagger: 0.085 }, '-=0.42');
    }, root);

    return () => ctx.revert();
  }, []);

  function switchMode(nextMode: ProductMode) {
    if (nextMode === mode) return;

    const root = rootRef.current;
    const contentNode = contentRef.current;
    const visualNode = visualRef.current;
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!root || !contentNode || !visualNode || reduceMotion) {
      setMode(nextMode);
      return;
    }

    registerDlavieGsap();
    gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      .to([contentNode, visualNode], { y: -18, opacity: 0, filter: 'blur(18px)', duration: 0.34 })
      .add(() => setMode(nextMode))
      .set(root, { attr: { 'data-mode': nextMode } })
      .to(window, { scrollTo: { y: 0, autoKill: false }, duration: 0.55, ease: 'power3.out' }, '<')
      .fromTo([contentNode, visualNode], { y: 22, opacity: 0, filter: 'blur(18px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.66, stagger: 0.04 })
      .fromTo('.ai-feature-card', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.56, stagger: 0.06 }, '-=0.32')
      .call(() => ScrollTrigger.refresh());
  }

  return (
    <div ref={rootRef} className="ai-page" data-mode={mode}>
      <div className="ai-page__backdrop" aria-hidden="true" />
      <header className="ai-nav">
        <Link className="ai-nav__brand" href="/" aria-label="Back to DLavie home">
          <SvgIcon name="brand" />
          <span>DLAVIE</span>
        </Link>
        <nav aria-label="DLavie AI navigation">
          <Link href="/account/dashboard">Account</Link>
          <Link href="/faq">FAQ</Link>
          <button type="button" onClick={() => switchMode(alternateMode)}>{CONTENT[alternateMode].eyebrow}</button>
        </nav>
      </header>

      <main className="ai-main">
        <section className="ai-hero" aria-labelledby="ai-title">
          <div ref={contentRef} className="ai-hero__content">
            <p className="ai-hero__eyebrow">{content.eyebrow}</p>
            <h1 id="ai-title">{content.title}</h1>
            <p className="ai-hero__copy">{content.description}</p>
            <div className="ai-hero__actions">
              <Link href="/account/register">{content.cta}</Link>
              <button type="button" onClick={() => switchMode(alternateMode)}>{content.secondary}</button>
            </div>
          </div>

          <div ref={visualRef} className="ai-visual" aria-label={`${content.eyebrow} system visual`}>
            <div className="ai-visual__shell">
              <div className="ai-visual__core">
                <span>{content.label}</span>
                <strong>{content.eyebrow}</strong>
              </div>
              {content.orbits.map((orbit, index) => (
                <span className="ai-visual__node" data-index={index} key={orbit}>{orbit}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="ai-metrics" aria-label="DLavie AI metrics">
          {content.metrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className="ai-feature-grid" aria-label={`${content.eyebrow} features`}>
          {content.features.map((feature, index) => (
            <article className="ai-feature-card" key={feature.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="ai-switch-panel" aria-label="Switch DLavie intelligence mode">
          <p>One intelligence surface, two execution levels.</p>
          <div>
            <button type="button" aria-pressed={mode === 'ai'} onClick={() => switchMode('ai')}>DLavie AI</button>
            <button type="button" aria-pressed={mode === 'agent'} onClick={() => switchMode('agent')}>DLavieOS Agent</button>
          </div>
        </section>
      </main>
    </div>
  );
}
