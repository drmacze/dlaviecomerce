import { useEffect } from "react";
import gsap from "gsap";

const tiltSelector =
  ".dlv-glass-card,.dlv-product-card,.dlv-mobile-card,.dlv-command-card,.dlv-magnetic";
const revealSelector = ".dlv-scroll-reveal";

export function DlavieHypermotionEngine() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.documentElement.dataset.dlavieEngine = "hypermotion-3";

    const pointerMove = (event: PointerEvent) => {
      const x = Math.round(
        (event.clientX / Math.max(window.innerWidth, 1)) * 100,
      );
      const y = Math.round(
        (event.clientY / Math.max(window.innerHeight, 1)) * 100,
      );
      document.documentElement.style.setProperty("--dlv-pointer-x", String(x));
      document.documentElement.style.setProperty("--dlv-pointer-y", String(y));
    };

    window.addEventListener("pointermove", pointerMove, { passive: true });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-hyper-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    const cleanups = new WeakMap<HTMLElement, () => void>();

    const hydrate = () => {
      document.querySelectorAll<HTMLElement>(revealSelector).forEach((node) => {
        if (node.classList.contains("is-hyper-visible")) return;
        revealObserver.observe(node);
      });

      if (reducedMotion) return;

      gsap.utils.toArray<HTMLElement>(tiltSelector).forEach((node) => {
        if (cleanups.has(node)) return;

        const move = (event: PointerEvent) => {
          const rect = node.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const rx = (y / Math.max(rect.height, 1) - 0.5) * -5.5;
          const ry = (x / Math.max(rect.width, 1) - 0.5) * 5.5;
          node.style.setProperty("--mx", `${x}px`);
          node.style.setProperty("--my", `${y}px`);
          gsap.to(node, {
            rotateX: rx,
            rotateY: ry,
            y: -5,
            scale: 1.012,
            duration: 0.45,
            ease: "power3.out",
            transformPerspective: 1000,
            overwrite: true,
          });
        };

        const leave = () => {
          gsap.to(node, {
            rotateX: 0,
            rotateY: 0,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.72,
            ease: "elastic.out(1,.65)",
            overwrite: true,
          });
        };

        node.addEventListener("pointermove", move);
        node.addEventListener("pointerleave", leave);
        cleanups.set(node, () => {
          node.removeEventListener("pointermove", move);
          node.removeEventListener("pointerleave", leave);
        });
      });
    };

    hydrate();
    const mutationObserver = new MutationObserver(() =>
      window.requestAnimationFrame(hydrate),
    );
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("pointermove", pointerMove);
      mutationObserver.disconnect();
      revealObserver.disconnect();
      gsap.utils
        .toArray<HTMLElement>(tiltSelector)
        .forEach((node) => cleanups.get(node)?.());
    };
  }, []);

  return null;
}
