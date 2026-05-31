'use client';

import { createDepthCards, createParallax, createReveal, gsap, Observer, registerDlavieGsap, syncLenisWithScrollTrigger } from '@dlavie/animations';
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
    const cleanupDepthCards = createDepthCards(document);
    const observer = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      tolerance: 10,
      onChangeY: (self) => {
        const energy = Math.min(1, Math.abs(self.velocityY) / 2400);
        document.documentElement.style.setProperty('--dlv-scroll-energy', String(energy));
        document.documentElement.style.setProperty('--dlv-scroll-velocity', String(energy));
      },
      onStop: () => document.documentElement.style.setProperty('--dlv-scroll-energy', '0'),
    });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 781px)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo('.dlv-top-nav', { y: -24, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: 'dlaviePremium', delay: 0.08 });
        gsap.to('.dlv-marquee-track', {
          xPercent: -12,
          scale: 1.045,
          ease: 'none',
          scrollTrigger: { trigger: '.dlv-marquee', start: 'top bottom', end: 'bottom top', scrub: 0.65, invalidateOnRefresh: true },
        });
        gsap.to('.dlv-top-nav', {
          '--nav-compact': 1,
          '--nav-glow': 1,
          scrollTrigger: { trigger: '.dlv-page', start: '8% top', end: '28% top', scrub: true, invalidateOnRefresh: true },
        });
        gsap.to('.dlv-hero-card', {
          yPercent: -8,
          scale: 0.955,
          rotateX: 4,
          filter: 'blur(1.5px)',
          ease: 'none',
          scrollTrigger: { trigger: '.dlv-hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
        gsap.to('.dlv-title', {
          yPercent: -18,
          scale: 0.94,
          opacity: 0.58,
          ease: 'none',
          scrollTrigger: { trigger: '.dlv-hero', start: '28% top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
      });
      return () => ctx.revert();
    });

    mm.add('(max-width: 780px)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo('.dlv-top-nav', { y: -20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75, ease: 'dlaviePremium' });
        gsap.to('.dlv-hero-card', {
          yPercent: -4,
          scale: 0.982,
          ease: 'none',
          scrollTrigger: { trigger: '.dlv-hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
      });
      return () => ctx.revert();
    });

    return () => {
      mm.revert();
      observer.kill();
      cleanupReveal();
      cleanupParallax();
      cleanupDepthCards();
    };
  }, []);

  return null;
}
