import { DlavieThreeStage } from './three/DlavieThreeStage';
import { HeroReveal } from './motion/HeroReveal';
import { SideRail } from './SideRail';

export function HeroShowcase() {
  return (
    <section className="dlv-hero" id="top" aria-labelledby="hero-title">
      <div className="dlv-shell">
        <HeroReveal>
          <div className="dlv-hero-card">
            <div className="dlv-hero-copy">
              <p className="dlv-eyebrow">Dlavie parent technology brand</p>
              <h1 className="dlv-title" id="hero-title">Crafting digital ecosystems for modern life.</h1>
              <p className="dlv-copy">
                Dlavie builds commerce, AI, and automation products for the next generation of digital life.
              </p>
              <div className="dlv-actions" aria-label="Hero calls to action">
                <a className="dlv-button primary" href="#ecosystem">Explore ecosystem →</a>
                <a className="dlv-button secondary" href="#roadmap">View roadmap</a>
              </div>
            </div>

            <div className="dlv-hero-visual" aria-label="Dlavie Cubic Core brand visual">
              <DlavieThreeStage />
              <SideRail />
              <div className="dlv-visual-caption">
                <span>Cubic Core</span>
                <strong>Commerce · AI · Automation</strong>
              </div>
            </div>
          </div>
        </HeroReveal>
      </div>
    </section>
  );
}
