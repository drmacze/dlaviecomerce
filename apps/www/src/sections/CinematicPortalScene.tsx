import { SectionLabel } from '../components/ui/SectionLabel';

export function CinematicPortalScene() {
  return (
    <section id="portal" className="scene scene-portal" data-scroll-section data-scene-theme="portal" aria-labelledby="portal-title">
      <div className="portal-pin">
        <div className="portal-tunnel" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="portal-core" aria-hidden="true" />
        <div className="portal-copy">
          <SectionLabel index="03" label="Portal" />
          <h2 id="portal-title">The parent brand surface narrows into an operating-system environment.</h2>
          <p>Scroll through the aperture as the site shifts from neutral DLavie dark into DlavieOS graphite and neon.</p>
        </div>
        <p className="portal-os-label">Entering DlavieOS</p>
      </div>
    </section>
  );
}
