import { motionTokens } from './motion-tokens';
import { gsap, registerDlavieGsap, ScrollTrigger } from './gsap-registry';

export function createReveal(root: Element | Document = document) {
  registerDlavieGsap();
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-motion="reveal"]', root).forEach((element) => {
      const delay = Number(element.dataset.delay ?? 0);
      const y = Number(element.dataset.y ?? 34);
      gsap.fromTo(
        element,
        { autoAlpha: 0, y, filter: 'blur(10px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: motionTokens.duration.slow,
          delay,
          ease: motionTokens.ease.premium,
          scrollTrigger: { trigger: element, start: 'top 84%', once: true },
        },
      );
    });
  });
  return () => ctx.revert();
}

export function createParallax(root: Element | Document = document) {
  registerDlavieGsap();
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-motion="parallax"]', root).forEach((element) => {
      const speed = Number(element.dataset.speed ?? motionTokens.parallax.medium);
      gsap.to(element, {
        yPercent: -22 * speed,
        ease: 'none',
        scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });
  return () => ctx.revert();
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}
