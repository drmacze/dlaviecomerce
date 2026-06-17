'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function CinematicCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduce) return;

    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    gsap.set([dot, ring], { autoAlpha: 1 });
    document.documentElement.classList.add('dlv-cursor-active');

    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.12, ease: 'power3' });
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.52, ease: 'power2' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.52, ease: 'power2' });

    const onMove = (e: MouseEvent) => { dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY); };
    const onEnter = () => { gsap.to(ring, { scale: 2.4, duration: 0.3, ease: 'power2.out' }); gsap.to(dot, { scale: 0, duration: 0.2 }); };
    const onLeave = () => { gsap.to(ring, { scale: 1,   duration: 0.3, ease: 'power2.out' }); gsap.to(dot, { scale: 1, duration: 0.2 }); };
    const onDown  = () => gsap.to([dot, ring], { scale: 0.8, duration: 0.15 });
    const onUp    = () => gsap.to([dot, ring], { scale: 1,   duration: 0.2  });

    const attach = () => {
      document.querySelectorAll<HTMLElement>('a, button, [data-cursor="expand"]').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      document.documentElement.classList.remove('dlv-cursor-active');
      mo.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="dlv-cursor-dot"  aria-hidden="true" style={{ opacity: 0 }} />
      <div ref={ringRef} className="dlv-cursor-ring" aria-hidden="true" style={{ opacity: 0 }} />
    </>
  );
}
