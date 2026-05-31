import { DlavieThreeStage } from './three/DlavieThreeStage';
import { HeroReveal } from './motion/HeroReveal';
import { KineticHeadline } from './motion/KineticHeadline';
import { MagneticButton } from './motion/MagneticButton';
import { ScrambleText } from './motion/ScrambleText';
import { SideRail } from './SideRail';
import { DlavieShaderBackdrop } from './webgl/DlavieShaderBackdrop';

export function HeroShowcase() {
  return (
    <section className="dlv-hero" id="top" aria-labelledby="hero-title">
      <DlavieShaderBackdrop className="dlv-hero-shader" />
      <div className="dlv-shell">
        <HeroReveal>
          <div className="dlv-hero-card" data-motion="parallax" data-speed="0.12">
            <div className="dlv-hero-copy">
              <p className="dlv-eyebrow"><ScrambleText text="Dlavie parent technology brand" /></p>
              <KineticHeadline className="dlv-title" id="hero-title">Crafting digital ecosystems for modern life.</KineticHeadline>
              <p className="dlv-copy">
                Dlavie builds commerce, AI, and automation products for the next generation of digital life.
              </p>
              <div className="dlv-actions" aria-label="Hero calls to action">
                <MagneticButton className="dlv-button primary" href="#ecosystem">Explore ecosystem →</MagneticButton>
                <MagneticButton className="dlv-button secondary" href="#roadmap">View roadmap</MagneticButton>
              </div>
              <div className="dlv-scroll-hint" aria-hidden="true"><span /> Scroll to sync engine</div>
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
