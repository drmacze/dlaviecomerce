import type Lenis from 'lenis';
import { gsap, registerDlavieGsap, ScrollTrigger } from './gsap-registry';

export function syncLenisWithScrollTrigger(lenis: Lenis) {
  registerDlavieGsap();

  const updateScrollTrigger = () => ScrollTrigger.update();
  const tick = (time: number) => lenis.raf(time * 1000);

  lenis.on('scroll', updateScrollTrigger);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();

  return () => {
    lenis.off('scroll', updateScrollTrigger);
    gsap.ticker.remove(tick);
  };
}

export function scrollToTarget(target: string | number | Element, offset = 0) {
  registerDlavieGsap();
  gsap.to(window, {
    scrollTo: { y: target, offsetY: offset, autoKill: true },
    duration: 0.9,
    ease: 'dlaviePremium',
  });
}
