import { SectionLabel } from '../components/ui/SectionLabel';

const lines = [
  'DLavie is the parent system behind intelligent workspaces, commerce operations, and automated execution.',
  'The brand connects DlavieOS, AI agents, PPOB rails, storefront flows, and synchronized operational dashboards.',
  'Every product is composed to make decisions, transactions, and workflows feel like one sovereign operating layer.',
];

export function IdentityScene() {
  return (
    <section id="identity" className="scene scene-identity" data-scroll-section data-scene-theme="dlavie" aria-labelledby="identity-title">
      <div className="scene-shell identity-shell">
        <SectionLabel index="02" label="Identity" />
        <h2 id="identity-title" className="identity-title" data-reveal>Not a template page. A connected product universe.</h2>
        <div className="identity-manifesto">
          {lines.map((line) => <p className="identity-line" key={line}>{line}</p>)}
        </div>
      </div>
    </section>
  );
}
