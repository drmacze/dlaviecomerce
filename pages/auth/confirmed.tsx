import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AuthConfirmedPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Memverifikasi sesi email...');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setStatus('Email berhasil dibuka. Jika sesi belum aktif, silakan login kembali.');
        return;
      }
      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ device: navigator.userAgent.slice(0, 90) })
      }).catch(() => null);
      setStatus('Email terkonfirmasi. Mengalihkan ke Security Center...');
      window.setTimeout(() => router.push('/security'), 900);
    });
  }, [router]);

  return <main className="min-h-screen overflow-hidden p-6"><div className="pointer-events-none fixed inset-0 -z-10"><div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#dfff4f]/25 blur-3xl" /><div className="absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full bg-[#75b3e5]/25 blur-3xl" /></div><section className="dlavie-glass dlavie-edge-flow mx-auto mt-16 max-w-xl overflow-hidden rounded-[2.5rem] p-7 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-slate-950 text-3xl font-black text-[#dfff4f] shadow-inner">D</div><p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE AUTH</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Email confirmation</h1><p className="mt-4 font-semibold leading-7 text-slate-600">{status}</p><div className="mt-6 flex justify-center gap-2"><a className="rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/security">Security Center</a><a className="rounded-full bg-white/75 px-5 py-3 font-black shadow-sm ring-1 ring-black/5" href="/login">Login</a></div></section></main>;
}
