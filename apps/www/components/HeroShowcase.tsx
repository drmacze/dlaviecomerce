"use client";

import { useEffect, useRef, useState } from "react";
import {
  gsap,
  registerDlavieGsap,
  ScrollTrigger,
  SplitText,
} from "@dlavie/animations";
import { CircularText } from "./CircularText";
import { CloudCinematicExperience } from "./CloudCinematicExperience";
import { CloudMenuOverlay } from "./CloudMenuOverlay";
import { ShinyText } from "./ShinyText";
import { DlavieShaderBackdrop } from "./webgl/DlavieShaderBackdrop";

const productLines = [
  ["DlavieOS", "AI workspace, agents, prompts"],
  ["Commerce", "PPOB rails, checkout, provider logs"],
  ["Automation", "Triggers, reminders, system flows"],
];

export function HeroShowcase() {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    registerDlavieGsap();
    const element = root.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = new SplitText(".dlv-cloud-title", {
        type: "chars,words",
        charsClass: "dlv-cloud-char",
      });
      gsap.set(split.chars, { autoAlpha: 0, yPercent: 72, rotateX: -18 });
      gsap.set(".dlv-cloud-giant-char", {
        autoAlpha: 0,
        yPercent: 112,
        rotateX: -16,
        filter: "blur(12px)",
      });
      gsap.set(".dlv-cloud-word", {
        autoAlpha: 0,
        yPercent: 86,
        rotateX: -20,
        filter: "blur(10px)",
      });
      gsap.set(".dlv-cloud-logo-row", {
        autoAlpha: 0,
        visibility: "hidden",
        y: 58,
        pointerEvents: "none",
      });
      gsap.set(".dlv-cloud-reveal", {
        autoAlpha: 0,
        y: 42,
        filter: "blur(12px)",
      });
      gsap.set(".dlv-cloud-preview", {
        autoAlpha: 0,
        y: 120,
        scale: 0.95,
        filter: "blur(10px)",
      });
      gsap.set(".dlv-cloud-terminal-line span", {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set(".dlv-cloud-cinematic", {
        autoAlpha: 0,
        y: 120,
        scale: 0.9,
        filter: "blur(14px)",
      });
      gsap.set(".dlv-video-frame", { scale: 0.48, borderRadius: "2.4rem" });
      gsap.set(".dlv-video-copy", { autoAlpha: 0, y: 42, filter: "blur(10px)" });
      gsap.set(".dlv-product-world", { autoAlpha: 0, y: 120, scale: 0.96, filter: "blur(14px)" });
      gsap.set(".dlv-os-system, .dlv-commerce-rails", { autoAlpha: 0, y: 64, scale: 0.94 });
      gsap.set(".dlv-orbit-chip, .dlv-provider-map span", { autoAlpha: 0, y: 32 });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: element,
            start: "top top",
            end: "+=1120%",
            scrub: 0.9,
            pin: ".dlv-cloud-stage",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress.toFixed(4);
              document.documentElement.style.setProperty(
                "--dlv-scroll-progress",
                progress,
              );
              document.documentElement.style.setProperty(
                "--dlv-zoom-progress",
                progress,
              );
              document.documentElement.style.setProperty(
                "--dlv-scroll-velocity",
                Math.min(Math.abs(self.getVelocity()) / 1800, 1).toFixed(4),
              );
              document.documentElement.style.setProperty(
                "--dlv-cloud-scroll",
                progress,
              );
              document.documentElement.style.setProperty(
                "--dlv-scroll-direction",
                String(self.direction || 1),
              );
              document.documentElement.style.setProperty(
                "--dlv-active-section",
                Math.min(Math.floor(self.progress * 7), 6).toString(),
              );
            },
          },
        })
        .to(
          split.chars,
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            stagger: 0.014,
            duration: 0.4,
          },
          0,
        )
        .to(
          ".dlv-cloud-hero-main",
          { y: 0, scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.55 },
          0,
        )
        .to(
          ".dlv-cloud-hero-copy",
          { autoAlpha: 0, y: -34, filter: "blur(8px)", duration: 0.34 },
          0.72,
        )
        .to(
          ".dlv-cloud-icon",
          {
            y: 124,
            scale: 0.84,
            autoAlpha: 0,
            filter: "blur(8px)",
            duration: 0.48,
          },
          0.82,
        )
        .to(
          ".dlv-cloud-hero-main",
          { autoAlpha: 0, scale: 0.94, duration: 0.18 },
          1.24,
        )
        .to(
          ".dlv-cloud-giant-word",
          { autoAlpha: 1, scale: 1, duration: 0.12 },
          1.3,
        )
        .to(
          ".dlv-cloud-giant-char",
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            filter: "blur(0px)",
            stagger: 0.035,
            duration: 0.62,
          },
          1.34,
        )
        .to(
          ".dlv-cloud-giant-word",
          {
            autoAlpha: 0,
            y: -96,
            scale: 0.9,
            filter: "blur(14px)",
            duration: 0.46,
          },
          2.35,
        )
        .to(
          ".dlv-cloud-word",
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            filter: "blur(0px)",
            stagger: 0.08,
            duration: 0.56,
          },
          2.62,
        )
        .to(
          ".dlv-cloud-logo-row",
          { autoAlpha: 1, visibility: "visible", y: 0, duration: 0.46 },
          2.84,
        )
        .to(
          ".dlv-cloud-word-row",
          {
            autoAlpha: 0,
            y: -80,
            scale: 0.88,
            filter: "blur(12px)",
            duration: 0.42,
          },
          3.36,
        )
        .to(
          ".dlv-cloud-logo-row",
          { autoAlpha: 0, visibility: "hidden", y: 48, duration: 0.34 },
          3.42,
        )
        .to(
          ".dlv-cloud-beat-one",
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.46 },
          3.62,
        )
        .to(
          ".dlv-cloud-beat-one",
          { autoAlpha: 0, y: -54, filter: "blur(10px)", duration: 0.36 },
          4.16,
        )
        .to(
          ".dlv-cloud-beat-two",
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.46 },
          4.32,
        )
        .to(
          ".dlv-cloud-beat-two",
          { autoAlpha: 0, y: -54, filter: "blur(10px)", duration: 0.36 },
          4.86,
        )
        .to(
          ".dlv-cloud-beat-three",
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.46 },
          5.02,
        )
        .to(
          ".dlv-cloud-preview",
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.7 },
          5.26,
        )
        .to(
          ".dlv-cloud-terminal-line span",
          { scaleX: 1, stagger: 0.09, duration: 0.68 },
          5.36,
        )
        .to(
          ".dlv-cloud-beat-three",
          {
            autoAlpha: 0,
            y: -68,
            scale: 0.9,
            filter: "blur(12px)",
            duration: 0.38,
          },
          6.06,
        )
        .to(
          ".dlv-cloud-preview",
          {
            autoAlpha: 0,
            y: 92,
            scale: 0.94,
            filter: "blur(10px)",
            duration: 0.42,
          },
          6.18,
        )
        .to(
          ".dlv-cloud-cinematic",
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.64 },
          6.55,
        )
        .to(
          ".dlv-video-copy",
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.46 },
          6.66,
        )
        .to(
          ".dlv-video-frame",
          { scale: 1, borderRadius: "1.3rem", duration: 0.9 },
          6.88,
        )
        .to(
          ".dlv-video-copy",
          { autoAlpha: 0, y: -54, filter: "blur(10px)", duration: 0.38 },
          7.52,
        )
        .to(
          ".dlv-video-frame",
          { scale: 1.18, borderRadius: "0.7rem", duration: 0.7 },
          7.54,
        )
        .to(
          ".dlv-video-portal",
          { autoAlpha: 0, y: -96, scale: 0.94, filter: "blur(14px)", duration: 0.48 },
          8.18,
        )
        .to(
          ".dlv-os-world",
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.58 },
          8.36,
        )
        .to(
          ".dlv-os-system",
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 },
          8.62,
        )
        .to(
          ".dlv-orbit-chip",
          { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.42 },
          8.72,
        )
        .to(
          ".dlv-os-world",
          { autoAlpha: 0, y: -110, scale: 0.95, filter: "blur(14px)", duration: 0.5 },
          9.55,
        )
        .to(
          ".dlv-commerce-world",
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.58 },
          9.84,
        )
        .to(
          ".dlv-commerce-rails",
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 },
          10.06,
        )
        .to(
          ".dlv-provider-map span",
          { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.42 },
          10.14,
        )
        .to(
          ".dlv-commerce-world",
          { autoAlpha: 0, y: -120, scale: 0.95, filter: "blur(14px)", duration: 0.5 },
          10.92,
        )
        .set(
          ".dlv-cloud-hero-main, .dlv-cloud-giant-word, .dlv-cloud-word-row, .dlv-cloud-logo-row, .dlv-cloud-beat-one, .dlv-cloud-beat-two, .dlv-cloud-beat-three, .dlv-cloud-preview, .dlv-video-portal, .dlv-product-world",
          { autoAlpha: 0 },
          11.18,
        )
        .to(
          ".dlv-cloud-final",
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
          11.25,
        );
    }, element);

    return () => {
      split?.revert();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <main ref={root} className="dlv-cloud-page">
      <div className="dlv-cloud-stage">
        <DlavieShaderBackdrop className="dlv-cloud-shader" />
        <div className="dlv-cloud-css-mist" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="dlv-cloud-grain" aria-hidden="true" />

        <nav className="dlv-cloud-nav" aria-label="Dlavie primary navigation">
          <a
            href="#top"
            className="dlv-cloud-brand"
            aria-label="Dlavie homepage"
          >
            <span className="dlv-cloud-mark">
              <span>D</span>
              <CircularText
                text="DLAVIE INTELLIGENT*"
                spinDuration={22}
                className="dlv-nav-orbit"
              />
            </span>
          </a>
          <div className="dlv-cloud-nav-actions">
            <a className="dlv-cloud-nav-pill" href="#cloud-preview">
              <ShinyText>Try DlavieOS</ShinyText>
            </a>
            <button
              className="dlv-cloud-menu"
              type="button"
              aria-label="Open DlavieOS menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span />
            </button>
          </div>
        </nav>
        <CloudMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

        <section
          id="top"
          className="dlv-cloud-hero-main"
          aria-labelledby="dlavie-cloud-title"
        >
          <div className="dlv-cloud-icon" aria-hidden="true">
            <span className="dlv-cloud-blob">
              <span>D</span>
            </span>
          </div>
          <div className="dlv-cloud-hero-copy">
            <h1 id="dlavie-cloud-title" className="dlv-cloud-title">
              DLavie
            </h1>
            <p>
              DlavieOS unifies Commerce, DLavie AI, and Automation for a simpler
              digital product ecosystem.
            </p>
            <div className="dlv-cloud-cta-row">
              <a href="#cloud-preview" className="dlv-cloud-cta primary">
                <ShinyText>Try DlavieOS</ShinyText>
              </a>
              <a href="#cloud-story" className="dlv-cloud-cta secondary">
                Explore Ecosystem
              </a>
            </div>
          </div>
        </section>

        <div className="dlv-cloud-giant-word" aria-hidden="true">
          {"DLAVIE".split("").map((letter) => (
            <span className="dlv-cloud-giant-char" key={letter}>
              {letter}
            </span>
          ))}
        </div>
        <div className="dlv-cloud-word-row" aria-hidden="true">
          <span className="dlv-cloud-word">Commerce.</span>
          <span className="dlv-cloud-word">AI.</span>
          <span className="dlv-cloud-word">Automation.</span>
        </div>
        <div className="dlv-cloud-logo-row" aria-label="Dlavie product areas">
          <span>commerce</span>
          <span>ai</span>
          <span>automation</span>
        </div>

        <section
          id="cloud-story"
          className="dlv-cloud-beat dlv-cloud-beat-one dlv-cloud-reveal"
          aria-label="Dlavie story one"
        >
          <span>01 / DlavieOS cloud</span>
          <h2>One calm interface for digital products.</h2>
          <p>
            DLavie menyatukan transaksi, AI workspace, identity, dan automation
            dalam satu sistem brand.
          </p>
        </section>
        <section
          className="dlv-cloud-beat dlv-cloud-beat-two dlv-cloud-reveal"
          aria-label="Dlavie story two"
        >
          <span>02 / motion engine</span>
          <h2>Scroll becomes a product journey.</h2>
          <p>
            Lenis smooth scroll and GSAP ScrollTrigger move copy, preview, and
            cloud shader with controlled momentum.
          </p>
        </section>
        <section
          className="dlv-cloud-beat dlv-cloud-beat-three dlv-cloud-reveal"
          aria-label="Dlavie story three"
        >
          <span>03 / DlavieOS intelligence</span>
          <h2>Commerce, AI, and automation in one field.</h2>
          <p>
            Every layer appears as an official product moment, not a card grid.
          </p>
        </section>

        <section
          id="cloud-preview"
          className="dlv-cloud-preview"
          aria-label="DlavieOS product preview"
        >
          <div className="dlv-cloud-window-head">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <strong>DlavieOS</strong>
            <small>ecosystem preview</small>
          </div>
          <div className="dlv-cloud-window-body">
            {productLines.map(([title, detail]) => (
              <div className="dlv-cloud-terminal-line" key={title}>
                <b>{title}</b>
                <p>{detail}</p>
                <span />
              </div>
            ))}
          </div>
        </section>

        <CloudCinematicExperience />

        <section
          className="dlv-cloud-final dlv-cloud-reveal"
          aria-label="Dlavie final call to action"
        >
          <span>DLAVIE ECOSYSTEM</span>
          <h2>Choose your DLavie surface.</h2>
          <p>Start with transaction infrastructure or move into the AI operating layer.</p>
          <div className="dlv-cloud-final-actions">
            <a
              href="#commerce"
              className="dlv-lenis-button dlv-commerce-button"
              aria-label="Explore DLavie Commerce"
            >
              <span className="dlv-button-icon" aria-hidden="true">
                <CommerceIcon />
              </span>
              <span className="dlv-button-label">Commerce</span>
            </a>
            <a
              href="#dlavieos"
              className="dlv-lenis-button dlv-ai-button"
              aria-label="Explore DLavie AI"
            >
              <span className="dlv-button-icon" aria-hidden="true">
                <AiIcon />
              </span>
              <span className="dlv-button-label">DLavie AI</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function CommerceIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" focusable="false">
      <path d="M4 6h3.4l1.2 8.2a2 2 0 0 0 2 1.7h5.9a2 2 0 0 0 1.9-1.4L20 9H8" />
      <path d="M10 20h.1M17 20h.1M9 12h9" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" focusable="false">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M8.5 8.5 6 6M15.5 15.5 18 18M15.5 8.5 18 6M8.5 15.5 6 18" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}
