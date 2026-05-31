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
          scrollTrigger: { trigger: element, start: 'top 84%', toggleActions: 'play none none reverse' },
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
      gsap.fromTo(
        element,
        {
          autoAlpha: 0.34,
          y: 88,
          x: side * 26,
          scale: 0.88,
          rotateX: 12,
          rotateY: side * -8,
          filter: 'blur(10px)',
          clipPath: 'inset(12% 8% 12% 8% round 1.65rem)',
        },
        {
          autoAlpha: 1,
          y: -18,
          x: side * -10,
          scale: 1,
          rotateX: -2,
          rotateY: side * 3,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0% round 1.65rem)',
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top 96%',
            end: 'bottom 18%',
            scrub: 0.8,
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
