import { useEffect } from 'react';

export function DlavieMotionObserver() {
  useEffect(() => {
    let disposed = false;
    const seen = new WeakSet<Element>();
    const timers: number[] = [];

    const revealNow = (node: Element) => {
      node.classList.add('is-visible');
    };

    const scan = () => {
      if (disposed) return;
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.dlv-reveal'));
      nodes.forEach((node, index) => {
        if (!node.style.getPropertyValue('--dlv-delay')) {
          node.style.setProperty('--dlv-delay', `${Math.min(index * 45, 220)}ms`);
        }

        if (seen.has(node)) return;
        seen.add(node);

        const rect = node.getBoundingClientRect();
        const isNearViewport = rect.top < window.innerHeight * 1.15 && rect.bottom > -window.innerHeight * 0.15;
        if (isNearViewport) revealNow(node);
      });
    };

    scan();
    timers.push(window.setTimeout(scan, 80));
    timers.push(window.setTimeout(scan, 280));
    timers.push(window.setTimeout(scan, 900));

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealNow(entry.target);
            observer.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -4% 0px', threshold: 0.04 })
      : null;

    const observeNodes = () => {
      if (disposed) return;
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.dlv-reveal'));
      nodes.forEach((node, index) => {
        if (!node.style.getPropertyValue('--dlv-delay')) {
          node.style.setProperty('--dlv-delay', `${Math.min(index * 45, 220)}ms`);
        }
        observer?.observe(node);
      });
      scan();
    };

    observeNodes();

    const mutationObserver = new MutationObserver(() => {
      window.requestAnimationFrame(observeNodes);
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      observer?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
