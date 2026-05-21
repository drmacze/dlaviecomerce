import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const hiddenRoutes = ['/login', '/dashboard', '/security', '/reset-password', '/auth/confirmed'];

export function AccountShortcut() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (hiddenRoutes.includes(router.pathname)) return null;

  return (
    <a
      href={isLoggedIn ? '/dashboard' : '/login'}
      className="fixed bottom-5 right-5 z-40 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-[#dfff4f] shadow-[0_18px_50px_rgba(15,23,42,.22)] ring-1 ring-white/40 transition hover:-translate-y-1"
    >
      {isLoggedIn ? 'Dashboard' : 'Login'}
    </a>
  );
}
