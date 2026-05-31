import { DlavieMarquee } from '../components/DlavieMarquee';
import { HeroShowcase } from '../components/HeroShowcase';
import { SmoothScrollProvider } from '../components/SmoothScrollProvider';
import { TopNav } from '../components/TopNav';

const ecosystemCards = [
  {
    eyebrow: '01 / Commerce OS',
    title: 'Dlavie Commerce',
    copy: 'PPOB and digital commerce infrastructure built for reliable digital transactions.',
  },
  {
    eyebrow: '02 / Intelligence layer',
    title: 'Dlavie AI',
    copy: 'AI workspace and automation tools for creators, students, and sellers.',
  },
  {
    eyebrow: '03 / Identity graph',
    title: 'Dlavie Account',
    copy: 'One secure identity layer for every product inside the Dlavie ecosystem.',
  },
];

export default function Page() {
  return (
    <SmoothScrollProvider>
      <main className="dlv-page">
        <TopNav />
        <HeroShowcase />
        <DlavieMarquee />

        <section className="dlv-ecosystem-section" id="ecosystem" aria-labelledby="ecosystem-title">
          <div className="dlv-shell">
            <div className="dlv-section-kicker">Connected product constellation</div>
            <div className="dlv-section-heading">
              <h2 id="ecosystem-title">One parent brand, multiple products for modern digital life.</h2>
              <p>
                Dlavie unifies commerce, AI, account identity, automation, and admin systems into a premium ecosystem
                designed to scale from everyday transactions to intelligent business workflows.
              </p>
            </div>

            <div className="dlv-ecosystem-grid">
              {ecosystemCards.map((card) => (
                <article className="dlv-ecosystem-card" key={card.title}>
                  <span>{card.eyebrow}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
