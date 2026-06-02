import { MagneticButton } from '../components/ui/MagneticButton';
import { ParticleField } from '../visuals/ParticleField';

export function HeroScene() {
  return (
    <section id="hero" className="scene scene-hero" data-scroll-section data-scene-theme="dlavie" aria-labelledby="hero-title">
      <div className="hero-pin">
        <ParticleField variant="hero" />
        <div className="hero-mask" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-kicker">Parent brand ecosystem</p>
          <h1 id="hero-title" className="hero-title">DLAVIE</h1>
          <p className="hero-tagline">AI. Commerce. Automation.</p>
          <p className="hero-support">An intelligent product ecosystem for DlavieOS, AI agents, PPOB commerce, and connected operations.</p>
          <div className="hero-actions">
            <MagneticButton href="#commerce">Explore DLavie Commerce</MagneticButton>
            <MagneticButton href="#dlavieos" tone="secondary">Activate DLavie AI</MagneticButton>
          </div>
        </div>
        <p className="hero-bottom-note">One brand surface for decisions, transactions, and operational flow.</p>
        <strong className="hero-wordmark" aria-hidden="true">DLAVIE</strong>
      </div>
    </section>
  );
}
