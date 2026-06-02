'use client';

import { gsap, registerDlavieGsap, ScrollTrigger } from '@dlavie/animations';
import { getPrefersReducedMotion } from './useReducedMotion';

export function createScrollScenes(root: HTMLElement) {
  registerDlavieGsap();

  const reducedMotion = getPrefersReducedMotion();
  const cleanups: Array<() => void> = [];
  const ctx = gsap.context(() => {
    const setProgress = (value: number) => {
      document.documentElement.style.setProperty('--section-progress', value.toFixed(4));
      window.dispatchEvent(new CustomEvent('dlavie:section-progress', { detail: { progress: value } }));
    };

    gsap.utils.toArray<HTMLElement>('[data-scene-theme]').forEach((scene, index) => {
      ScrollTrigger.create({
        trigger: scene,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => document.documentElement.setAttribute('data-theme', scene.dataset.sceneTheme ?? 'dlavie'),
        onEnterBack: () => document.documentElement.setAttribute('data-theme', scene.dataset.sceneTheme ?? 'dlavie'),
        onUpdate: (self) => {
          document.documentElement.style.setProperty('--active-scene', String(index));
          if (self.isActive) setProgress(self.progress);
        },
      });
    });

    if (reducedMotion) {
      gsap.set('[data-reveal]', { autoAlpha: 1, y: 0, filter: 'none' });
      return;
    }

    gsap.timeline({
      scrollTrigger: {
        trigger: '.scene-hero',
        start: 'top top',
        end: '+=165%',
        scrub: 0.9,
        pin: '.hero-pin',
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
      .fromTo('.hero-wordmark', { clipPath: 'inset(0 100% 0 0)', scale: 1.06, filter: 'blur(14px)' }, { clipPath: 'inset(0 0% 0 0)', scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'none' }, 0)
      .to('.hero-wordmark', { scale: 1.22, yPercent: -9, letterSpacing: '-0.14em', duration: 0.75, ease: 'none' }, 0.38)
      .to('.hero-copy', { yPercent: -22, autoAlpha: 0.28, filter: 'blur(8px)', duration: 0.44, ease: 'none' }, 0.72)
      .to('.hero-mask', { scale: 2.8, opacity: 0.1, duration: 0.72, ease: 'none' }, 0.52);

    gsap.utils.toArray<HTMLElement>('.identity-line').forEach((line, index) => {
      gsap.fromTo(line, { '--line-fill': '0%', y: 44 }, {
        '--line-fill': '100%',
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: line,
          start: 'top 86%',
          end: 'bottom 42%',
          scrub: 0.65,
        },
      });
      gsap.to(line, {
        xPercent: index % 2 === 0 ? -5 : 5,
        ease: 'none',
        scrollTrigger: { trigger: '.scene-identity', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: '.scene-portal',
        start: 'top top',
        end: '+=210%',
        scrub: 0.85,
        pin: '.portal-pin',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => document.documentElement.style.setProperty('--portal-progress', self.progress.toFixed(4)),
      },
    })
      .fromTo('.portal-tunnel', { scale: 0.72, rotate: -8, borderRadius: '42%' }, { scale: 6.3, rotate: 20, borderRadius: '8%', duration: 1, ease: 'none' }, 0)
      .to('.portal-core', { scale: 10.5, opacity: 0.95, duration: 1, ease: 'none' }, 0.1)
      .to('.portal-copy', { autoAlpha: 0, yPercent: -34, filter: 'blur(10px)', duration: 0.5, ease: 'none' }, 0.45)
      .to('.portal-os-label', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.36, ease: 'none' }, 0.68);

    gsap.timeline({
      scrollTrigger: {
        trigger: '.scene-os',
        start: 'top top',
        end: '+=210%',
        scrub: 0.7,
        pin: '.os-pin',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => document.documentElement.style.setProperty('--os-progress', self.progress.toFixed(4)),
      },
    })
      .fromTo('.os-copy', { y: 80, autoAlpha: 0.3 }, { y: 0, autoAlpha: 1, duration: 0.22, ease: 'none' }, 0)
      .to('.curved-loop-track', { xPercent: -34, duration: 1, ease: 'none' }, 0)
      .to('.agent-node', { scale: 1.18, autoAlpha: 1, stagger: 0.08, duration: 0.42, ease: 'none' }, 0.12)
      .to('.agent-link', { strokeDashoffset: 0, stagger: 0.06, duration: 0.6, ease: 'none' }, 0.16)
      .to('.os-feature', { x: 0, autoAlpha: 1, stagger: 0.07, duration: 0.42, ease: 'none' }, 0.24)
      .to('.agent-topology', { rotate: 2, scale: 1.08, duration: 0.7, ease: 'none' }, 0.28);

    gsap.timeline({
      scrollTrigger: {
        trigger: '.scene-commerce',
        start: 'top top',
        end: '+=205%',
        scrub: 0.7,
        pin: '.commerce-pin',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => document.documentElement.style.setProperty('--commerce-progress', self.progress.toFixed(4)),
      },
    })
      .fromTo('.commerce-copy', { y: 70, autoAlpha: 0.25 }, { y: 0, autoAlpha: 1, duration: 0.26, ease: 'none' }, 0)
      .to('.commerce-path', { strokeDashoffset: 0, stagger: 0.055, duration: 0.82, ease: 'none' }, 0.08)
      .to('.commerce-pulse', { offsetDistance: '100%', stagger: 0.06, duration: 0.88, ease: 'none' }, 0.12)
      .to('.commerce-counter strong', { textContent: 23840, snap: { textContent: 1 }, duration: 0.8, ease: 'none' }, 0.18)
      .to('.commerce-feature', { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.42, ease: 'none' }, 0.24);

    gsap.timeline({
      scrollTrigger: {
        trigger: '.scene-automation',
        start: 'top 62%',
        end: 'bottom 38%',
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: (self) => document.documentElement.style.setProperty('--automation-progress', self.progress.toFixed(4)),
      },
    })
      .to('.orbit-progress', { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
      .to('.automation-step', { autoAlpha: 1, y: 0, stagger: 0.09, duration: 0.46, ease: 'none' }, 0.08)
      .to('.orbit-satellite', { rotate: 250, transformOrigin: '50% 50%', duration: 1, ease: 'none' }, 0);

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((item) => {
      gsap.fromTo(item, { autoAlpha: 0, y: 54, filter: 'blur(12px)' }, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'dlaviePremium',
        scrollTrigger: { trigger: item, start: 'top 86%', once: true },
      });
    });
  }, root);

  const resize = () => ScrollTrigger.refresh();
  window.addEventListener('resize', resize);
  cleanups.push(() => window.removeEventListener('resize', resize));
  cleanups.push(() => ctx.revert());

  return () => cleanups.forEach((cleanup) => cleanup());
}
