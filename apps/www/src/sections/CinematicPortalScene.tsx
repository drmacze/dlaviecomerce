import { SectionLabel } from '../components/ui/SectionLabel';

export function CinematicPortalScene() {
  return (
    <section id="portal" className="scene scene-portal" data-scroll-section data-scene-theme="portal" aria-labelledby="portal-title">
      <div className="portal-pin">
        <div className="portal-tunnel" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="portal-core" aria-hidden="true" />
        <div className="portal-copy">
          <SectionLabel index="03" label="Brand aperture" />
          <h2 id="portal-title">The parent brand opens into a focused command environment.</h2>
          <p>A cinematic transition from DLavie identity into the AI workspace where agents, memory, and workflows converge.</p>
        </div>
        <p className="portal-os-label">Entering DlavieOS</p>
      </div>
    </section>
  );
}
