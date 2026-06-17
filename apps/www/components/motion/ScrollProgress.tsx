'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const lenis  = useLenis();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const setWidth = gsap.quickTo(bar, 'scaleX', { duration: 0.08, ease: 'power1.out' });

    const handleScroll = ({ progress }: { progress: number }) => {
      const p = Math.max(0, Math.min(1, progress));
      setWidth(p);
      bar.style.opacity = p > 0.97 ? '0' : '1';
    };

    lenis?.on('scroll', handleScroll);
    return () => { lenis?.off('scroll', handleScroll); };
  }, [lenis]);

  return (
    <div className="dlv-scroll-progress-wrap" aria-hidden="true">
      <div
        ref={barRef}
        className="dlv-scroll-progress-bar"
        style={{ transformOrigin: 'left center', transform: 'scaleX(0)' }}
      />
    </div>
  );
}
