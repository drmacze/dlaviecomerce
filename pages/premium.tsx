import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

export default function PremiumPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState('Login untuk melihat status premium.');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal membaca profile.');
      setProfile(json.profile);
      setStatus('');
    });
  }, []);

  return <main className="min-h-screen p-6"><section className="dlavie-glass relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] p-7 md:p-10"><div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#dfff4f]/45 blur-3xl" /><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE PREMIUM</p><h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950">Premium Center</h1><p className="mt-4 max-w-2xl font-semibold leading-7 text-slate-600">Benefit: tema premium, D-Points booster, prioritas fitur AI, dan akses reward interaktif DLAVIE.</p><div className="mt-7 rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_22px_60px_rgba(15,23,42,.2)]"><p className="text-sm font-black uppercase tracking-widest text-white/50">Status</p><p className="mt-2 text-4xl font-black">{profile ? (profile.is_vip ? 'ACTIVE' : 'FREE') : status}</p></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="dlavie-soft-card rounded-[1.6rem] p-5"><p className="font-black">Soft Theme</p><p className="mt-2 text-sm font-semibold text-slate-500">Unlock visual premium dan aura avatar.</p></div><div className="dlavie-soft-card rounded-[1.6rem] p-5"><p className="font-black">D-Points Boost</p><p className="mt-2 text-sm font-semibold text-slate-500">Reward lebih besar dari pembelian dan misi.</p></div><div className="dlavie-soft-card rounded-[1.6rem] p-5"><p className="font-black">Priority AI</p><p className="mt-2 text-sm font-semibold text-slate-500">Asisten lebih cepat untuk produk digital.</p></div></div><div className="mt-7 flex flex-wrap gap-3"><a className="rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)]" href="/profile">Profile</a><a className="rounded-full bg-white/75 px-5 py-3 font-black shadow-sm ring-1 ring-black/5" href="/login">Login</a></div></section></main>;
}
