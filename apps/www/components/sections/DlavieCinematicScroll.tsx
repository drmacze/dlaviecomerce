"use client";

import { gsap, registerDlavieGsap, SplitText } from "@dlavie/animations";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "../motion/MagneticButton";
import { ScrambleText } from "../motion/ScrambleText";
import { DlavieThreeStage } from "../three/DlavieThreeStage";

const chapters = [
  {
    number: "01",
    label: "DLAVIE CORE",
    status: "Engine online",
    title: "Enter the Core",
    copy: "A living command field for commerce, AI, account, automation, and admin products.",
    meta: "Scroll-linked depth · Shader response · Cubic identity",
  },
  {
    number: "02",
    label: "ECOSYSTEM",
    status: "Product nodes linked",
    title: "Digital Ecosystem",
    copy: "Commerce, AI, Account, Automation, and Admin resolve into one operating surface.",
    meta: "Commerce · AI · Account · Automation",
  },
  {
    number: "03",
    label: "INTELLIGENCE",
    status: "Intelligence layer active",
    title: "Intelligence Layer",
    copy: "Kinetic systems help transform daily workflows into intelligent product surfaces.",
    meta: "SplitText · ScrambleText · Workflow signals",
  },
  {
    number: "04",
    label: "LAUNCH",
    status: "Surface ready",
    title: "Launch Surface",
    copy: "The motion settles into a clear path toward DLavie Commerce and DLavie AI.",
    meta: "Commerce-ready · AI-ready · Account-ready",
  },
];

const cards = [
  {
    glyph: "CO",
    status: "Rails live",
    title: "Commerce OS",
    copy: "Transaction rails, PPOB catalog, provider logs, and checkout visibility.",
    meta: "Provider logs · Catalog sync",
  },
  {
    glyph: "AI",
    status: "Workspace warm",
    title: "DLavie AI",
    copy: "Prompt tools, creator workspace, automation assists, and usage insight.",
    meta: "Prompt tools · Usage insight",
  },
  {
    glyph: "ID",
    status: "Graph mapped",
    title: "Account Graph",
    copy: "Unified identity, profile mapping, role permissions, and trust signals.",
    meta: "Roles · Profiles · Trust",
  },
  {
    glyph: "AF",
    status: "Signals armed",
    title: "Automation Fabric",
    copy: "Triggers, workflow signals, reminders, and repeatable product actions.",
    meta: "Triggers · Workflows",
  },
  {
    glyph: "AD",
    status: "Ops visible",
    title: "Admin Cockpit",
    copy: "Operational visibility, audit logs, provider control, and support context.",
    meta: "Audit · Provider control",
  },
];

const bigWords = ["Commerce", "AI", "Account", "Automation", "Admin"];

export function DlavieCinematicScroll() {
  const root = useRef<HTMLElement>(null);
  const [desktopVisual, setDesktopVisual] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 781px)");
    const update = () => setDesktopVisual(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    registerDlavieGsap();
    const element = root.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let split: SplitText | undefined;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 781px)", () => {
      const ctx = gsap.context(() => {
        split = new SplitText(".dlv-cinematic-big", {
          type: "words,chars",
          wordsClass: "dlv-cinema-word",
          charsClass: "dlv-cinema-char",
        });
        gsap.set(".dlv-cinema-card", {
          transformPerspective: 1200,
          transformOrigin: "50% 50%",
        });
        gsap.set(".dlv-cinema-chapter", {
          clipPath: "inset(0% 0% 0% 0% round 28px)",
        });
        gsap.set(".dlv-cinema-chapter:not(:first-child)", {
          autoAlpha: 0,
          y: 28,
          clipPath: "inset(12% 0% 0% 0% round 28px)",
        });
        gsap.set(".dlv-cinema-card", {
          autoAlpha: 0,
          z: -460,
          y: 156,
          scale: 0.62,
          rotateX: 18,
          clipPath: "inset(16% 8% 0% 8% round 24px)",
        });
        gsap.set(".dlv-cinema-signal", { scaleX: 0.24 });
        gsap.set(split.chars, { autoAlpha: 0, yPercent: 110, rotateX: -18 });
        gsap.set(".dlv-cinema-launch", {
          autoAlpha: 0,
          y: 42,
          scale: 0.94,
          clipPath: "inset(18% 0% 0% 0% round 30px)",
        });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: element,
            start: "top top",
            end: "+=460%",
            scrub: 0.85,
            pin: ".dlv-cinematic-pin",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const sectionProgress = self.progress;
              document.documentElement.style.setProperty(
                "--dlv-section-progress",
                sectionProgress.toFixed(4),
              );
              document.documentElement.style.setProperty(
                "--dlv-zoom-progress",
                sectionProgress.toFixed(4),
              );
              document.documentElement.style.setProperty(
                "--dlv-hero-depth",
                (sectionProgress * 1.25).toFixed(4),
              );
            },
          },
        });

        timeline
          .to(".dlv-cinematic-progress span", { scaleX: 1, duration: 4 }, 0)
          .to(
            ".dlv-cinema-stage",
            { scale: 1.23, yPercent: -3, rotateY: -4, duration: 1 },
            0,
          )
          .to(
            ".dlv-cinematic-aura",
            { scale: 1.36, opacity: 0.78, duration: 1 },
            0,
          )
          .to(
            ".dlv-cinematic-grid",
            { yPercent: -12, opacity: 0.34, duration: 4 },
            0,
          )
          .to(
            ".dlv-cinema-chapter-0 .dlv-cinema-signal",
            { scaleX: 1, duration: 0.6 },
            0.12,
          )
          .to(
            ".dlv-cinema-chapter-0",
            {
              autoAlpha: 0,
              y: -36,
              scale: 0.965,
              clipPath: "inset(0% 0% 100% 0% round 28px)",
              duration: 0.34,
            },
            0.74,
          )
          .to(
            ".dlv-cinema-stage",
            { scale: 0.9, xPercent: -24, rotateY: -11, duration: 1 },
            0.88,
          )
          .to(
            ".dlv-cinema-chapter-1",
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0% round 28px)",
              duration: 0.38,
            },
            0.94,
          )
          .to(
            ".dlv-cinema-chapter-1 .dlv-cinema-signal",
            { scaleX: 1, duration: 0.7 },
            1.02,
          )
          .to(
            ".dlv-cinema-card",
            {
              autoAlpha: 1,
              z: 0,
              y: 0,
              scale: 1,
              rotateX: 0,
              clipPath: "inset(0% 0% 0% 0% round 24px)",
              stagger: 0.08,
              duration: 0.82,
            },
            1.05,
          )
          .to(
            ".dlv-cinema-card:nth-child(odd)",
            { y: -34, rotateY: -8, scale: 1.045, duration: 0.64 },
            1.58,
          )
          .to(
            ".dlv-cinema-card:nth-child(even)",
            { y: 28, rotateY: 7, scale: 0.985, duration: 0.64 },
            1.58,
          )
          .to(
            ".dlv-cinema-chapter-1",
            {
              autoAlpha: 0,
              y: -38,
              scale: 0.97,
              clipPath: "inset(0% 0% 100% 0% round 28px)",
              duration: 0.34,
            },
            1.86,
          )
          .to(
            ".dlv-cinema-card",
            {
              x: (index) => (index - 2) * 62,
              y: 112,
              scale: 0.74,
              autoAlpha: 0.36,
              rotateX: -8,
              stagger: 0.025,
              duration: 0.62,
            },
            1.92,
          )
          .to(
            ".dlv-cinema-stage",
            { scale: 1.1, xPercent: 23, rotateY: 9, duration: 0.8 },
            1.95,
          )
          .to(
            ".dlv-cinema-chapter-2",
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0% round 28px)",
              duration: 0.38,
            },
            2.05,
          )
          .to(
            ".dlv-cinema-chapter-2 .dlv-cinema-signal",
            { scaleX: 1, duration: 0.7 },
            2.1,
          )
          .to(
            split.chars,
            {
              autoAlpha: 1,
              yPercent: 0,
              rotateX: 0,
              stagger: 0.008,
              duration: 0.86,
            },
            2.12,
          )
          .to(".dlv-cinematic-mask-line", { scaleX: 1, duration: 0.64 }, 2.26)
          .to(
            ".dlv-cinema-chapter-2",
            {
              autoAlpha: 0,
              y: -30,
              scale: 0.97,
              clipPath: "inset(0% 0% 100% 0% round 28px)",
              duration: 0.35,
            },
            2.92,
          )
          .to(
            ".dlv-cinematic-big",
            { yPercent: -28, autoAlpha: 0.42, scale: 0.88, duration: 0.66 },
            2.92,
          )
          .to(
            ".dlv-cinema-stage",
            {
              scale: 0.74,
              xPercent: 0,
              rotateY: 0,
              yPercent: -8,
              duration: 0.75,
            },
            3.02,
          )
          .to(
            ".dlv-cinema-card",
            {
              x: 0,
              y: 0,
              scale: 0.96,
              rotateY: 0,
              rotateX: 0,
              autoAlpha: 0.86,
              stagger: 0.04,
              duration: 0.62,
            },
            3.08,
          )
          .to(
            ".dlv-cinema-chapter-3",
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0% round 28px)",
              duration: 0.38,
            },
            3.18,
          )
          .to(
            ".dlv-cinema-chapter-3 .dlv-cinema-signal",
            { scaleX: 1, duration: 0.72 },
            3.22,
          )
          .to(
            ".dlv-cinema-launch",
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 30px)",
              duration: 0.52,
            },
            3.36,
          )
          .to(
            ".dlv-cinematic-aura",
            { opacity: 0.3, scale: 1.06, duration: 0.42 },
            3.54,
          );
      }, element);

      return () => {
        split?.revert();
        ctx.revert();
      };
    });

    mm.add("(max-width: 780px)", () => {
      const ctx = gsap.context(() => {
        gsap.utils
          .toArray<HTMLElement>(
            ".dlv-cinema-chapter, .dlv-cinema-card, .dlv-cinema-launch",
          )
          .forEach((item) => {
            gsap.fromTo(
              item,
              {
                autoAlpha: 0.55,
                y: 52,
                scale: 0.96,
                clipPath: "inset(8% 0% 0% 0% round 24px)",
              },
              {
                autoAlpha: 1,
                y: -8,
                scale: 1,
                clipPath: "inset(0% 0% 0% 0% round 24px)",
                ease: "none",
                scrollTrigger: {
                  trigger: item,
                  start: "top 92%",
                  end: "bottom 54%",
                  scrub: 0.6,
                },
              },
            );
          });
      }, element);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      className="dlv-cinematic"
      id="cinematic"
      data-scroll-section
      aria-labelledby="cinematic-title"
    >
      <div className="dlv-cinematic-pin">
        <div className="dlv-cinematic-grid" aria-hidden="true" />
        <div className="dlv-cinematic-aura" aria-hidden="true" />
        <div className="dlv-cinematic-progress" aria-hidden="true">
          <span />
        </div>

        <div className="dlv-cinema-stage" aria-hidden="true">
          {desktopVisual ? (
            <DlavieThreeStage />
          ) : (
            <div className="dlv-cinematic-mobile-core" />
          )}
        </div>

        <div className="dlv-cinema-copy">
          {chapters.map((chapter, index) => (
            <article
              className={`dlv-cinema-chapter dlv-cinema-chapter-${index}`}
              key={chapter.number}
            >
              <span className="dlv-cinema-signal" aria-hidden="true" />
              <div className="dlv-cinema-chapter-topline">
                <span>
                  {chapter.number} / <ScrambleText text={chapter.label} />
                </span>
                <em>{chapter.status}</em>
              </div>
              <h2 id={index === 0 ? "cinematic-title" : undefined}>
                {chapter.title}
              </h2>
              <p>{chapter.copy}</p>
              <small>{chapter.meta}</small>
            </article>
          ))}
        </div>

        <div
          className="dlv-cinema-card-stack"
          aria-label="Dlavie ecosystem depth cards"
        >
          {cards.map((card, index) => (
            <article className="dlv-cinema-card" key={card.title}>
              <div className="dlv-cinema-card-head">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <em>{card.status}</em>
              </div>
              <strong>{card.title}</strong>
              <p>{card.copy}</p>
              <small>{card.meta}</small>
              <i aria-hidden="true">{card.glyph}</i>
            </article>
          ))}
        </div>

        <div className="dlv-cinematic-text-scene">
          <p className="dlv-section-kicker">
            <ScrambleText text="SCROLL ENGINE" />
          </p>
          <h3 className="dlv-cinematic-big">{bigWords.join(" · ")}</h3>
          <span className="dlv-cinematic-mask-line" aria-hidden="true" />
        </div>

        <div className="dlv-cinema-launch">
          <p className="dlv-section-kicker">
            <ScrambleText text="SYSTEM ONLINE" />
          </p>
          <h3>Launch from one parent surface.</h3>
          <p>
            DLavie Commerce, AI, Account, Automation, and Admin now resolve into
            a crisp product command layer.
          </p>
          <MagneticButton className="dlv-button primary" href="#ecosystem">
            Enter ecosystem →
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
