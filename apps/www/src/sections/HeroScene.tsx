import { SectionLabel } from '../components/ui/SectionLabel';
import { MagneticButton } from '../components/ui/MagneticButton';

export function HeroScene() {
  return (
    <section id="hero" className="scene scene-hero" data-scroll-section data-scene-theme="dlavie" aria-labelledby="hero-title">
      <div className="hero-pin">
        <div className="hero-mask" aria-hidden="true" />
        <div className="hero-copy">
          <SectionLabel index="01" label="Parent brand" />
          <h1 id="hero-title">DLAVIE builds the operating layer for AI, commerce, and automation.</h1>
          <p>A parent brand for DlavieOS, DLavie AI Agents, Commerce/PPOB rails, and workflow automation.</p>
          <div className="hero-actions"><MagneticButton href="#dlavieos">Enter DlavieOS</MagneticButton><MagneticButton href="#commerce" tone="secondary">View Commerce</MagneticButton></div>
        </div>
        <strong className="hero-wordmark" aria-label="DLAVIE">DLAVIE</strong>
      </div>
    </section>
  );
}
