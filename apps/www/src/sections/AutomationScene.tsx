import { SectionLabel } from '../components/ui/SectionLabel';
import { AutomationOrbit } from '../visuals/AutomationOrbit';

const steps = ['Triggers', 'Agents', 'Commerce events', 'Operational workflows'];

export function AutomationScene() {
  return (
    <section id="automation" className="scene scene-automation" data-scroll-section data-scene-theme="automation" aria-labelledby="automation-title">
      <div className="scene-shell automation-layout">
        <div>
          <SectionLabel index="06" label="Automation" />
          <h2 id="automation-title" data-reveal>Automation keeps the ecosystem synchronized.</h2>
          <p>Triggers, agents, commerce events, and operational workflows stay connected from signal to settlement.</p>
        </div>
        <div className="automation-visual"><AutomationOrbit /><ol>{steps.map((step) => <li className="automation-step" key={step}>{step}</li>)}</ol></div>
      </div>
    </section>
  );
}
