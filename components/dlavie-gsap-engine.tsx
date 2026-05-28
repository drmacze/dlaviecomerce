import { useEffect } from 'react';
import gsap from 'gsap';

const selector = '.dlavie-kinetic-card,.dlavie-hover-lift,.dlavie-premium-surface,.dlavie-magnetic-cta';

export function DlavieGsapEngine() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const cleanups = new WeakMap<HTMLElement, () => void>();

    const enhance = () => {
      gsap.utils.toArray<HTMLElement>(selector).forEach((node) => {
        if (cleanups.has(node)) return;

        const move = (event: PointerEvent) => {
          const rect = node.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const rx = (y / Math.max(rect.height, 1) - 0.5) * -4.5;
          const ry = (x / Math.max(rect.width, 1) - 0.5) * 4.5;
          node.style.setProperty('--mx', `${x}px`);
          node.style.setProperty('--my', `${y}px`);
          gsap.to(node, { rotateX: rx, rotateY: ry, y: -4, scale: 1.01, duration: 0.42, ease: 'power3.out', transformPerspective: 900, overwrite: true });
        };

        const leave = () => {
          gsap.to(node, { rotateX: 0, rotateY: 0, y: 0, scale: 1, duration: 0.56, ease: 'elastic.out(1,.55)', overwrite: true });
        };

        node.addEventListener('pointermove', move);
        node.addEventListener('pointerleave', leave);
        cleanups.set(node, () => {
          node.removeEventListener('pointermove', move);
          node.removeEventListener('pointerleave', leave);
        });
      });

      gsap.fromTo('.dlv-reveal.is-visible', { y: 14, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.62, stagger: 0.035, ease: 'power3.out', overwrite: 'auto' });
    };

    enhance();
    const mutationObserver = new MutationObserver(() => window.requestAnimationFrame(enhance));
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      gsap.utils.toArray<HTMLElement>(selector).forEach((node) => cleanups.get(node)?.());
    };
  }, []);

  return null;
}
