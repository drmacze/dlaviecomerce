import type Lenis from 'lenis';
import { gsap, registerDlavieGsap, ScrollTrigger } from './gsap-registry';

export type DlavieScrollState = {
  progress: number;
  direction: 1 | -1;
  velocity: number;
  normalizedVelocity: number;
  activeSectionIndex: number;
  reducedMotion: boolean;
};

const defaultState: DlavieScrollState = {
  progress: 0,
  direction: 1,
  velocity: 0,
  normalizedVelocity: 0,
  activeSectionIndex: 0,
  reducedMotion: false,
};

let currentState: DlavieScrollState = defaultState;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getScrollLimit() {
  if (typeof document === 'undefined') return 1;
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

export function getDlavieScrollState() {
  return currentState;
}

export function setDlavieScrollState(update: Partial<DlavieScrollState>) {
  currentState = { ...currentState, ...update };

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--dlv-scroll-progress', currentState.progress.toFixed(4));
    root.style.setProperty('--dlv-scroll-velocity', currentState.normalizedVelocity.toFixed(4));
    root.style.setProperty('--dlv-scroll-direction', String(currentState.direction));
    root.style.setProperty('--dlv-active-section', String(currentState.activeSectionIndex));
    root.style.setProperty('--dlv-shader-intensity', (0.48 + currentState.normalizedVelocity * 0.42).toFixed(4));
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<DlavieScrollState>('dlavie:scroll-state', { detail: currentState }));
  }
}

export function syncLenisWithScrollTrigger(lenis: Lenis) {
  registerDlavieGsap();

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastScroll = typeof window !== 'undefined' ? window.scrollY : 0;

  const updateState = (event?: { scroll?: number; velocity?: number; direction?: 1 | -1 | 0 }) => {
    const scroll = event?.scroll ?? (typeof window !== 'undefined' ? window.scrollY : 0);
    const rawVelocity = event?.velocity ?? scroll - lastScroll;
    const direction = event?.direction === -1 || rawVelocity < 0 ? -1 : 1;
    const normalizedVelocity = clamp(Math.abs(rawVelocity) / 90);
    const progress = clamp(scroll / getScrollLimit());
    const sectionCount = Math.max(1, document.querySelectorAll('[data-scroll-section]').length || 4);
    const activeSectionIndex = Math.min(sectionCount - 1, Math.floor(progress * sectionCount));

    lastScroll = scroll;
    setDlavieScrollState({ progress, direction, velocity: rawVelocity, normalizedVelocity, activeSectionIndex, reducedMotion });
    ScrollTrigger.update();
  };

  const tick = (time: number) => lenis.raf(time * 1000);

  lenis.on('scroll', updateState);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  updateState();
  ScrollTrigger.refresh();

  return () => {
    lenis.off('scroll', updateState);
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
