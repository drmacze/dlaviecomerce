import { SectionLabel } from '../components/ui/SectionLabel';

const lines = [
  'DLavie designs connected digital systems — from agent workspaces to transaction rails — under one parent brand.',
  'DlavieOS, DLavie AI, Commerce, and automation share one visual language and one operational rhythm.',
  'The result is a focused ecosystem where decisions, transactions, and workflows stay aligned.',
];

export function IdentityScene() {
  return (
    <section id="identity" className="scene scene-identity" data-scroll-section data-scene-theme="dlavie" aria-labelledby="identity-title">
      <div className="scene-shell identity-shell">
        <SectionLabel index="02" label="Identity" />
        <h2 id="identity-title" className="identity-title" data-reveal>One parent brand. Connected product systems.</h2>
        <div className="identity-manifesto">
          {lines.map((line) => <p className="identity-line" key={line}>{line}</p>)}
        </div>
      </div>
    </section>
  );
}
