'use client';

import { gsap, registerDlavieGsap } from '@dlavie/animations';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

export function HeroReveal({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerDlavieGsap();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compact = window.matchMedia('(max-width: 780px)').matches;

    if (prefersReducedMotion || compact) {
      gsap.set('.dlv-hero-card, .dlv-eyebrow, .dlv-title, .dlv-copy, .dlv-actions, .dlv-side-rail, .dlv-visual-caption', { autoAlpha: 1, y: 0, clearProps: 'filter' });
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'dlaviePremium' } });
      timeline
        .from('.dlv-hero-card', { autoAlpha: 0, y: 42, scale: 0.975, duration: 0.85 })
        .from('.dlv-eyebrow', { autoAlpha: 0, y: 18, duration: 0.5 }, '-=0.48')
        .from('.dlv-copy, .dlv-actions, .dlv-scroll-hint', { autoAlpha: 0, y: 22, duration: 0.58, stagger: 0.06 }, '-=0.24')
        .from('.dlv-side-rail', { autoAlpha: 0, x: 18, duration: 0.55 }, '-=0.44')
        .from('.dlv-visual-caption', { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.34');
    }, scope);

    return () => ctx.revert();
  }, []);

  return <div ref={scope}>{children}</div>;
}
