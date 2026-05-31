export const motionTokens = {
  duration: {
    micro: 0.18,
    fast: 0.36,
    base: 0.72,
    slow: 1.08,
    cinematic: 1.45,
  },
  ease: {
    premium: 'dlaviePremium',
    soft: 'power3.out',
    snap: 'expo.out',
    text: 'dlavieText',
  },
  stagger: {
    tight: 0.025,
    base: 0.075,
    cards: 0.12,
  },
  parallax: {
    subtle: 0.16,
    medium: 0.32,
    strong: 0.52,
  },
} as const;

export type MotionTokens = typeof motionTokens;

export function getPrefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
