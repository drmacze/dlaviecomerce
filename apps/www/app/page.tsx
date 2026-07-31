'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Bot, Brain, Database,
  LayoutDashboard, Play, Users, Workflow,
  Zap, Shield, Globe, Home, Cpu, ChevronRight, X, Menu,
} from 'lucide-react';
import { ChromeIcon } from '../src/components/ui/ChromeIcon';
import { ChromePill } from '../src/components/ui/ChromePill';
import { ChromeText } from '../src/components/ui/ChromeText';

/* ─── Floating Sidebar ─── */
const SIDEBAR_ITEMS = [
  { id: 'top',       icon: Home,  label: 'Home'         },
  { id: 'os',        icon: Cpu,   label: 'DLavie OS'    },
  { id: 'ecosystem', icon: Globe, label: 'Ecosystem'     },
  { id: 'workspace', icon: Bot,   label: 'AI Workspace' },
];

function FloatingSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [active,   setActive]   = useState('top');
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SIDEBAR_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.35 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActive(id);
    setExpanded(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="sidebar"
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className={`dlv-sidebar${expanded ? ' dlv-sidebar--expanded' : ''}`}
          aria-label="Page sections"
        >
          <button
            className="dlv-sidebar__toggle"
            onClick={() => setExpanded(p => !p)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <motion.span
              style={{ display: 'flex' }}
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.25 }}
            >
              {expanded ? <X size={14} /> : <Menu size={14} />}
            </motion.span>
          </button>

          <nav className="dlv-sidebar__nav">
            {SIDEBAR_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <motion.button
                  key={item.id}
                  className={`dlv-sidebar__item${isActive ? ' dlv-sidebar__item--active' : ''}`}
                  onClick={() => scrollTo(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'true' : undefined}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 + 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dlv-active"
                      className="dlv-sidebar__active-bg"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="dlv-sidebar__icon">
                    <Icon size={15} strokeWidth={isActive ? 2.4 : 1.8} />
                  </span>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.span
                        className="dlv-sidebar__label"
                        initial={{ opacity: 0, maxWidth: 0 }}
                        animate={{ opacity: 1, maxWidth: 120 }}
                        exit={{ opacity: 0, maxWidth: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!expanded && (
                    <span className="dlv-sidebar__tooltip" role="tooltip">
                      {item.label}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {!expanded && (
            <button
              className="dlv-sidebar__chevron"
              onClick={() => setExpanded(true)}
              aria-label="Expand sidebar"
            >
              <ChevronRight size={11} />
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ─── Page data ─── */
const coreFeatures = [
  { icon: Bot,             title: 'AI Core',    delay: 0,    desc: 'Intelligent foundation powering reasoning, orchestration, and decision-making across the ecosystem.' },
  { icon: Users,           title: 'Agents',     delay: 0.08, desc: 'Autonomous agents that execute complex workflows, handle commerce, and respond to real-time signals.' },
  { icon: Brain,           title: 'Models',     delay: 0.16, desc: 'Flexible model routing with frontier models, fine-tuned agents, and local inference support.' },
  { icon: Database,        title: 'Memory',     delay: 0.24, desc: 'Persistent contextual memory that remembers conversations, transactions, and operational history.' },
  { icon: LayoutDashboard, title: 'Dashboards', delay: 0.32, desc: 'Real-time command surfaces for monitoring agents, commerce metrics, and system health.' },
  { icon: Workflow,        title: 'Workflows',  delay: 0.40, desc: 'Visual and code-based orchestration of multi-step processes across AI, commerce, and automation.' },
];

const ecosystemCards = [
  { icon: Globe,  title: 'DLavie Commerce',  delay: 0,    desc: 'PPOB products, storefront flows, transaction rails, and automated settlement — all connected.' },
  { icon: Zap,    title: 'Automation Layer', delay: 0.1,  desc: 'Triggers, agents, and commerce events stay synchronized from signal to final settlement.' },
  { icon: Shield, title: 'DLavie OS',        delay: 0.2,  desc: 'The intelligent command layer that orchestrates everything into one unified experience.' },
];

/* ─── Main Page ─── */
export default function HomePage() {
  return (
    <>
      <FloatingSidebar />

      {/* dlv-page class → ScrollOrchestrator picks it up for global scroll tracking */}
      <main className="dlavie-home dlv-page">

        {/* ── Nav — animated by ScrollOrchestrator (.dlv-top-nav) ── */}
        <nav className="dlavie-home__nav dlv-top-nav" aria-label="Primary navigation">
          <div className="dlavie-home__nav-inner">
            <a href="#top" className="dlavie-home__brand" aria-label="DLavie home">
              <span className="dlavie-home__brand-mark" aria-hidden="true">D</span>
              <span className="dlavie-home__brand-wordmark">DLavie</span>
            </a>
            <div className="dlavie-home__nav-links">
              <a href="#os">DLavie OS</a>
              <a href="/shop">Commerce</a>
              <a href="#ecosystem">Ecosystem</a>
              <a href="#workspace">AI Workspace</a>
              <a href="/ai">Docs</a>
            </div>
            <div className="dlavie-home__nav-actions">
              <a href="/ai" className="dlavie-home__button dlavie-home__button--ghost dlavie-home__button--desktop">
                Open Workspace
              </a>
              <a href="/account/register" className="dlavie-home__button dlavie-home__button--primary dlavie-home__button--compact">
                Get Started <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero — .dlv-hero + .dlv-hero-card for GSAP parallax push ── */}
        <section id="top" className="dlavie-home__hero dlv-hero" aria-labelledby="hero-title" data-scroll-section="0">
          <div className="dlv-hero-card">
            {/* Eyebrow — split-reveal */}
            <p
              className="dlavie-home__eyebrow"
              data-motion="split-reveal"
              data-stagger="0.04"
            >
              Intelligent operating system
            </p>

            {/* H1 — split-reveal cinematic word-by-word */}
            <h1
              id="hero-title"
              className="dlavie-home__title dlv-title"
              data-motion="split-reveal"
              data-stagger="0.055"
            >
              DLavie OS
            </h1>

            {/* Subtitle — reveal */}
            <p
              className="dlavie-home__subtitle"
              data-motion="reveal"
              data-delay="0.18"
              data-y="20"
            >
              The cinematic command mesh for agents, models, memory, and intelligent operations.
            </p>

            {/* Description — reveal */}
            <p
              className="dlavie-home__description"
              data-motion="reveal"
              data-delay="0.28"
              data-y="16"
            >
              One parent brand. One unified ecosystem. Decisions, transactions, and workflows — perfectly aligned.
            </p>

            {/* CTA row — reveal */}
            <div
              className="dlavie-home__actions"
              data-motion="reveal"
              data-delay="0.38"
              data-y="12"
            >
              <a href="#os" className="dlavie-home__button dlavie-home__button--primary">Explore DLavie OS</a>
              <a href="/ai" className="dlavie-home__button dlavie-home__button--secondary">
                <Play size={14} aria-hidden="true" /> Open AI Workspace
              </a>
            </div>

            <p className="dlavie-home__meta">Built for founders • operators • intelligent systems</p>
          </div>
        </section>

        {/* ── Philosophy ── */}
        <section
          className="dlavie-home__section dlavie-home__section--center dlavie-home__section--band"
          aria-labelledby="philosophy-title"
          data-scroll-section="1"
        >
          <p
            className="dlavie-home__eyebrow"
            style={{ marginInline: 'auto' }}
            data-motion="reveal"
            data-delay="0"
          >
            The philosophy
          </p>
          <h2
            id="philosophy-title"
            className="dlavie-home__section-heading"
            style={{ maxWidth: 640, marginInline: 'auto', marginBottom: 14 }}
            data-motion="split-reveal"
            data-stagger="0.05"
          >
            One parent brand. Connected intelligence.
          </h2>
          <p
            className="dlavie-home__section-copy"
            style={{ marginInline: 'auto' }}
            data-motion="reveal"
            data-delay="0.2"
          >
            DLavie designs connected digital systems under one cohesive brand — from agent workspaces to transaction rails.
          </p>
        </section>

        {/* ── DLavie OS ── */}
        <section id="os" className="dlavie-home__section" aria-labelledby="os-title" data-scroll-section="2">
          <div className="dlavie-home__section-header">
            <div data-motion="reveal" data-delay="0">
              <ChromePill style={{ marginInline: 'auto' }}>The core</ChromePill>
            </div>
            <h2
              id="os-title"
              className="dlavie-home__section-heading"
              data-motion="split-reveal"
              data-stagger="0.045"
            >
              DLavie OS
            </h2>
            <p
              className="dlavie-home__section-copy"
              data-motion="reveal"
              data-delay="0.15"
            >
              Turns agents, models, memory, dashboards, and workflows into a single cinematic command mesh.
            </p>
          </div>

          <div className="dlavie-home__grid dlavie-home__grid--features">
            {coreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="dlavie-home__card dlavie-home__card--feature dlv-eco-card"
                  data-motion="depth-card"
                  data-depth="1"
                >
                  <ChromeIcon delay={item.delay}><Icon size={20} strokeWidth={1.75} /></ChromeIcon>
                  <h3 className="dlavie-home__card-title">{item.title}</h3>
                  <p className="dlavie-home__card-copy">{item.desc}</p>
                  <ChromeText>Learn more <ArrowRight size={12} aria-hidden="true" /></ChromeText>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Ecosystem ── */}
        <section
          id="ecosystem"
          className="dlavie-home__section dlavie-home__section--band"
          aria-labelledby="ecosystem-title"
          data-scroll-section="3"
        >
          <div className="dlavie-home__section-header">
            <p
              className="dlavie-home__eyebrow"
              style={{ marginInline: 'auto' }}
              data-motion="reveal"
            >
              Unified by design
            </p>
            <h2
              id="ecosystem-title"
              className="dlavie-home__section-heading"
              data-motion="split-reveal"
              data-stagger="0.05"
            >
              One ecosystem. Zero friction.
            </h2>
          </div>

          <div className="dlavie-home__grid dlavie-home__grid--ecosystem" style={{ maxWidth: 1180, marginInline: 'auto' }}>
            {ecosystemCards.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="dlavie-home__card dlv-eco-card"
                  data-motion="depth-card"
                  data-depth="1.2"
                >
                  <ChromeIcon delay={item.delay}><Icon size={20} strokeWidth={1.75} /></ChromeIcon>
                  <h3 className="dlavie-home__card-title">{item.title}</h3>
                  <p className="dlavie-home__card-copy">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── AI Workspace ── */}
        <section
          id="workspace"
          className="dlavie-home__section dlavie-home__section--center"
          aria-labelledby="workspace-title"
          data-scroll-section="4"
        >
          <div data-motion="reveal" data-delay="0">
            <ChromePill style={{ marginInline: 'auto' }}>The workspace</ChromePill>
          </div>
          <h2
            id="workspace-title"
            className="dlavie-home__section-heading"
            data-motion="split-reveal"
            data-stagger="0.045"
          >
            Experience the command layer.
          </h2>
          <p
            className="dlavie-home__section-copy dlavie-home__section-copy--wide"
            style={{ marginInline: 'auto', marginBottom: 32 }}
            data-motion="reveal"
            data-delay="0.15"
          >
            DLavie AI Workspace is where intelligence meets operations. Account-aware, context-rich, and built for real work.
          </p>
          <div
            className="dlavie-home__actions"
            style={{ justifyContent: 'center' }}
            data-motion="reveal"
            data-delay="0.25"
          >
            <a href="/ai" className="dlavie-home__button dlavie-home__button--primary">Open DLavie AI Workspace</a>
            <a href="#os" className="dlavie-home__button dlavie-home__button--secondary">Learn about DLavie OS</a>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="dlavie-home__section dlavie-home__section--center dlavie-home__section--cta"
          aria-labelledby="cta-title"
          data-scroll-section="5"
        >
          <h2
            id="cta-title"
            className="dlavie-home__cta-heading"
            data-motion="split-reveal"
            data-stagger="0.04"
          >
            Ready to build with intelligence?
          </h2>
          <p
            className="dlavie-home__section-copy"
            style={{ marginInline: 'auto', marginBottom: 32 }}
            data-motion="reveal"
            data-delay="0.12"
          >
            Start with DLavie OS or dive straight into the AI workspace.
          </p>
          <div
            className="dlavie-home__actions"
            style={{ justifyContent: 'center' }}
            data-motion="reveal"
            data-delay="0.22"
          >
            <a href="/account/register" className="dlavie-home__button dlavie-home__button--primary">
              Get Started <ArrowRight size={13} aria-hidden="true" />
            </a>
            <a href="/ai" className="dlavie-home__button dlavie-home__button--secondary">Open AI Workspace</a>
          </div>
        </section>

      </main>
    </>
  );
}
