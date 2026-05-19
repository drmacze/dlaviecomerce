import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState('Loading profile...');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return setStatus('Login dulu untuk melihat profil.');
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal membaca profil.');
      setProfile(json.profile);
      setStatus('');
    });
  }, []);

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><p className="font-black uppercase tracking-[0.3em] text-emerald-700">LUMINA PROFILE</p><h1 className="mt-3 text-4xl font-black">Akun Saya</h1>{status && <p className="mt-4 font-semibold text-slate-600">{status}</p>}{profile && <div className="mt-6 space-y-4"><div className="rounded-2xl border-2 border-slate-900 p-4"><p className="text-sm font-black uppercase tracking-widest text-slate-500">Email</p><p className="font-black">{profile.email}</p></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border-2 border-slate-900 bg-emerald-50 p-4"><p className="text-sm font-black uppercase tracking-widest text-slate-500">L-Points</p><p className="text-3xl font-black">{profile.l_points}</p></div><div className="rounded-2xl border-2 border-slate-900 bg-amber-50 p-4"><p className="text-sm font-black uppercase tracking-widest text-slate-500">VIP</p><p className="text-3xl font-black">{profile.is_vip ? 'ON' : 'OFF'}</p></div></div></div>}<div className="mt-6 flex flex-wrap gap-3"><a className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-2 font-black shadow-brutal-sm" href="/checkin">Daily Check-in</a><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/login">Login</a></div></section></main>;
}
