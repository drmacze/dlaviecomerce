'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '@dlavie/animations';
import { MainNav } from '../components/navigation/MainNav';
import { DlavieLoader } from '../components/loading/DlavieLoader';
import { CopyProtection } from '../components/security/CopyProtection';
import { InstallTutorial } from '../components/pwa/InstallTutorial';
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

const MIN_LOADER_MS = 2400;
const MAX_LOADER_MS = 5500;
const FADE_REFRESH_DELAY_MS = 860;

function waitForWindowLoad() {
  if (typeof window === 'undefined' || document.readyState === 'complete') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true });
  });
}

function waitForFonts() {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return Promise.resolve();
  }

  return document.fonts.ready.then(() => undefined).catch(() => undefined);
}

function waitForAnimationFrames(count = 2) {
  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise<void>((resolve) => {
    let remainingFrames = count;
    const tick = () => {
      remainingFrames -= 1;
      if (remainingFrames <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function AppShell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isLoaderLeaving, setIsLoaderLeaving] = useState(false);
  const [isLoaderMounted, setIsLoaderMounted] = useState(true);

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

  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();

    const readiness = Promise.all([waitForFonts(), waitForWindowLoad(), waitForAnimationFrames(2)]);
    const minimum = wait(MIN_LOADER_MS);
    const failsafe = wait(MAX_LOADER_MS);

    Promise.race([Promise.all([readiness, minimum]), failsafe]).then(() => {
      if (!cancelled) setIsLoaderLeaving(true);
    });

    const hardStop = window.setTimeout(() => {
      if (!cancelled) setIsLoaderLeaving(true);
    }, Math.max(MAX_LOADER_MS - (performance.now() - startedAt), 0));

    return () => {
      cancelled = true;
      window.clearTimeout(hardStop);
    };
  }, []);

  useEffect(() => {
    if (!isLoaderLeaving) return;

    const refreshAfterFade = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, FADE_REFRESH_DELAY_MS);

    return () => window.clearTimeout(refreshAfterFade);
  }, [isLoaderLeaving]);

  return (
    <>
      <CopyProtection />
      <div ref={rootRef} className="dlavie-cinematic-app dlavie-copy-protected">
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
      <InstallTutorial enabled={!isLoaderMounted} />
      {isLoaderMounted ? (
        <DlavieLoader
          isLeaving={isLoaderLeaving}
          onExited={() => {
            setIsLoaderMounted(false);
            window.requestAnimationFrame(() => ScrollTrigger.refresh());
          }}
        />
      ) : null}
    </>
  );
}
