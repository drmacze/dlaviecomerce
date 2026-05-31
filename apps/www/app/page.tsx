import { SmoothScrollProvider } from '../components/SmoothScrollProvider';
import { DlavieGalaxy } from '../components/DlavieGalaxy';

export default function Page() {
  return (
    <SmoothScrollProvider>
      <main className="dlv-page">
        <DlavieGalaxy />
        <section className="dlv-hero">
          <div className="dlv-shell dlv-hero-grid">
            <div>
              <p className="dlv-eyebrow">Dlavie ecosystem</p>
              <h1 className="dlv-title dlv-gradient-text">Dlavie</h1>
              <p className="dlv-copy">
                Digital life, simplified. A dark-premium technology brand for commerce, AI, and automation.
              </p>
              <div className="dlv-actions">
                <a className="dlv-button primary" href="#ecosystem">Explore ecosystem</a>
                <a className="dlv-button" href="#trust">Why Dlavie</a>
              </div>
            </div>

            <div className="dlv-card-stack" id="ecosystem">
              <article className="dlv-product-card">
                <h2>Dlavie Commerce</h2>
                <p>PPOB and digital commerce infrastructure built for reliable transactions.</p>
              </article>
              <article className="dlv-product-card">
                <h2>Dlavie AI</h2>
                <p>AI workspace and automation tools for creators, students, and sellers.</p>
              </article>
              <article className="dlv-product-card" id="trust">
                <h2>Dlavie Account</h2>
                <p>One identity layer for the Dlavie ecosystem, designed with security and privacy in mind.</p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
