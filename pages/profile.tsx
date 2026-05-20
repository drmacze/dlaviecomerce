import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

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

  const name = profile?.display_name || profile?.email?.split('@')[0] || 'Dlavier';
  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] p-6 md:p-8"><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE PROFILE</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">{profile ? `${greeting()}, ${name}` : 'Akun Saya'}</h1>{status && <p className="mt-4 font-semibold text-slate-600">{status}</p>}{profile && <div className="mt-6 space-y-4"><div className="dlavie-soft-card rounded-[1.6rem] p-4"><p className="text-sm font-black uppercase tracking-widest text-slate-400">Email</p><p className="break-all font-black text-slate-950">{profile.email}</p></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-[1.6rem] bg-[#dfff4f] p-5 shadow-[0_14px_38px_rgba(120,150,45,.16)]"><p className="text-sm font-black uppercase tracking-widest text-slate-600">D-Points</p><p className="mt-2 text-4xl font-black text-slate-950">{profile.l_points}</p></div><div className="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-[0_14px_38px_rgba(15,23,42,.18)]"><p className="text-sm font-black uppercase tracking-widest text-white/50">Premium</p><p className="mt-2 text-4xl font-black">{profile.is_vip ? 'ON' : 'OFF'}</p></div></div></div>}<div className="mt-6 flex flex-wrap gap-3"><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5" href="/checkin">Daily Check-in</a><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/orders">Orders</a><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/gift">Gift</a><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/login">Login</a></div></section></main>;
}
