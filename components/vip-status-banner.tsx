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
  return <section className="dlavie-glass relative mx-auto mt-8 max-w-7xl overflow-hidden rounded-[2.5rem] p-7 md:p-8"><div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#dfff4f]/35 blur-3xl" /><p className="font-black uppercase tracking-[0.3em] text-slate-500">{active ? 'DLAVIE PREMIUM ACTIVE' : 'DLAVIE PREMIUM'}</p><h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">{active ? 'Premium Mode Aktif' : 'Unlock Soft Premium Mode'}</h2><p className="mt-3 max-w-2xl font-semibold leading-7 text-slate-600">{active ? 'Kamu mendapat akses benefit premium, booster D-Points, dan tema eksklusif.' : 'Buka Premium Center untuk melihat status, reward, dan benefit akun DLAVIE.'}</p><a className="mt-5 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1" href="/premium">Buka Premium Center</a></section>;
}
