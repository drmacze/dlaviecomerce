import { useEffect } from 'react';

export function DlavieMotionObserver() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.dlv-reveal'));
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.16 });

    nodes.forEach((node, index) => {
      if (!node.style.getPropertyValue('--dlv-delay')) {
        node.style.setProperty('--dlv-delay', `${Math.min(index * 55, 260)}ms`);
      }
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
