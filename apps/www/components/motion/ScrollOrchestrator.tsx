'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, Observer);

export function ScrollOrchestrator() {
  const lenis = useLenis();

  // Sync Lenis → GSAP ticker
  useEffect(() => {
    if (!lenis) return;

    // Drive Lenis via GSAP ticker so they share one RAF loop
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Feed Lenis scroll pos into ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, [lenis]);

  // Cinematic animations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {

      // ── Nav: slide in from top ──────────────────────────────────────────
      gsap.fromTo('.dlv-top-nav',
        { y: -32, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.0, ease: 'power3.out', delay: 0.1 },
      );

      // ── Nav: compact on scroll ──────────────────────────────────────────
      ScrollTrigger.create({
        trigger: '.dlv-page',
        start: '80px top',
        onEnter:  () => document.querySelector('.dlv-top-nav')?.classList.add('dlv-top-nav--compact'),
        onLeaveBack: () => document.querySelector('.dlv-top-nav')?.classList.remove('dlv-top-nav--compact'),
      });

      // ── Hero title: reveal word by word (CSS clip trick, no SplitText) ─
      gsap.fromTo('.dlavie-home__title',
        { autoAlpha: 0, y: 48, skewY: 4 },
        { autoAlpha: 1, y: 0, skewY: 0, duration: 1.1, ease: 'power4.out', delay: 0.2 },
      );

      // ── Hero eyebrow ────────────────────────────────────────────────────
      gsap.fromTo('.dlavie-home__eyebrow',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.08 },
      );

      // ── Hero subtitle + description ─────────────────────────────────────
      gsap.fromTo('.dlavie-home__subtitle, .dlavie-home__description',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.35, stagger: 0.12 },
      );

      // ── Hero CTA buttons ────────────────────────────────────────────────
      gsap.fromTo('.dlavie-home__actions',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.55 },
      );

      // ── Hero card: push back on scroll (parallax) ───────────────────────
      gsap.to('.dlv-hero-card', {
        yPercent: -12,
        scale: 0.95,
        ease: 'none',
        scrollTrigger: {
          trigger: '.dlv-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      // ── Section headings: reveal on scroll ─────────────────────────────
      gsap.utils.toArray<HTMLElement>('.dlavie-home__section-heading').forEach((el) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1, y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      // ── Section eyebrows + copy: reveal ────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.dlavie-home__section-copy, .dlavie-home__eyebrow').forEach((el, i) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1, y: 0,
            duration: 0.75,
            ease: 'power2.out',
            delay: 0.1,
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      // ── Cards: 3D depth entrance on scroll ─────────────────────────────
      gsap.utils.toArray<HTMLElement>('.dlavie-home__card').forEach((card, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(card,
          { autoAlpha: 0, y: 60, rotateY: dir * 6, scale: 0.93 },
          {
            autoAlpha: 1, y: 0, rotateY: 0, scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            delay: (i % 3) * 0.08,
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      // ── CTA section: scale up entrance ─────────────────────────────────
      gsap.fromTo('.dlavie-home__section--cta',
        { autoAlpha: 0, scale: 0.97 },
        {
          autoAlpha: 1, scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.dlavie-home__section--cta',
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // ── Scroll velocity → CSS var ───────────────────────────────────────
      Observer.create({
        target: window,
        type: 'wheel,touch',
        tolerance: 10,
        onChangeY: (self) => {
          const energy = Math.min(1, Math.abs(self.velocityY) / 2000);
          document.documentElement.style.setProperty('--dlv-scroll-energy', String(energy.toFixed(3)));
        },
        onStop: () => {
          gsap.to(document.documentElement, {
            '--dlv-scroll-energy': 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true,
          });
        },
      });

    });

    return () => ctx.revert();
  }, []);

  return null;
}
