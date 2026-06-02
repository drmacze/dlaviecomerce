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

  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = new Lenis({
    lerp: 0.085,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.96,
    touchMultiplier: 1.08,
    syncTouch: false,
    autoRaf: false,
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
