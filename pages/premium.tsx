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

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-3xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><p className="font-black uppercase tracking-[0.3em] text-emerald-700">LUMINA PREMIUM</p><h1 className="mt-3 text-4xl font-black">Premium Center</h1><p className="mt-3 font-semibold text-slate-600">Benefit: tema premium, poin booster, dan prioritas fitur AI.</p><div className="mt-6 rounded-2xl border-2 border-slate-900 bg-amber-100 p-5"><p className="text-sm font-black uppercase tracking-widest text-slate-500">Status</p><p className="mt-2 text-3xl font-black">{profile ? (profile.is_vip ? 'ACTIVE' : 'FREE') : status}</p></div><div className="mt-6 flex flex-wrap gap-3"><a className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm" href="/profile">Profile</a><a className="rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-black shadow-brutal-sm" href="/login">Login</a></div></section></main>;
}
