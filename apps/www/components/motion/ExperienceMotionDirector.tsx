'use client';

import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function addCardTilt(card: HTMLElement): () => void {
  const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.35, ease: 'power3.out' });
  const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.35, ease: 'power3.out' });
  const translateY = gsap.quickTo(card, 'y', { duration: 0.35, ease: 'power3.out' });

  const handleMove = (event: PointerEvent) => {
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateX(y * -4);
    rotateY(x * 5);
    translateY(-5);
  };

  const handleLeave = () => {
    rotateX(0);
    rotateY(0);
    translateY(0);
  };

  card.addEventListener('pointermove', handleMove);
  card.addEventListener('pointerleave', handleLeave);

  return () => {
    card.removeEventListener('pointermove', handleMove);
    card.removeEventListener('pointerleave', handleLeave);
  };
}

export function ExperienceMotionDirector() {
  const pathname = usePathname();

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const cleanups: Array<() => void> = [];

      if (reducedMotion) {
        gsap.set(
          [
            '.commerce-header',
            '.commerce-hero__content > *',
            '.commerce-hero__principles > div',
            '.commerce-catalog__heading',
            '.commerce-search',
            '.commerce-category-nav',
            '.commerce-product-card',
            '.commerce-empty',
            '.account-card',
            '.account-panel > *',
            '.account-visual__brand-stage',
          ],
          { clearProps: 'all' },
        );
        return;
      }

      if (document.querySelector('.commerce-page')) {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

        intro
          .from('.commerce-header', { autoAlpha: 0, y: -18, duration: 0.65 })
          .from(
            '.commerce-hero__content > *',
            { autoAlpha: 0, y: 34, duration: 0.75, stagger: 0.09 },
            '-=0.25',
          )
          .from(
            '.commerce-hero__principles > div',
            { autoAlpha: 0, x: 22, duration: 0.6, stagger: 0.08 },
            '-=0.45',
          );

        gsap.from('.commerce-catalog__heading', {
          autoAlpha: 0,
          y: 32,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.commerce-catalog__heading',
            start: 'top 88%',
            once: true,
          },
        });

        gsap.from('.commerce-search', {
          autoAlpha: 0,
          y: 22,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.commerce-search',
            start: 'top 90%',
            once: true,
          },
        });

        gsap.from('.commerce-category-nav', {
          autoAlpha: 0,
          x: -24,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.commerce-catalog-layout',
            start: 'top 88%',
            once: true,
          },
        });

        gsap.utils.toArray<HTMLElement>('.commerce-product-card').forEach((card, index) => {
          gsap.set(card, { transformPerspective: 1000, transformStyle: 'preserve-3d' });
          gsap.from(card, {
            autoAlpha: 0,
            y: 44,
            scale: 0.97,
            duration: 0.72,
            delay: (index % 3) * 0.07,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              once: true,
            },
          });

          if (hoverCapable) cleanups.push(addCardTilt(card));
        });

        gsap.from('.commerce-empty, .commerce-service-state', {
          autoAlpha: 0,
          y: 28,
          duration: 0.75,
          ease: 'power3.out',
        });

        gsap.to('.commerce-hero__content', {
          yPercent: -7,
          ease: 'none',
          scrollTrigger: {
            trigger: '.commerce-hero',
            start: 'top top+=100',
            end: 'bottom top',
            scrub: 1.1,
          },
        });
      }

      if (document.querySelector('.account-shell')) {
        const accountIntro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        accountIntro
          .from('.account-card, .account-dashboard', {
            autoAlpha: 0,
            y: 24,
            scale: 0.985,
            duration: 0.75,
          })
          .from(
            '.account-visual__brand-stage',
            { autoAlpha: 0, scale: 0.9, duration: 0.8 },
            '-=0.4',
          )
          .from(
            '.account-panel > *',
            { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.055 },
            '-=0.45',
          );
      }

      const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);

      return () => {
        window.clearTimeout(refreshTimer);
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
