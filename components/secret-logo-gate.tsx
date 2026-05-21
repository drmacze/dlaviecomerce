import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export function SecretLogoGate() {
  const [clicks, setClicks] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const open = clicks >= 5;

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

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        onClick={() => setClicks(clicks + 1)}
        className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black tracking-tight text-[#dfff4f] shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5"
      >
        DLAVIE
      </button>

      <a
        className="rounded-full bg-white/75 px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white"
        href={isLoggedIn ? '/dashboard' : '/login'}
      >
        {isLoggedIn ? 'Dashboard' : 'Login'}
      </a>

      {open && (
        <a className="rounded-full bg-[#dfff4f] px-3 py-2 text-xs font-black text-slate-950 shadow-sm" href="/admin">
          Secret Admin
        </a>
      )}
    </div>
  );
}
