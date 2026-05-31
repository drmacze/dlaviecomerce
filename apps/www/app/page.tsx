import { DlavieMarquee } from '../components/DlavieMarquee';
import { HeroShowcase } from '../components/HeroShowcase';
import { DlavieCinematicScroll } from '../components/sections/DlavieCinematicScroll';
import { RevealSection } from '../components/motion/RevealSection';
import { SmoothScrollProvider } from '../components/SmoothScrollProvider';
import { TopNav } from '../components/TopNav';

const ecosystemNodes = [
  { code: 'COM', title: 'Commerce', axis: 'Transaction rails', copy: 'PPOB catalog, provider logs, order states, and checkout-ready commerce flows.', meta: 'PPOB · Orders · Providers' },
  { code: 'AI', title: 'AI', axis: 'Intelligence layer', copy: 'Workspace tools, prompt systems, automations, and assistant-powered workflows.', meta: 'Prompts · Agents · Automation' },
  { code: 'ACC', title: 'Account', axis: 'Identity graph', copy: 'Unified login, roles, profile mapping, and product access across the ecosystem.', meta: 'Auth · Profiles · Roles' },
  { code: 'AUTO', title: 'Automation', axis: 'Signal fabric', copy: 'Triggers, schedules, reminders, and cross-product system events.', meta: 'Triggers · Flows · Events' },
  { code: 'ADM', title: 'Admin', axis: 'Operating cockpit', copy: 'Support visibility, provider control, audit logs, and governance surfaces.', meta: 'Ops · Audit · Control' },
];

const roadmapItems = ['Cubic identity system', 'Unified checkout rails', 'AI workspace automation', 'Partner admin cockpit'];

export default function Page() {
  return (
    <SmoothScrollProvider>
      <main className="dlv-page">
        <TopNav />
        <HeroShowcase />
        <DlavieCinematicScroll />
        <DlavieMarquee />

        <section className="dlv-ecosystem-section dlv-holo-ecosystem" id="ecosystem" data-scroll-section aria-labelledby="ecosystem-title">
          <div className="dlv-shell dlv-holo-shell">
            <div className="dlv-holo-copy">
              <RevealSection className="dlv-section-kicker">Holographic ecosystem</RevealSection>
              <RevealSection as="h2" id="ecosystem-title">DLavie products orbit one living core.</RevealSection>
              <RevealSection as="p" delay={0.12}>
                Commerce, AI, Account, Automation, and Admin appear as luminous product nodes inside a single parent-brand field.
              </RevealSection>
            </div>

            <div className="dlv-holo-field" aria-label="DLavie connected product constellation">
              <div className="dlv-holo-core" aria-hidden="true">
                <span>DL</span>
                <b>Core</b>
              </div>
              <span className="dlv-holo-orbit orbit-a" aria-hidden="true" />
              <span className="dlv-holo-orbit orbit-b" aria-hidden="true" />
              <span className="dlv-holo-orbit orbit-c" aria-hidden="true" />
              <span className="dlv-holo-scan" aria-hidden="true" />
              <span className="dlv-holo-beam beam-a" aria-hidden="true" />
              <span className="dlv-holo-beam beam-b" aria-hidden="true" />
              <span className="dlv-holo-beam beam-c" aria-hidden="true" />

              {ecosystemNodes.map((node, index) => (
                <article className={`dlv-holo-node node-${index + 1}`} key={node.code} data-motion="depth-card" data-depth="0.7">
                  <span>{node.code}</span>
                  <strong>{node.title}</strong>
                  <small>{node.axis}</small>
                  <p>{node.copy}</p>
                  <em>{node.meta}</em>
                </article>
              ))}
            </div>

            <aside className="dlv-holo-brief" aria-label="DLavie ecosystem capability summary">
              <span>System status</span>
              <strong>Parent surface online</strong>
              <p>The official site now frames DLavie as a connected holographic operating layer, not a stack of repeated panels.</p>
              <div className="dlv-holo-metrics">
                <div><b>05</b><small>product nodes</small></div>
                <div><b>01</b><small>parent core</small></div>
                <div><b>∞</b><small>workflow paths</small></div>
              </div>
            </aside>
          </div>
        </section>

        <section className="dlv-roadmap-section" id="roadmap" data-scroll-section aria-labelledby="roadmap-title">
          <div className="dlv-shell dlv-roadmap-grid">
            <div className="dlv-roadmap-copy">
              <RevealSection className="dlv-section-kicker">Product rail / 2026 rhythm</RevealSection>
              <RevealSection as="h2" id="roadmap-title" delay={0.08}>A kinetic operating layer for every Dlavie product.</RevealSection>
              <RevealSection as="p" delay={0.16}>
                The parent site now exposes an interaction convention that future product sections can reuse without
                turning motion into one-off animation spaghetti.
              </RevealSection>
            </div>
            <div className="dlv-product-rail" aria-label="Dlavie roadmap rail">
              {roadmapItems.map((item, index) => (
                <div className="dlv-rail-item" key={item} data-motion="depth-card" data-delay={index * 0.08}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
