import { sceneRegistry } from '../../app/sceneRegistry';
import { SvgIcon } from '../ui/SvgIcon';
import { MagneticButton } from '../ui/MagneticButton';

export function MainNav() {
  return (
    <nav className="main-nav" aria-label="DLavie primary navigation">
      <a className="nav-brand" href="#hero" aria-label="DLavie home">
        <SvgIcon name="brand" />
        <span>DLAVIE</span>
      </a>
      <div className="nav-links" aria-label="Website sections">
        {sceneRegistry.slice(1, 6).map((scene) => <a key={scene.id} href={`#${scene.id}`}>{scene.label}</a>)}
      </div>
      <MagneticButton href="#contact" tone="secondary" className="nav-action">Start</MagneticButton>
    </nav>
  );
}
