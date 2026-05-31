'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { ReactNode } from 'react';
import { useRef } from 'react';

export function HeroReveal({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set('.dlv-hero-card, .dlv-eyebrow, .dlv-title, .dlv-copy, .dlv-actions, .dlv-side-rail', {
          autoAlpha: 1,
          y: 0,
        });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .from('.dlv-hero-card', { autoAlpha: 0, y: 32, scale: 0.985, duration: 0.9 })
        .from('.dlv-eyebrow, .dlv-title, .dlv-copy, .dlv-actions', { autoAlpha: 0, y: 22, duration: 0.72, stagger: 0.08 }, '-=0.45')
        .from('.dlv-side-rail', { autoAlpha: 0, x: 18, duration: 0.65 }, '-=0.5')
        .from('.dlv-visual-caption', { autoAlpha: 0, y: 16, duration: 0.6 }, '-=0.42');
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
