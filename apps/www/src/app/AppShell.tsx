'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from '@dlavie/animations';
import { MainNav } from '../components/navigation/MainNav';
import { ShaderStage } from '../visuals/ShaderStage';
import { HeroScene } from '../sections/HeroScene';
import { IdentityScene } from '../sections/IdentityScene';
import { CinematicPortalScene } from '../sections/CinematicPortalScene';
import { DlavieOsScene } from '../sections/DlavieOsScene';
import { CommerceScene } from '../sections/CommerceScene';
import { AutomationScene } from '../sections/AutomationScene';
import { FinalCtaScene } from '../sections/FinalCtaScene';
import { createLenis } from '../motion/createLenis';
import { createScrollScenes } from '../motion/createScrollScene';

export function AppShell() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lenisController = createLenis();
    const cleanupScenes = createScrollScenes(root);
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(refresh);
      cleanupScenes();
      lenisController.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className="dlavie-cinematic-app">
      <ShaderStage />
      <MainNav />
      <main>
        <HeroScene />
        <IdentityScene />
        <CinematicPortalScene />
        <DlavieOsScene />
        <CommerceScene />
        <AutomationScene />
        <FinalCtaScene />
      </main>
    </div>
  );
}
