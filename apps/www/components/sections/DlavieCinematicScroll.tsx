'use client';

import { gsap, registerDlavieGsap, SplitText } from '@dlavie/animations';
import { useEffect, useRef, useState } from 'react';
import { MagneticButton } from '../motion/MagneticButton';
import { ScrambleText } from '../motion/ScrambleText';
import { DlavieThreeStage } from '../three/DlavieThreeStage';

const chapters = [
  { number: '01', label: 'DLAVIE CORE', title: 'Enter the Core', copy: 'The parent engine comes forward as scroll pulls the interface into Dlavie’s cubic command field.' },
  { number: '02', label: 'ECOSYSTEM', title: 'Digital Ecosystem', copy: 'Commerce, AI, Account, Automation, and Admin move from depth into a connected operating surface.' },
  { number: '03', label: 'INTELLIGENCE', title: 'Intelligence Layer', copy: 'Kinetic text and signal cards reveal how Dlavie turns everyday workflows into intelligent systems.' },
  { number: '04', label: 'LAUNCH', title: 'Launch Surface', copy: 'The motion calms into a focused product surface ready for Commerce, AI, and Account experiences.' },
];

const cards = ['Commerce OS', 'Dlavie AI', 'Account Graph', 'Automation Fabric', 'Admin Cockpit'];
const bigWords = ['Commerce', 'AI', 'Account', 'Automation', 'Admin'];

export function DlavieCinematicScroll() {
  const root = useRef<HTMLElement>(null);
  const [desktopVisual, setDesktopVisual] = useState(false);

  useEffect(() => {
    setDesktopVisual(window.matchMedia('(min-width: 781px)').matches);
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
        gsap.set('.dlv-cinema-card', { transformPerspective: 1100, transformOrigin: '50% 50%' });
        gsap.set('.dlv-cinema-chapter:not(:first-child)', { autoAlpha: 0, y: 32 });
        gsap.set('.dlv-cinema-card', { autoAlpha: 0, z: -420, y: 160, scale: 0.62, rotateX: 18 });
        gsap.set(split.chars, { autoAlpha: 0, yPercent: 120, skewY: 8 });
        gsap.set('.dlv-cinema-launch', { autoAlpha: 0, y: 44, scale: 0.94 });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: element,
            start: 'top top',
            end: '+=430%',
            scrub: 0.85,
            pin: '.dlv-cinematic-pin',
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const sectionProgress = self.progress;
              document.documentElement.style.setProperty('--dlv-section-progress', sectionProgress.toFixed(4));
              document.documentElement.style.setProperty('--dlv-zoom-progress', sectionProgress.toFixed(4));
              document.documentElement.style.setProperty('--dlv-hero-depth', (sectionProgress * 1.25).toFixed(4));
            },
          },
        });

        timeline
          .to('.dlv-cinema-stage', { scale: 1.28, yPercent: -3, duration: 1 }, 0)
          .to('.dlv-cinematic-aura', { scale: 1.42, opacity: 0.82, duration: 1 }, 0)
          .to('.dlv-cinema-chapter-0', { autoAlpha: 1, y: 0, duration: 0.35 }, 0)
          .to('.dlv-cinema-chapter-0', { autoAlpha: 0, y: -42, filter: 'blur(7px)', duration: 0.35 }, 0.72)
          .to('.dlv-cinema-stage', { scale: 0.92, xPercent: -25, rotateY: -9, duration: 1 }, 0.9)
          .to('.dlv-cinema-chapter-1', { autoAlpha: 1, y: 0, duration: 0.35 }, 0.92)
          .to('.dlv-cinema-card', { autoAlpha: 1, z: 0, y: 0, scale: 1, rotateX: 0, stagger: 0.08, duration: 0.82 }, 1.05)
          .to('.dlv-cinema-card:nth-child(odd)', { y: -34, rotateY: -8, scale: 1.05, duration: 0.64 }, 1.58)
          .to('.dlv-cinema-card:nth-child(even)', { y: 28, rotateY: 7, scale: 0.98, duration: 0.64 }, 1.58)
          .to('.dlv-cinema-chapter-1', { autoAlpha: 0, y: -40, filter: 'blur(7px)', duration: 0.35 }, 1.86)
          .to('.dlv-cinema-card', { x: (index) => (index - 2) * 58, y: 120, scale: 0.72, autoAlpha: 0.28, filter: 'blur(4px)', stagger: 0.025, duration: 0.62 }, 1.92)
          .to('.dlv-cinema-stage', { scale: 1.12, xPercent: 22, rotateY: 8, duration: 0.8 }, 1.95)
          .to('.dlv-cinema-chapter-2', { autoAlpha: 1, y: 0, duration: 0.35 }, 2.05)
          .to(split.chars, { autoAlpha: 1, yPercent: 0, skewY: 0, stagger: 0.008, duration: 0.86 }, 2.12)
          .to('.dlv-cinematic-mask-line', { scaleX: 1, duration: 0.64 }, 2.26)
          .to('.dlv-cinema-chapter-2', { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: 0.35 }, 2.92)
          .to('.dlv-cinematic-big', { yPercent: -28, autoAlpha: 0.35, scale: 0.88, duration: 0.66 }, 2.92)
          .to('.dlv-cinema-stage', { scale: 0.74, xPercent: 0, rotateY: 0, yPercent: -8, duration: 0.75 }, 3.02)
          .to('.dlv-cinema-card', { x: 0, y: 0, scale: 0.96, rotateY: 0, autoAlpha: 0.82, filter: 'blur(0px)', stagger: 0.04, duration: 0.62 }, 3.08)
          .to('.dlv-cinema-chapter-3', { autoAlpha: 1, y: 0, duration: 0.38 }, 3.18)
          .to('.dlv-cinema-launch', { autoAlpha: 1, y: 0, scale: 1, duration: 0.52 }, 3.36)
          .to('.dlv-cinematic-aura', { opacity: 0.32, scale: 1.06, duration: 0.42 }, 3.54);
      }, element);

      return () => {
        split?.revert();
        ctx.revert();
      };
    });

    mm.add('(max-width: 780px)', () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.dlv-cinema-card').forEach((card) => {
          gsap.fromTo(card, { autoAlpha: 0.35, y: 60, scale: 0.92 }, {
            autoAlpha: 1,
            y: -12,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top 92%', end: 'bottom 28%', scrub: 0.6, invalidateOnRefresh: true },
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
        <div className="dlv-cinema-stage" aria-hidden="true">
          {desktopVisual ? <DlavieThreeStage /> : <div className="dlv-cinematic-mobile-core" aria-hidden="true" />} 
        </div>

        <div className="dlv-cinema-copy">
          {chapters.map((chapter, index) => (
            <article className={`dlv-cinema-chapter dlv-cinema-chapter-${index}`} key={chapter.number}>
              <span>{chapter.number} / <ScrambleText text={chapter.label} /></span>
              <h2 id={index === 0 ? 'cinematic-title' : undefined}>{chapter.title}</h2>
              <p>{chapter.copy}</p>
            </article>
          ))}
        </div>

        <div className="dlv-cinema-card-stack" aria-label="Dlavie ecosystem depth cards">
          {cards.map((card, index) => (
            <article className="dlv-cinema-card" key={card}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{card}</strong>
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
          <MagneticButton className="dlv-button primary" href="#ecosystem">Enter ecosystem →</MagneticButton>
        </div>
      </div>
    </section>
  );
}
