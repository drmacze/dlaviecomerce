import { useEffect } from 'react';

export function DlavieMotionObserver() {
  useEffect(() => {
    let disposed = false;

    const revealAll = () => {
      if (disposed) return;
      document.querySelectorAll<HTMLElement>('.dlv-reveal').forEach((node, index) => {
        if (!node.style.getPropertyValue('--dlv-delay')) {
          node.style.setProperty('--dlv-delay', `${Math.min(index * 45, 220)}ms`);
        }
        node.classList.add('is-visible');
      });
    };

    revealAll();
    const timers = [80, 220, 520, 1000].map((delay) => window.setTimeout(revealAll, delay));
    const mutationObserver = new MutationObserver(() => window.requestAnimationFrame(revealAll));
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
