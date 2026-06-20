'use client';

import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, Observer);

export function ScrollOrchestrator() {
  const lenis = useLenis();

  /* ── 1. Sync Lenis ↔ GSAP ticker ───────────────────────────────────── */
  useEffect(() => {
    const currentLenis = lenis;
    if (!currentLenis) return;

    function onTick(time: number) {
      currentLenis?.raf(time * 1000);
    }

    const handleScroll = () => ScrollTrigger.update();

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Tell ScrollTrigger to use Lenis scroll position.
    currentLenis.on('scroll', handleScroll);

    // Refresh ScrollTrigger once Lenis has measured the page.
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      gsap.ticker.remove(onTick);
      currentLenis.off('scroll', handleScroll);
      clearTimeout(id);
    };
  }, [lenis]);

  /* ── 2. Cinematic animations (runs once, after mount) ───────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Abort on reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Wait one frame so DOM is fully painted
    const raf = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {

        /* ── Set initial hidden states BEFORE animating ── */
        gsap.set('.dlavie-home__eyebrow',   { autoAlpha: 0, y: 20 });
        gsap.set('.dlavie-home__title',     { autoAlpha: 0, y: 52, skewY: 5 });
        gsap.set('.dlavie-home__subtitle',  { autoAlpha: 0, y: 28 });
        gsap.set('.dlavie-home__description', { autoAlpha: 0, y: 20 });
        gsap.set('.dlavie-home__actions',   { autoAlpha: 0, y: 16 });
        gsap.set('.dlavie-home__meta',      { autoAlpha: 0 });
        gsap.set('.dlv-top-nav',            { autoAlpha: 0, y: -24 });

        /* ── Hero sequence (timeline) ── */
        const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });

        hero
          .to('.dlv-top-nav',              { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
          .to('.dlavie-home__eyebrow',     { autoAlpha: 1, y: 0, duration: 0.65 }, 0.15)
          .to('.dlavie-home__title',       { autoAlpha: 1, y: 0, skewY: 0, duration: 1.0, ease: 'power4.out' }, 0.28)
          .to('.dlavie-home__subtitle',    { autoAlpha: 1, y: 0, duration: 0.75 }, 0.52)
          .to('.dlavie-home__description', { autoAlpha: 1, y: 0, duration: 0.65 }, 0.64)
          .to('.dlavie-home__actions',     { autoAlpha: 1, y: 0, duration: 0.6  }, 0.74)
          .to('.dlavie-home__meta',        { autoAlpha: 1, duration: 0.5 }, 0.88);

        /* ── Hero parallax (card pushes back on scroll) ── */
        gsap.to('.dlv-hero-card', {
          yPercent: -10,
          scale: 0.96,
          ease: 'none',
          scrollTrigger: {
            trigger: '.dlv-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });

        /* ── Section headings ── */
        gsap.utils.toArray<HTMLElement>('.dlavie-home__section-heading').forEach((el) => {
          gsap.set(el, { autoAlpha: 0, y: 44 });
          gsap.to(el, {
            autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: {
              trigger: el, start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        /* ── Eyebrows (scroll sections) ── */
        gsap.utils.toArray<HTMLElement>('[data-scroll-section] .dlavie-home__eyebrow').forEach((el) => {
          gsap.set(el, { autoAlpha: 0, y: 16 });
          gsap.to(el, {
            autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: {
              trigger: el, start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        /* ── Section copy ── */
        gsap.utils.toArray<HTMLElement>('.dlavie-home__section-copy').forEach((el) => {
          gsap.set(el, { autoAlpha: 0, y: 22 });
          gsap.to(el, {
            autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out',
            scrollTrigger: {
              trigger: el, start: 'top 91%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        /* ── Cards: staggered float-in ── */
        gsap.utils.toArray<HTMLElement>('.dlavie-home__card').forEach((card, i) => {
          gsap.set(card, { autoAlpha: 0, y: 50, scale: 0.94 });
          gsap.to(card, {
            autoAlpha: 1, y: 0, scale: 1,
            duration: 0.8, ease: 'power3.out',
            delay: (i % 3) * 0.1,
            scrollTrigger: {
              trigger: card, start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        /* ── CTA section ── */
        const cta = document.querySelector('.dlavie-home__section--cta');
        if (cta) {
          gsap.set(cta, { autoAlpha: 0, y: 40 });
          gsap.to(cta, {
            autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: {
              trigger: cta, start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        /* ── Scroll velocity → CSS var ── */
        Observer.create({
          target: window,
          type: 'wheel,touch',
          tolerance: 10,
          onChangeY: (self) => {
            const e = Math.min(1, Math.abs(self.velocityY) / 2000);
            document.documentElement.style.setProperty('--dlv-scroll-energy', e.toFixed(3));
          },
          onStop: () => {
            document.documentElement.style.setProperty('--dlv-scroll-energy', '0');
          },
        });

      });

      // Refresh after all animations are set
      ScrollTrigger.refresh();

      return () => ctx.revert();
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
