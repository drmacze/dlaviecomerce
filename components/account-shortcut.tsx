import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const hidden = ['/login', '/dashboard', '/reset-password', '/auth/confirmed'];

export function AccountShortcut() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (hidden.includes(router.pathname)) return null;

  if (router.pathname === '/ppob') {
    return (
      <a
        href="/"
        aria-label="Kembali ke beranda"
        className="fixed left-3 top-3 z-40 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#09090f]/80 text-lg font-black text-white shadow-[0_18px_50px_rgba(0,0,0,.35)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#dfff4f]/70 hover:text-[#dfff4f] md:left-5 md:top-5"
      >
        ←
      </a>
    );
  }

  return (
    <a
      href={signedIn ? '/dashboard' : '/login'}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-[#dfff4f] shadow-[0_18px_50px_rgba(15,23,42,.24)] ring-1 ring-white/30 transition hover:-translate-y-1"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dfff4f] text-xs text-slate-950">D</span>
      {signedIn ? 'Dashboard' : 'Login'}
    </a>
  );
}
