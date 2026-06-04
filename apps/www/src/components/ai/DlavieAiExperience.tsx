'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, registerDlavieGsap, ScrollTrigger } from '@dlavie/animations';
import { createLenis } from '../../motion/createLenis';
import { AiFaq } from './AiFaq';
import { AiFeatureGrid } from './AiFeatureGrid';
import { AiFinalCta } from './AiFinalCta';
import { AiHero } from './AiHero';
import { AiPricing } from './AiPricing';
import { AiShaderBackdrop } from './AiShaderBackdrop';
import { accessPlans, connectors, faqItems, insights, modeContent, useCases, type AiMode } from './aiContent';

export function DlavieAiExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const modePanelRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AiMode>('ai');

  const content = modeContent[mode];
  const modes = useMemo(() => [modeContent.ai, modeContent.agent], []);

  useEffect(() => {
    registerDlavieGsap();
    const lenis = createLenis();
    const root = rootRef.current;
    if (!root) return () => lenis.destroy();

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) return () => lenis.destroy();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-ai-intro]',
        { y: 32, opacity: 0, filter: 'blur(16px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.08, ease: 'power3.out' },
      );

      gsap.utils.toArray<HTMLElement>('[data-ai-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 42, opacity: 0, filter: 'blur(14px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 84%',
            },
          },
        );
      });

      gsap.to('[data-ai-parallax="slow"]', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
        },
      });

      gsap.fromTo(
        '[data-ai-final]',
        { scale: 0.96, opacity: 0.2 },
        {
          scale: 1,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '[data-ai-final]',
            start: 'top 82%',
            end: 'top 48%',
            scrub: 0.6,
          },
        },
      );

      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!modePanelRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    gsap.fromTo(
      modePanelRef.current,
      { opacity: 0.72, y: 12, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.46, ease: 'power3.out' },
    );
  }, [mode]);

  return (
    <main ref={rootRef} className={`dlavie-ai dlavie-ai--${mode}`}>
      <AiShaderBackdrop />
      <div className="dlavie-ai__noise" aria-hidden="true" />
      <div className="dlavie-ai__orbital" data-ai-parallax="slow" aria-hidden="true" />

      <AiHero mode={mode} modes={modes} content={content} onModeChange={setMode} />

      <section className="dlavie-ai__section ai-connectors" aria-labelledby="ai-connectors-title">
        <div className="dlavie-ai__section-heading" data-ai-reveal>
          <p className="dlavie-ai__eyebrow">Ecosystem connector rail</p>
          <h2 id="ai-connectors-title">One intelligence layer across account, commerce, and operations.</h2>
          <span>DLavie AI is designed to become the shared command layer for customer intent and operator action.</span>
        </div>
        <div className="ai-connectors__rail" data-ai-reveal>
          {connectors.map((connector) => (
            <article key={connector.name}>
              <span>{connector.state}</span>
              <h3>{connector.name}</h3>
              <p>{connector.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="modes" className="dlavie-ai__section ai-mode-story" aria-labelledby="ai-mode-title">
        <div ref={modePanelRef} className="ai-mode-story__panel" data-ai-reveal>
          <p className="dlavie-ai__eyebrow">Live mode switch</p>
          <h2 id="ai-mode-title">{content.label}: {mode === 'ai' ? 'conversation, support, search, and guidance.' : 'workflows, actions, tools, and automation.'}</h2>
          <p>{content.subcopy}</p>
          <div className="ai-mode-story__chips" aria-label={`${content.label} focus areas`}>
            {(mode === 'ai'
              ? ['Support', 'Writing', 'Search', 'Product guidance', 'Customer intent']
              : ['Workflows', 'Actions', 'Tools', 'PPOB operations', 'Dashboard automation']
            ).map((chip) => <span key={chip}>{chip}</span>)}
          </div>
        </div>
      </section>

      <AiFeatureGrid content={content} />

      <section className="dlavie-ai__section ai-use-cases" aria-labelledby="ai-use-cases-title">
        <div className="dlavie-ai__section-heading" data-ai-reveal>
          <p className="dlavie-ai__eyebrow">Business use cases</p>
          <h2 id="ai-use-cases-title">Built for the daily pressure of a real ecosystem.</h2>
          <span>Not a generic chatbot page: this is the operating front door for DLavie support, commerce, and product work.</span>
        </div>
        <div className="ai-use-cases__grid">
          {useCases.map((useCase) => (
            <article key={useCase.title} data-ai-reveal>
              <span>{useCase.signal}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dlavie-ai__section ai-thinking-demo" aria-labelledby="ai-thinking-title">
        <div className="ai-thinking-demo__copy" data-ai-reveal>
          <p className="dlavie-ai__eyebrow">Thinking demonstration</p>
          <h2 id="ai-thinking-title">The interface shows what the AI is doing before it answers.</h2>
          <p>Reading context, planning response, checking account access, and preparing a safe answer are visible states—not hidden magic.</p>
        </div>
        <div className="ai-thinking-demo__card" data-ai-reveal aria-hidden="true">
          <span />
          <span />
          <span />
          <strong>Context → Plan → Access → Answer</strong>
        </div>
      </section>

      <AiPricing plans={accessPlans} />

      <section className="dlavie-ai__section ai-insights" aria-labelledby="ai-insights-title">
        <div className="dlavie-ai__section-heading" data-ai-reveal>
          <p className="dlavie-ai__eyebrow">Insights and roadmap</p>
          <h2 id="ai-insights-title">A premium AI page with a credible path to product depth.</h2>
        </div>
        <div className="ai-insights__grid">
          {insights.map((insight) => (
            <article key={insight.title} data-ai-reveal>
              <strong>{insight.metric}</strong>
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
            </article>
          ))}
        </div>
      </section>

      <AiFaq items={faqItems} />
      <AiFinalCta />
    </main>
  );
}
