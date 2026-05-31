import { SmoothScrollProvider } from '../components/SmoothScrollProvider';
import { DlavieGalaxy } from '../components/DlavieGalaxy';

export default function Page() {
  return (
    <SmoothScrollProvider>
      <main className="dlv-page">
        <DlavieGalaxy />
        <section className="dlv-hero">
          <div className="dlv-shell">
            <p className="dlv-eyebrow">Dlavie ecosystem</p>
            <h1 className="dlv-title dlv-gradient-text">Dlavie</h1>
            <p className="dlv-copy">Digital life, simplified.</p>
          </div>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
