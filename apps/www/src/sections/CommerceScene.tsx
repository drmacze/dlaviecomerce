import { SectionLabel } from '../components/ui/SectionLabel';
import { CommerceRails } from '../visuals/CommerceRails';

const features = ['PPOB products', 'Storefront flows', 'Transaction rails', 'Settlement operations', 'Commerce automation'];

export function CommerceScene() {
  return (
    <section id="commerce" className="scene scene-commerce" data-scroll-section data-scene-theme="commerce" aria-labelledby="commerce-title">
      <div className="commerce-pin">
        <div className="commerce-bg" aria-hidden="true" />
        <div className="scene-shell commerce-layout">
          <div className="commerce-copy">
            <SectionLabel index="05" label="Commerce rails" />
            <h2 id="commerce-title">DLavie Commerce</h2>
            <p>DLavie Commerce connects PPOB products, storefront flows, transaction rails, and settlement operations.</p>
            <div className="commerce-counter" aria-label="Animated transaction volume"><span>Connected events</span><strong>0</strong></div>
          </div>
          <div className="commerce-system">
            <CommerceRails />
            <ul>{features.map((feature) => <li className="commerce-feature" key={feature}>{feature}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
