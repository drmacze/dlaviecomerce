"use client";

import { gsap, scrollToTarget } from "@dlavie/animations";
import { useEffect, useRef } from "react";

const links = [
  {
    href: "#top",
    label: "Top",
    meta: "Premium parent brand hero",
    badge: "00",
  },
  {
    href: "#cinematic",
    label: "Cinematic Core",
    meta: "Scroll-linked command sequence",
    badge: "01",
  },
  {
    href: "#ecosystem",
    label: "Ecosystem",
    meta: "Commerce, AI, Account, Automation, Admin",
    badge: "02",
  },
  {
    href: "#roadmap",
    label: "Roadmap",
    meta: "Reusable launch surface",
    badge: "03",
  },
  {
    href: "/motion-lab",
    label: "Motion Lab",
    meta: "GSAP, Lenis, WebGL proof",
    badge: "Lab",
  },
];

export function DlavieMenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!panel.current || !overlay.current) return;
    const menuItems = panel.current.querySelectorAll(
      ".dlv-menu-link, .dlv-menu-feature, .dlv-menu-metric",
    );
    if (open) {
      gsap.set(overlay.current, { pointerEvents: "auto" });
      gsap.fromTo(
        overlay.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.24, ease: "power2.out" },
      );
      gsap.fromTo(
        panel.current,
        {
          autoAlpha: 0,
          y: -18,
          scale: 0.965,
          clipPath: "inset(0% 0% 18% 0% round 30px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0% round 30px)",
          duration: 0.44,
          ease: "dlaviePremium",
        },
      );
      gsap.fromTo(
        menuItems,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.045,
          duration: 0.34,
          ease: "dlaviePremium",
        },
      );
    } else {
      gsap.to(panel.current, {
        autoAlpha: 0,
        y: -10,
        scale: 0.975,
        clipPath: "inset(0% 0% 12% 0% round 30px)",
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.to(overlay.current, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => gsap.set(overlay.current, { pointerEvents: "none" }),
      });
    }
  }, [open]);

  const onLink =
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (href.startsWith("#")) {
        event.preventDefault();
        scrollToTarget(href, 92);
      }
      onClose();
    };

  return (
    <div
      ref={overlay}
      className="dlv-menu-overlay"
      aria-hidden={!open}
      onPointerDown={(event) => event.target === overlay.current && onClose()}
    >
      <div
        ref={panel}
        id="dlv-menu-panel"
        className="dlv-menu-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Dlavie navigation menu"
      >
        <div className="dlv-menu-panel-head">
          <div>
            <span>DLAVIE / ECOSYSTEM MAP</span>
            <strong>Move through the parent command surface.</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu">
            Close
          </button>
        </div>
        <div className="dlv-menu-body">
          <nav aria-label="Expanded Dlavie navigation">
            {links.map((link) => (
              <a
                className="dlv-menu-link"
                href={link.href}
                key={link.href}
                onClick={onLink(link.href)}
              >
                <span>{link.badge}</span>
                <strong>{link.label}</strong>
                <small>{link.meta}</small>
              </a>
            ))}
          </nav>
          <aside
            className="dlv-menu-feature"
            aria-label="Featured Dlavie ecosystem status"
          >
            <span>Featured surface</span>
            <h2>DLavie Commerce + AI launch rail</h2>
            <p>
              A crisp product route for transactions, prompt workflows,
              identity, automation, and admin visibility.
            </p>
            <div className="dlv-menu-metrics">
              {["Commerce ready", "AI workspace", "Admin cockpit"].map(
                (item) => (
                  <div className="dlv-menu-metric" key={item}>
                    {item}
                  </div>
                ),
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
