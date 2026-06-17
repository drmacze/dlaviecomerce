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
        { autoAlpha: 0, y, scale: 0.985 },
        {
          autoAlpha: 1, y: 0, scale: 1,
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
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
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
          autoAlpha: 0.52, y: 78 * depth, x: side * 30,
          scale: 0.9, rotateX: 10, rotateY: side * -7, skewY: side * 0.6,
        },
        {
          autoAlpha: 1, y: -14, x: side * -8,
          scale: 1, rotateX: -1.25, rotateY: side * 2.2, skewY: 0,
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

/**
 * createSplitReveal — line-by-line reveal using CSS overflow:hidden clip.
 * No SplitText (Club plugin) required.
 */
export function createSplitReveal(root: Element | Document = document) {
  registerDlavieGsap();
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-motion="split-reveal"]', root).forEach((el) => {
      const stagger = Number(el.dataset.stagger ?? motionTokens.stagger.base);
      // Wrap each word in a clip container manually
      const text = el.textContent ?? '';
      const words = text.trim().split(/\s+/);
      el.innerHTML = words
        .map(w => `<span class="dlv-word-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="dlv-word" style="display:inline-block">${w}</span></span>`)
        .join(' ');

      const wordEls = el.querySelectorAll<HTMLElement>('.dlv-word');
      gsap.fromTo(
        wordEls,
        { autoAlpha: 0, y: '110%', rotateX: -20 },
        {
          autoAlpha: 1, y: '0%', rotateX: 0,
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.premium,
          stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 84%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });
  });
  return () => ctx.revert();
}

export function createHorizontalShowcase(root: Element | Document = document) {
  registerDlavieGsap();
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('.dlv-h-showcase', root).forEach((showcase) => {
      const panels = showcase.querySelectorAll<HTMLElement>('.dlv-h-panel');
      if (panels.length < 2) return;
      gsap.to(panels, {
        xPercent: -(panels.length - 1) * 100,
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
    });
  });
  return () => ctx.revert();
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}
