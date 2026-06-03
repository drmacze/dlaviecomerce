'use client';

import { useEffect, useState } from 'react';
import { sceneRegistry } from '../../app/sceneRegistry';
import { SvgIcon } from '../ui/SvgIcon';
import { MagneticButton } from '../ui/MagneticButton';

type AccountState = {
  authenticated: boolean;
  email?: string;
  name?: string;
};

export function MainNav() {
  const [account, setAccount] = useState<AccountState | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/account/me', { cache: 'no-store' })
      .then((response) => response.json() as Promise<AccountState>)
      .then((result) => {
        if (isMounted) setAccount(result);
      })
      .catch(() => {
        if (isMounted) setAccount({ authenticated: false });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <nav className="main-nav" aria-label="DLavie primary navigation">
      <a className="nav-brand" href="/#hero" aria-label="DLavie home">
        <SvgIcon name="brand" />
        <span>DLAVIE</span>
      </a>
      <div className="nav-links" aria-label="Website sections">
        {sceneRegistry.slice(1, 5).map((scene) => <a key={scene.id} href={`/#${scene.id}`}>{scene.label}</a>)}
        <a href="/ai">DLavie AI</a>
      </div>
      <div className="nav-account-actions" aria-label="DLavie account actions">
        {account?.authenticated ? (
          <>
            <a className="nav-login" href="/account/dashboard">Dashboard</a>
            <MagneticButton href="/api/account/logout" tone="secondary" className="nav-action">Logout</MagneticButton>
          </>
        ) : (
          <>
            <a className="nav-login" href="/account/login">Login</a>
            <MagneticButton href="/account/register" tone="secondary" className="nav-action">Register</MagneticButton>
          </>
        )}
      </div>
    </nav>
  );
}
