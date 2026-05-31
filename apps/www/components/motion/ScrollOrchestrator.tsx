'use client';

import { createParallax, createReveal, gsap, Observer, registerDlavieGsap, ScrollTrigger, syncLenisWithScrollTrigger } from '@dlavie/animations';
import { useLenis } from 'lenis/react';
import { useEffect } from 'react';

export function ScrollOrchestrator() {
  const lenis = useLenis();

  useEffect(() => {
    registerDlavieGsap();
  }, []);

  useEffect(() => {
    if (!lenis) return;
    return syncLenisWithScrollTrigger(lenis);
  }, [lenis]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const cleanupReveal = createReveal(document);
    const cleanupParallax = createParallax(document);
    const observer = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      tolerance: 12,
      onChangeY: (self) => {
        document.documentElement.style.setProperty('--dlv-scroll-energy', String(Math.min(1, Math.abs(self.velocityY) / 2600)));
      },
      onStop: () => document.documentElement.style.setProperty('--dlv-scroll-energy', '0'),
    });

    const ctx = gsap.context(() => {
      gsap.fromTo('.dlv-top-nav', { y: -22, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: 'dlaviePremium', delay: 0.12 });
      gsap.to('.dlv-marquee-track', {
        xPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '.dlv-marquee', start: 'top bottom', end: 'bottom top', scrub: 0.65 },
      });
      gsap.to('.dlv-top-nav', {
        '--nav-compact': 1,
        scrollTrigger: { trigger: '.dlv-hero', start: '18% top', end: 'bottom top', scrub: true },
      });
      ScrollTrigger.batch('.dlv-ecosystem-card', {
        start: 'top 82%',
        once: true,
        onEnter: (batch) => gsap.fromTo(batch, { autoAlpha: 0, y: 44, rotateX: -8 }, { autoAlpha: 1, y: 0, rotateX: 0, stagger: 0.11, duration: 0.9, ease: 'dlaviePremium' }),
      });
    });

    return () => {
      ctx.revert();
      observer.kill();
      cleanupReveal();
      cleanupParallax();
    };
  }, []);

  return null;
}
