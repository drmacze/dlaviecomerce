'use client';

import { ScrollTrigger } from '@dlavie/animations';

export type MotionCleanup = () => void;

export function cleanupMotion(cleanups: MotionCleanup[]) {
  return () => {
    cleanups.forEach((cleanup) => cleanup());
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };
}
