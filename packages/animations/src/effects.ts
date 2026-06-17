import { motionTokens } from './motion-tokens';
import { gsap, registerDlavieGsap, ScrollTrigger, SplitText } from './gsap-registry';

/* ──────────────────────────────────────────────────────────────────────────
 * createReveal
 * Scrub-based reveal for [data-motion="reveal"] elements.
 * Attributes:
 *   data-delay="0.2"   — stagger delay (seconds)
 *   data-y="34"        — initial Y offset (px)
 * ────────────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────────────
 * createParallax
 * Vertical parallax for [data-motion="parallax"] elements.
 * Attributes:
 *   data-speed="0.32"  — parallax speed multiplier (0–1)
 * ────────────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────────────
 * createDepthCards
 * 3D card depth entrance for [data-motion="depth-card"] elements.
 * Attributes:
 *   data-depth="1"     — depth intensity multiplier
 * ────────────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────────────
 * createSplitReveal
 * Word-by-word cinematic text reveal for [data-motion="split-reveal"] elements.
 * Uses GSAP SplitText. Each word flies up from below with perspective.
 * Attributes:
 *   data-stagger="0.045" — word stagger seconds
 * ────────────────────────────────────────────────────────────────────────── */
export function createSplitReveal(root: Element | Document = document) {
  registerDlavieGsap();
  const splits: ReturnType<typeof SplitText.prototype.revert>[] = [];

  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-motion="split-reveal"]', root).forEach((el) => {
      const stagger = Number(el.dataset.stagger ?? motionTokens.stagger.base);
      const split = new SplitText(el, { type: 'lines,words', linesClass: 'dlv-line' });
      splits.push(() => split.revert());

      gsap.fromTo(
        split.words,
        { autoAlpha: 0, y: '105%', rotateX: -24, transformOrigin: '50% 0%' },
        {
          autoAlpha: 1,
          y: '0%',
          rotateX: 0,
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.premium,
          stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 84%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => split.revert(),
        },
      );
    });
  });

  return () => {
    splits.forEach((fn) => fn());
    ctx.revert();
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * createHorizontalShowcase
 * Horizontally scrolling pinned section for .dlv-h-showcase containers.
 * Children: .dlv-h-panel elements (each 100vw wide).
 * ────────────────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────────────────
 * refreshMotion
 * Call after dynamic content changes to recalculate ScrollTrigger bounds.
 * ────────────────────────────────────────────────────────────────────────── */
export function refreshMotion() {
  ScrollTrigger.refresh();
}
