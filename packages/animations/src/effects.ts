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
        {
          autoAlpha: 0,
          y,
          scale: 0.985,
          clipPath: 'inset(0 0 18% 0 round 1rem)',
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clipPath: 'inset(0 0 0% 0 round 1rem)',
          duration: motionTokens.duration.slow,
          delay,
          ease: motionTokens.ease.premium,
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            end: 'top 42%',
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
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
        yPercent: -26 * speed,
        scale: 1 + speed * 0.025,
        ease: 'none',
        scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      });
    });
  });
  return () => ctx.revert();
}

export function createDepthCards(root: Element | Document = document) {
  registerDlavieGsap();
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-motion="depth-card"]', root).forEach((element, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const depth = Number(element.dataset.depth ?? 1);
      gsap.fromTo(
        element,
        {
          autoAlpha: 0.52,
          y: 78 * depth,
          x: side * 30,
          scale: 0.9,
          rotateX: 10,
          rotateY: side * -7,
          skewY: side * 0.6,
          clipPath: 'inset(10% 6% 10% 6% round 1.65rem)',
        },
        {
          autoAlpha: 1,
          y: -14,
          x: side * -8,
          scale: 1,
          rotateX: -1.25,
          rotateY: side * 2.2,
          skewY: 0,
          clipPath: 'inset(0% 0% 0% 0% round 1.65rem)',
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top 97%',
            end: 'bottom 20%',
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  });
  return () => ctx.revert();
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}
