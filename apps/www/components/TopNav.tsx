import { Menu } from 'lucide-react';

export function TopNav() {
  return (
    <header className="dlv-top-nav" aria-label="Primary navigation">
      <a className="dlv-brand" href="#top" aria-label="Dlavie homepage">
        <span className="dlv-brand-mark" aria-hidden="true">D</span>
        <span>Dlavie</span>
      </a>

      <nav className="dlv-nav-links" aria-label="Dlavie product navigation">
        <a href="#ecosystem">Ecosystem</a>
        <a href="#roadmap">Roadmap</a>
      </nav>

      <div className="dlv-nav-actions">
        <a className="dlv-nav-cta" href="#ecosystem">Explore ecosystem</a>
        <button className="dlv-menu-button" type="button" aria-label="Open menu">
          <Menu size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
