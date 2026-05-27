import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const privatePrefixes = [
  '/dashboard',
  '/profile',
  '/wallet',
  '/orders',
  '/checkout',
  '/download',
  '/downloads',
  '/rewards',
  '/checkin',
  '/gift',
  '/security',
  '/ai/history',
  '/admin'
];

function needsAuth(pathname: string) {
  return privatePrefixes.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

export function AuthRouteGuard({ children, onCheckingChange }: { children: ReactNode; onCheckingChange?: (checking: boolean) => void }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    let active = true;
    const privateRoute = needsAuth(router.pathname);

    if (!privateRoute) {
      setAllowed(true);
      onCheckingChange?.(false);
      return;
    }

    setAllowed(false);
    onCheckingChange?.(true);

    createSupabaseBrowserClient().auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace('/login?next=' + encodeURIComponent(router.asPath));
        return;
      }
      setAllowed(true);
      onCheckingChange?.(false);
    }).catch(() => {
      if (!active) return;
      router.replace('/login?next=' + encodeURIComponent(router.asPath));
    });

    return () => {
      active = false;
    };
  }, [router.isReady, router.pathname, router.asPath]);

  if (!allowed) return null;
  return <>{children}</>;
}
