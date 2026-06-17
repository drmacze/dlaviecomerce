'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import { gsap } from '@dlavie/animations';

/**
 * ScrollProgress
 *
 * A cinematic top progress bar that:
 *  - Tracks Lenis scroll progress (0–1)
 *  - Reacts to scroll velocity: glows brighter + widens when scrolling fast
 *  - Uses GSAP quickTo for buttery-smooth width updates
 *  - Fades out near 100% (page complete feeling)
 */
export function ScrollProgress() {
  const barRef  = useRef<HTMLDivElement>(null);
  const lenis   = useLenis();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const setWidth   = gsap.quickTo(bar, 'scaleX',   { duration: 0.08, ease: 'power1.out' });
    const setOpacity = gsap.quickTo(bar, 'opacity',  { duration: 0.25, ease: 'power2.out' });
    const setGlow    = gsap.quickTo(bar, '--bar-glow', { duration: 0.3, ease: 'power2.out' });

    const handleScroll = ({ progress, velocity }: { progress: number; velocity: number }) => {
      const p           = Math.max(0, Math.min(1, progress));
      const speed       = Math.min(1, Math.abs(velocity) / 60);
      const opacity     = p > 0.97 ? 0 : 1;

      setWidth(p);
      setOpacity(opacity);
      setGlow(speed);
    };

    lenis?.on('scroll', handleScroll);
    return () => { lenis?.off('scroll', handleScroll); };
  }, [lenis]);

  return (
    <div className="dlv-scroll-progress-wrap" aria-hidden="true">
      <div
        ref={barRef}
        className="dlv-scroll-progress-bar"
        style={{ transformOrigin: 'left center', scaleX: 0, '--bar-glow': 0 } as React.CSSProperties}
      />
    </div>
  );
}
