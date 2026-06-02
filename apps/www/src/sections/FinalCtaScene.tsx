import { MagneticButton } from '../components/ui/MagneticButton';
import { SectionLabel } from '../components/ui/SectionLabel';
import { SvgIcon } from '../components/ui/SvgIcon';

export function FinalCtaScene() {
  return (
    <section id="contact" className="scene scene-final" data-scroll-section data-scene-theme="dlavie" aria-labelledby="final-title">
      <div className="scene-shell final-shell" data-reveal>
        <SectionLabel index="07" label="Choose your path" />
        <h2 id="final-title">Build with the DLavie product ecosystem.</h2>
        <p>Start from the commerce rails or activate the AI operating layer. Both paths remain connected through the parent DLavie system.</p>
        <div className="final-paths">
          <a href="#commerce" className="final-path"><SvgIcon name="commerce" /><span>Explore DLavie Commerce</span></a>
          <a href="#dlavieos" className="final-path"><SvgIcon name="ai" /><span>Activate DLavie AI</span></a>
        </div>
        <div className="final-actions"><MagneticButton href="mailto:hello@dlavie.com">Plan ecosystem rollout</MagneticButton></div>
      </div>
    </section>
  );
}
