import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

export function VipStatusBanner() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setProfile(json.profile);
    });
  }, []);

  const active = profile?.is_vip;
  return <section className={`mx-auto mt-8 max-w-6xl rounded-[2rem] border-2 border-slate-900 p-8 shadow-brutal ${active ? 'bg-amber-300 text-slate-950' : 'bg-slate-950 text-white'}`}><p className="font-black uppercase tracking-[0.3em]">{active ? 'PREMIUM ACTIVE' : 'LUMINA PREMIUM'}</p><h2 className="mt-3 text-4xl font-black">{active ? 'Premium Mode Aktif' : 'Unlock Premium Mode'}</h2><p className="mt-3 max-w-2xl font-semibold">{active ? 'Kamu mendapat akses benefit premium, booster, dan tema eksklusif.' : 'Buka Premium Center untuk melihat status dan benefit akun LUMINA.'}</p><a className={`mt-5 inline-block rounded-xl border-2 border-slate-900 px-5 py-3 font-black shadow-brutal-sm ${active ? 'bg-white text-slate-950' : 'bg-emerald-400 text-slate-950'}`} href="/premium">Buka Premium Center</a></section>;
}
