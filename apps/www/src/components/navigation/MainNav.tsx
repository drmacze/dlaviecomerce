import { sceneRegistry } from '../../app/sceneRegistry';
import { DlavieBrand } from '../brand/DlavieBrand';
import { MagneticButton } from '../ui/MagneticButton';

export function MainNav() {
  return (
    <nav className="main-nav" aria-label="DLavie primary navigation">
      <a className="nav-brand" href="/#hero" aria-label="DLavie home">
        <DlavieBrand compact tone="light" />
      </a>
      <div className="nav-links" aria-label="Website sections">
        {sceneRegistry.slice(1, 6).map((scene) => (
          <a key={scene.id} href={`/#${scene.id}`}>
            {scene.label}
          </a>
        ))}
      </div>
      <div className="nav-account-actions" aria-label="DLavie account actions">
        <a className="nav-login" href="/account/login">
          Login
        </a>
        <MagneticButton href="/account/register" tone="secondary" className="nav-action">
          Register
        </MagneticButton>
      </div>
    </nav>
  );
}
