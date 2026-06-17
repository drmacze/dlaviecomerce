'use client';

import {
  createDepthCards,
  createParallax,
  createReveal,
  gsap,
  Observer,
  registerDlavieGsap,
  syncLenisWithScrollTrigger,
  ScrollTrigger,
} from '@dlavie/animations';
import { useLenis } from 'lenis/react';
import { useEffect } from 'react';

/**
 * ScrollOrchestrator
 *
 * Drives all cinematic scroll animations via GSAP + Lenis.
 * Responsibilities:
 *  1. Register GSAP plugins
 *  2. Sync Lenis RAF with GSAP ticker
 *  3. Apply global [data-motion] attribute effects (reveal, parallax, depth-card)
 *  4. Orchestrate section-specific cinematic timelines
 *  5. Track scroll velocity as CSS custom property for shader/blur use
 */
export function ScrollOrchestrator() {
  const lenis = useLenis();

  // One-time plugin registration
  useEffect(() => {
    registerDlavieGsap();
  }, []);

  // Lenis <-> GSAP ticker sync
  useEffect(() => {
    if (!lenis) return;
    return syncLenisWithScrollTrigger(lenis);
  }, [lenis]);

  // Main cinematic animation setup
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // ─── Global data-motion effects ───────────────────────────────────────────
    const cleanupReveal       = createReveal(document);
    const cleanupParallax     = createParallax(document);
    const cleanupDepthCards   = createDepthCards(document);

    // ─── Scroll velocity → CSS var (used by shaders & blur) ──────────────────
    const observer = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      tolerance: 10,
      onChangeY: (self) => {
        const energy = Math.min(1, Math.abs(self.velocityY) / 2400);
        document.documentElement.style.setProperty('--dlv-scroll-energy', String(energy));
        document.documentElement.style.setProperty('--dlv-scroll-velocity', String(energy));
      },
      onStop: () => {
        gsap.to(document.documentElement, {
          '--dlv-scroll-energy': 0,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: true,
        });
      },
    });

    // ─── matchMedia breakpoints ───────────────────────────────────────────────
    const mm = gsap.matchMedia();

    // ── Desktop (≥ 781px) ──────────────────────────────────────────────────────
    mm.add('(min-width: 781px)', () => {
      const ctx = gsap.context(() => {

        // Nav entrance
        gsap.fromTo(
          '.dlv-top-nav',
          { y: -28, autoAlpha: 0, scale: 0.97 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 1.1, ease: 'dlaviePremium', delay: 0.12 },
        );

        // Nav compact-on-scroll
        gsap.to('.dlv-top-nav', {
          '--nav-compact': 1,
          '--nav-glow': 1,
          scrollTrigger: {
            trigger: '.dlv-page',
            start: '6% top',
            end: '24% top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // ── Hero card perspective push ─────────────────────────────────────
        gsap.to('.dlv-hero-card', {
          yPercent: -10,
          scale: 0.94,
          rotateX: 5,
          filter: 'blur(2px) brightness(0.88)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.dlv-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });

        // ── Hero title drift up ────────────────────────────────────────────
        gsap.to('.dlv-title', {
          yPercent: -22,
          scale: 0.92,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: '.dlv-hero',
            start: '25% top',
            end: 'bottom top',
            scrub: 1.4,
            invalidateOnRefresh: true,
          },
        });

        // ── Marquee cinematic drift ────────────────────────────────────────
        gsap.to('.dlv-marquee-track', {
          xPercent: -14,
          scale: 1.055,
          ease: 'none',
          scrollTrigger: {
            trigger: '.dlv-marquee',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });

        // ── Section headings SplitText reveal ─────────────────────────────
        // Runs after DOM settles so SplitText finds the elements
        requestAnimationFrame(() => {
          gsap.utils.toArray<HTMLElement>('[data-motion="split-reveal"]').forEach((el) => {
            // Dynamically import SplitText to avoid SSR issues
            import('@dlavie/animations').then(({ SplitText }) => {
              const split = new SplitText(el, { type: 'lines,words', linesClass: 'dlv-line' });
              gsap.fromTo(
                split.words,
                { autoAlpha: 0, y: '110%', rotateX: -28 },
                {
                  autoAlpha: 1,
                  y: '0%',
                  rotateX: 0,
                  duration: 0.9,
                  ease: 'dlaviePremium',
                  stagger: 0.045,
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 82%',
                    toggleActions: 'play none none reverse',
                  },
                  onComplete: () => split.revert(),
                },
              );
            });
          });
        });

        // ── Horizontal pinned showcase (if present) ────────────────────────
        const showcase = document.querySelector<HTMLElement>('.dlv-h-showcase');
        if (showcase) {
          const panels = showcase.querySelectorAll<HTMLElement>('.dlv-h-panel');
          const totalMove = (panels.length - 1) * 100;
          gsap.to(panels, {
            xPercent: -totalMove,
            ease: 'none',
            scrollTrigger: {
              trigger: showcase,
              start: 'top top',
              end: () => `+=${showcase.scrollWidth - window.innerWidth}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        // ── Ecosystem cards staggered depth entrance ───────────────────────
        gsap.utils.toArray<HTMLElement>('.dlv-eco-card').forEach((card, i) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 60, scale: 0.92, rotateY: i % 2 === 0 ? -8 : 8 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 1.0,
              ease: 'dlaviePremium',
              delay: i * 0.08,
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        });

        // ── Background gradient morph on scroll ────────────────────────────
        ScrollTrigger.create({
          trigger: '.dlv-page',
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const p = self.progress;
            const hue1 = 220 + p * 60;   // 220 → 280
            const hue2 = 260 + p * -40;  // 260 → 220
            document.documentElement.style.setProperty('--dlv-bg-hue-1', String(hue1));
            document.documentElement.style.setProperty('--dlv-bg-hue-2', String(hue2));
          },
        });

      });
      return () => ctx.revert();
    });

    // ── Mobile (≤ 780px) ───────────────────────────────────────────────────────
    mm.add('(max-width: 780px)', () => {
      const ctx = gsap.context(() => {

        gsap.fromTo(
          '.dlv-top-nav',
          { y: -20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'dlaviePremium' },
        );

        gsap.to('.dlv-hero-card', {
          yPercent: -5,
          scale: 0.985,
          ease: 'none',
          scrollTrigger: {
            trigger: '.dlv-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
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
