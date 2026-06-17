'use client';

import { useEffect, useRef } from 'react';
import { gsap, registerDlavieGsap } from '@dlavie/animations';

/**
 * CinematicCursor
 *
 * A lightweight custom cursor with:
 *  - Smooth magnetic lag (GSAP quickTo for performance)
 *  - Scale-up on interactive elements (buttons, links, [data-cursor="expand"])
 *  - Scale-down on click
 *  - Velocity-based rotation/skew to match scroll feel
 *  - Disabled on touch devices
 *  - Respects prefers-reduced-motion
 */
export function CinematicCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduce) return;

    registerDlavieGsap();

    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    // Show cursor elements
    gsap.set([dot, ring], { autoAlpha: 1 });
    document.documentElement.classList.add('dlv-cursor-active');

    // QuickTo for snappy dot + laggy ring
    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.12, ease: 'power3' });
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.52, ease: 'power2' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.52, ease: 'power2' });

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onEnterInteractive = () => {
      gsap.to(ring, { scale: 2.4, borderColor: 'rgba(111,139,255,0.9)', duration: 0.35, ease: 'power2.out' });
      gsap.to(dot,  { scale: 0,   duration: 0.25, ease: 'power2.out' });
    };

    const onLeaveInteractive = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(255,255,255,0.55)', duration: 0.35, ease: 'power2.out' });
      gsap.to(dot,  { scale: 1, duration: 0.25, ease: 'power2.out' });
    };

    const onMouseDown = () => gsap.to([dot, ring], { scale: (i) => i === 0 ? 0.7 : 0.85, duration: 0.15, ease: 'power2.out' });
    const onMouseUp   = () => gsap.to([dot, ring], { scale: 1, duration: 0.25, ease: 'power2.out' });

    const interactiveSelectors = 'a, button, [data-cursor="expand"], input, textarea, select, label';

    const attachInteractive = () => {
      document.querySelectorAll<HTMLElement>(interactiveSelectors).forEach((el) => {
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    };

    attachInteractive();

    // Re-attach when DOM changes (e.g. route transitions)
    const mo = new MutationObserver(attachInteractive);
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup',   onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup',   onMouseUp);
      document.documentElement.classList.remove('dlv-cursor-active');
      mo.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dot - snappy follower */}
      <div
        ref={dotRef}
        className="dlv-cursor-dot"
        aria-hidden="true"
        style={{ opacity: 0 }}
      />
      {/* Ring - laggy follower */}
      <div
        ref={ringRef}
        className="dlv-cursor-ring"
        aria-hidden="true"
        style={{ opacity: 0 }}
      />
    </>
  );
}
