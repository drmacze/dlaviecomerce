'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DlavieLoader } from './DlavieLoader';

const SESSION_KEY = 'dlavie:experience-loader:v4';
const ELIGIBLE_PREFIXES = ['/shop', '/cart', '/checkout', '/orders', '/account', '/admin'];

function isEligibleRoute(pathname: string): boolean {
  return ELIGIBLE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function RouteLoadingGate() {
  const pathname = usePathname();
  const eligible = useMemo(() => isEligibleRoute(pathname), [pathname]);
  const [isMounted, setIsMounted] = useState(eligible);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!eligible) {
      setIsMounted(false);
      setIsLeaving(false);
      return;
    }

    const hasSeenLoader = window.sessionStorage.getItem(SESSION_KEY) === 'seen';
    if (hasSeenLoader) {
      setIsMounted(false);
      setIsLeaving(false);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minimumDuration = reducedMotion ? 180 : 560;
    const maximumDuration = reducedMotion ? 320 : 920;

    setIsMounted(true);
    setIsLeaving(false);
    document.documentElement.dataset.dlavieLoading = 'true';

    const beginExit = () => {
      window.sessionStorage.setItem(SESSION_KEY, 'seen');
      setIsLeaving(true);
    };

    const minimumTimer = window.setTimeout(beginExit, minimumDuration);
    const maximumTimer = window.setTimeout(beginExit, maximumDuration);

    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(maximumTimer);
      delete document.documentElement.dataset.dlavieLoading;
    };
  }, [eligible]);

  if (!isMounted) return null;

  return (
    <DlavieLoader
      isLeaving={isLeaving}
      onExited={() => {
        delete document.documentElement.dataset.dlavieLoading;
        setIsMounted(false);
      }}
    />
  );
}
