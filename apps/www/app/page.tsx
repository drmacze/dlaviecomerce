import { DlavieMarquee } from '../components/DlavieMarquee';
import { HeroShowcase } from '../components/HeroShowcase';
import { RevealSection } from '../components/motion/RevealSection';
import { SmoothScrollProvider } from '../components/SmoothScrollProvider';
import { TopNav } from '../components/TopNav';

const ecosystemCards = [
  { eyebrow: '01 / Commerce OS', title: 'Dlavie Commerce', copy: 'PPOB and digital commerce infrastructure built for reliable digital transactions.' },
  { eyebrow: '02 / Intelligence layer', title: 'Dlavie AI', copy: 'AI workspace and automation tools for creators, students, and sellers.' },
  { eyebrow: '03 / Identity graph', title: 'Dlavie Account', copy: 'One secure identity layer for every product inside the Dlavie ecosystem.' },
  { eyebrow: '04 / Automation fabric', title: 'Dlavie Automation', copy: 'Workflow orchestration for repeatable operations, reminders, and multi-product actions.' },
  { eyebrow: '05 / Admin command', title: 'Dlavie Admin', copy: 'Operational dashboards for support, commerce observability, and ecosystem governance.' },
];

const roadmapItems = ['Cubic identity system', 'Unified checkout rails', 'AI workspace automation', 'Partner admin cockpit'];

export default function Page() {
  return (
    <SmoothScrollProvider>
      <main className="dlv-page">
        <TopNav />
        <HeroShowcase />
        <DlavieMarquee />

        <section className="dlv-ecosystem-section" id="ecosystem" aria-labelledby="ecosystem-title">
          <div className="dlv-shell">
            <RevealSection className="dlv-section-kicker">Connected product constellation</RevealSection>
            <div className="dlv-section-heading">
              <RevealSection as="h2" id="ecosystem-title">One parent brand, multiple products for modern digital life.</RevealSection>
              <RevealSection as="p" delay={0.12}>
                Dlavie unifies commerce, AI, account identity, automation, and admin systems into a premium ecosystem
                designed to scale from everyday transactions to intelligent business workflows.
              </RevealSection>
            </div>

            <div className="dlv-ecosystem-grid">
              {ecosystemCards.map((card, index) => (
                <article className="dlv-ecosystem-card" key={card.title} data-motion="reveal" data-delay={index * 0.06}>
                  <span>{card.eyebrow}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dlv-roadmap-section" id="roadmap" aria-labelledby="roadmap-title">
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
                <div className="dlv-rail-item" key={item} data-motion="reveal" data-delay={index * 0.08}>
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
