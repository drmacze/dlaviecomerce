import { useEffect } from 'react';

export function DlavieMotionObserver() {
  useEffect(() => {
    const revealAll = () => {
      document.querySelectorAll<HTMLElement>('.dlv-reveal').forEach((node, index) => {
        if (!node.style.getPropertyValue('--dlv-delay')) {
          node.style.setProperty('--dlv-delay', `${Math.min(index * 45, 220)}ms`);
        }
        node.classList.add('is-visible');
      });
    };

    revealAll();
    const timer = window.setTimeout(revealAll, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
