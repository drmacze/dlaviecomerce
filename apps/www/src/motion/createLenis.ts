'use client';

import Lenis from 'lenis';
import { gsap, ScrollTrigger, registerDlavieGsap } from '@dlavie/animations';
import { getPrefersReducedMotion } from './useReducedMotion';

export type LenisController = {
  lenis: Lenis | null;
  destroy: () => void;
};

export function createLenis(): LenisController {
  if (typeof window === 'undefined' || getPrefersReducedMotion()) {
    return { lenis: null, destroy: () => undefined };
  }

  registerDlavieGsap();

  const lenis = new Lenis({
    duration: 1.12,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.15,
    syncTouch: false,
  });

  const onScroll = () => ScrollTrigger.update();
  const tick = (time: number) => lenis.raf(time * 1000);

  lenis.on('scroll', onScroll);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add('has-lenis');

  return {
    lenis,
    destroy: () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.documentElement.classList.remove('has-lenis');
    },
  };
}
