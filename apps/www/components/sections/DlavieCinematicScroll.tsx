'use client';

import { gsap, registerDlavieGsap, SplitText } from '@dlavie/animations';
import { useEffect, useRef, useState } from 'react';
import { MagneticButton } from '../motion/MagneticButton';
import { ScrambleText } from '../motion/ScrambleText';
import { DlavieThreeStage } from '../three/DlavieThreeStage';

type Chapter = {
  number: string;
  label: string;
  status: string;
  title: string;
  copy: string;
  meta: string;
};

type CoreCard = {
  code: string;
  title: string;
  status: string;
  copy: string;
  meta: string;
  glyph: string;
};

const chapters: Chapter[] = [
  {
    number: '01',
    label: 'DLAVIE CORE',
    status: 'Engine online',
    title: 'Enter the Core',
    copy: 'A command field for Commerce, AI, Account, Automation, and Admin surfaces inside one parent technology brand.',
    meta: 'Scroll-linked depth · Shader response · Cubic identity',
  },
  {
    number: '02',
    label: 'ECOSYSTEM',
    status: 'Product nodes linked',
    title: 'Digital Ecosystem',
    copy: 'Every product node resolves from depth into a connected operating surface for modern digital life.',
    meta: 'Commerce · AI · Account · Automation',
  },
  {
    number: '03',
    label: 'INTELLIGENCE',
    status: 'Intelligence layer active',
    title: 'Intelligence Layer',
    copy: 'Kinetic signals reveal how DLavie turns repeated workflows into intelligent product experiences.',
    meta: 'SplitText · ScrambleText · Workflow signals',
  },
  {
    number: '04',
    label: 'LAUNCH',
    status: 'Surface ready',
    title: 'Launch Surface',
    copy: 'The motion settles into a focused surface ready for DLavie Commerce, DLavie AI, and Account journeys.',
    meta: 'Commerce-ready · AI-ready · Account-ready',
  },
];

const cards: CoreCard[] = [
  { code: 'COM', title: 'Commerce OS', status: 'rails armed', copy: 'Transaction rails, PPOB catalog, provider logs, and order states.', meta: 'PPOB · Orders · Providers', glyph: '01' },
  { code: 'AI', title: 'DLavie AI', status: 'model layer', copy: 'Prompt tools, AI workspace, automations, and usage insights.', meta: 'Workspace · Agents · Prompts', glyph: '02' },
  { code: 'ACC', title: 'Account Graph', status: 'identity sync', copy: 'Unified identity, profile mapping, role model, and secure account surfaces.', meta: 'Auth · Profiles · Roles', glyph: '03' },
  { code: 'AUTO', title: 'Automation Fabric', status: 'signals live', copy: 'Triggers, workflows, schedules, and cross-product system events.', meta: 'Triggers · Flows · Events', glyph: '04' },
  { code: 'ADM', title: 'Admin Cockpit', status: 'ops ready', copy: 'Operational visibility, audit logs, provider control, and governance.', meta: 'Ops · Audit · Control', glyph: '05' },
];

const bigWords = ['Commerce', 'AI', 'Account', 'Automation', 'Admin'];

export function DlavieCinematicScroll() {
  const root = useRef<HTMLElement>(null);
  const [desktopVisual, setDesktopVisual] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 781px)');
    const update = () => setDesktopVisual(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    registerDlavieGsap();
    const element = root.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let split: SplitText | undefined;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 781px)', () => {
      const ctx = gsap.context(() => {
        split = new SplitText('.dlv-cinematic-big', { type: 'words,chars', wordsClass: 'dlv-cinema-word', charsClass: 'dlv-cinema-char' });
        gsap.set('.dlv-cinema-card', { transformPerspective: 1200, transformOrigin: '50% 50%' });
        gsap.set('.dlv-cinema-chapter:not(:first-child)', { autoAlpha: 0, y: 34, scale: 0.98, clipPath: 'inset(10% 0 0 0 round 1.7rem)' });
        gsap.set('.dlv-cinema-card', { autoAlpha: 0, z: -430, y: 150, scale: 0.66, rotateX: 18, rotateY: -7, clipPath: 'inset(14% 8% 14% 8% round 1.25rem)' });
        gsap.set('.dlv-cinema-signal, .dlv-cinematic-progress span', { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(split.chars, { autoAlpha: 0, yPercent: 120, rotateX: -16, skewY: 7 });
        gsap.set('.dlv-cinema-launch', { autoAlpha: 0, y: 44, scale: 0.94, clipPath: 'inset(10% 8% 10% 8% round 1.6rem)' });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: element,
            start: 'top top',
            end: '+=430%',
            scrub: 0.82,
            pin: '.dlv-cinematic-pin',
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              document.documentElement.style.setProperty('--dlv-section-progress', progress.toFixed(4));
              document.documentElement.style.setProperty('--dlv-zoom-progress', progress.toFixed(4));
              document.documentElement.style.setProperty('--dlv-hero-depth', (progress * 1.25).toFixed(4));
            },
          },
        });

        timeline
          .to('.dlv-cinematic-progress span', { scaleX: 1, duration: 4.1 }, 0)
          .to('.dlv-cinema-stage', { scale: 1.32, yPercent: -4, rotateZ: -1.2, duration: 1 }, 0)
          .to('.dlv-cinematic-aura', { scale: 1.48, opacity: 0.84, duration: 1 }, 0)
          .to('.dlv-cinema-chapter-0', { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0% 0 0 0 round 1.7rem)', duration: 0.36 }, 0)
          .to('.dlv-cinema-chapter-0 .dlv-cinema-signal', { scaleX: 1, duration: 0.42 }, 0.1)
          .to('.dlv-cinema-chapter-0', { autoAlpha: 0, y: -38, scale: 0.96, clipPath: 'inset(0 0 28% 0 round 1.7rem)', duration: 0.34 }, 0.72)
          .to('.dlv-cinema-stage', { scale: 0.92, xPercent: -25, rotateY: -10, rotateZ: 1, duration: 1 }, 0.9)
          .to('.dlv-cinema-chapter-1', { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0% 0 0 0 round 1.7rem)', duration: 0.36 }, 0.92)
          .to('.dlv-cinema-chapter-1 .dlv-cinema-signal', { scaleX: 1, duration: 0.42 }, 1.0)
          .to('.dlv-cinema-card', { autoAlpha: 1, z: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, clipPath: 'inset(0% 0% 0% 0% round 1.25rem)', stagger: 0.075, duration: 0.82 }, 1.05)
          .to('.dlv-cinema-card:nth-child(odd)', { y: -34, rotateY: -7, rotateZ: -0.8, scale: 1.04, duration: 0.64 }, 1.58)
          .to('.dlv-cinema-card:nth-child(even)', { y: 30, rotateY: 7, rotateZ: 0.8, scale: 0.98, duration: 0.64 }, 1.58)
          .to('.dlv-cinema-chapter-1', { autoAlpha: 0, y: -36, scale: 0.96, clipPath: 'inset(0 0 28% 0 round 1.7rem)', duration: 0.34 }, 1.86)
          .to('.dlv-cinema-card', { x: (index) => (index - 2) * 58, y: 110, scale: 0.76, autoAlpha: 0.38, rotateX: -6, stagger: 0.025, duration: 0.62 }, 1.92)
          .to('.dlv-cinema-stage', { scale: 1.12, xPercent: 22, rotateY: 8, duration: 0.8 }, 1.95)
          .to('.dlv-cinema-chapter-2', { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0% 0 0 0 round 1.7rem)', duration: 0.36 }, 2.05)
          .to('.dlv-cinema-chapter-2 .dlv-cinema-signal', { scaleX: 1, duration: 0.42 }, 2.1)
          .to(split.chars, { autoAlpha: 1, yPercent: 0, rotateX: 0, skewY: 0, stagger: 0.008, duration: 0.86 }, 2.12)
          .to('.dlv-cinematic-mask-line', { scaleX: 1, duration: 0.64 }, 2.26)
          .to('.dlv-cinema-chapter-2', { autoAlpha: 0, y: -30, scale: 0.97, clipPath: 'inset(0 0 28% 0 round 1.7rem)', duration: 0.35 }, 2.92)
          .to('.dlv-cinematic-big', { yPercent: -28, autoAlpha: 0.38, scale: 0.88, duration: 0.66 }, 2.92)
          .to('.dlv-cinema-stage', { scale: 0.74, xPercent: 0, rotateY: 0, yPercent: -8, duration: 0.75 }, 3.02)
          .to('.dlv-cinema-card', { x: 0, y: 0, scale: 0.96, rotateY: 0, rotateX: 0, autoAlpha: 0.9, stagger: 0.04, duration: 0.62 }, 3.08)
          .to('.dlv-cinema-chapter-3', { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0% 0 0 0 round 1.7rem)', duration: 0.38 }, 3.18)
          .to('.dlv-cinema-chapter-3 .dlv-cinema-signal', { scaleX: 1, duration: 0.42 }, 3.22)
          .to('.dlv-cinema-launch', { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 1.6rem)', duration: 0.52 }, 3.36)
          .to('.dlv-cinematic-aura', { opacity: 0.34, scale: 1.06, duration: 0.42 }, 3.54);
      }, element);

      return () => {
        split?.revert();
        ctx.revert();
      };
    });

    mm.add('(max-width: 780px)', () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.dlv-cinema-chapter, .dlv-cinema-card').forEach((item) => {
          gsap.fromTo(item, { autoAlpha: 0.62, y: 46, scale: 0.94, clipPath: 'inset(8% 4% 8% 4% round 1.25rem)' }, {
            autoAlpha: 1,
            y: -8,
            scale: 1,
            clipPath: 'inset(0% 0% 0% 0% round 1.25rem)',
            ease: 'none',
            scrollTrigger: { trigger: item, start: 'top 94%', end: 'bottom 36%', scrub: 0.58, invalidateOnRefresh: true },
          });
        });
      }, element);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="dlv-cinematic" id="cinematic" aria-labelledby="cinematic-title" data-scroll-section>
      <div className="dlv-cinematic-pin">
        <div className="dlv-cinematic-aura" aria-hidden="true" />
        <div className="dlv-cinematic-grid" aria-hidden="true" />
        <div className="dlv-cinematic-progress" aria-hidden="true"><span /></div>
        <div className="dlv-cinema-stage" aria-hidden="true">
          {desktopVisual ? <DlavieThreeStage /> : <div className="dlv-cinematic-mobile-core" aria-hidden="true" />}
        </div>

        <div className="dlv-cinema-copy">
          {chapters.map((chapter, index) => (
            <article className={`dlv-cinema-chapter dlv-cinema-chapter-${index}`} key={chapter.number}>
              <div className="dlv-cinema-chapter-topline">
                <span>{chapter.number} / <ScrambleText text={chapter.label} /></span>
                <em>{chapter.status}</em>
              </div>
              <small>{chapter.meta}</small>
              <h2 id={index === 0 ? 'cinematic-title' : undefined}>{chapter.title}</h2>
              <p>{chapter.copy}</p>
              <i className="dlv-cinema-signal" aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className="dlv-cinema-card-stack" aria-label="DLavie ecosystem depth cards">
          {cards.map((card) => (
            <article className="dlv-cinema-card" key={card.title}>
              <div className="dlv-cinema-card-head">
                <span>{card.code}</span>
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
          <p className="dlv-section-kicker"><ScrambleText text="SCROLL ENGINE" /></p>
          <h3 className="dlv-cinematic-big">{bigWords.join(' · ')}</h3>
          <span className="dlv-cinematic-mask-line" aria-hidden="true" />
        </div>

        <div className="dlv-cinema-launch">
          <p className="dlv-section-kicker"><ScrambleText text="SYSTEM ONLINE" /></p>
          <h3>Launch from one parent surface.</h3>
          <p>Move into a sharper DLavie product system for commerce, AI, identity, automation, and operations.</p>
          <MagneticButton className="dlv-button primary" href="#ecosystem">Enter ecosystem →</MagneticButton>
        </div>
      </div>
    </section>
  );
}
