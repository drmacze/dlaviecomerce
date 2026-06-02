import { SectionLabel } from '../components/ui/SectionLabel';
import { AgentTopology } from '../visuals/AgentTopology';
import { CurvedLoop } from '../visuals/CurvedLoop';
import { ParticleField } from '../visuals/ParticleField';

const features = ['Agents', 'Models', 'Memory', 'Dashboards', 'Workflows'];

export function DlavieOsScene() {
  return (
    <section id="dlavieos" className="scene scene-os" data-scroll-section data-scene-theme="os" aria-labelledby="os-title">
      <div className="os-pin">
        <ParticleField />
        <CurvedLoop />
        <div className="scene-shell os-layout">
          <div className="os-copy">
            <SectionLabel index="04" label="DlavieOS / DLavie AI" />
            <h2 id="os-title">DlavieOS</h2>
            <p>DlavieOS brings agents, models, memory, dashboards, and workflows into one focused command surface.</p>
            <ul>{features.map((feature) => <li className="os-feature" key={feature}>{feature}</li>)}</ul>
          </div>
          <AgentTopology />
        </div>
      </div>
    </section>
  );
}
