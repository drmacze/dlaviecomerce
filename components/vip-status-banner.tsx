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

  const vip = profile?.is_vip;
  return <section className={`mx-auto mt-8 max-w-6xl rounded-[2rem] border-2 border-slate-900 p-8 shadow-brutal ${vip ? 'bg-amber-300 text-slate-950' : 'bg-slate-950 text-white'}`}><p className="font-black uppercase tracking-[0.3em]">{vip ? 'VIP ACTIVE' : 'LUMINA VIP'}</p><h2 className="mt-3 text-4xl font-black">{vip ? 'Sultan Mode Aktif' : 'Unlock Sultan Mode'}</h2><p className="mt-3 max-w-2xl font-semibold">{vip ? 'Kamu mendapat akses benefit VIP, booster, dan tema premium.' : 'Login dan aktifkan VIP untuk benefit eksklusif LUMINA.'}</p><a className="mt-5 inline-block rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black text-slate-950 shadow-brutal-sm" href="/premium">Premium Center</a></section>;
}
