import { useEffect } from 'react';
import gsap from 'gsap';

export function DlavieGsapEngine() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const cards = gsap.utils.toArray<HTMLElement>('.dlavie-kinetic-card,.dlavie-hover-lift,.dlavie-premium-surface');
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rx = (y / rect.height - 0.5) * -5;
        const ry = (x / rect.width - 0.5) * 5;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        gsap.to(card, { rotateX: rx, rotateY: ry, y: -4, duration: 0.45, ease: 'power3.out', transformPerspective: 900 });
      };
      const leave = () => gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, .55)' });
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
      });
    });

    gsap.fromTo('.dlv-reveal.is-visible', { y: 18, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, stagger: 0.045, ease: 'power3.out', overwrite: true });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
