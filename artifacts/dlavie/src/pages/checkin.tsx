import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function CheckInPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Login dulu untuk klaim D-Points.');
  const [busy, setBusy] = useState(false);

  useEffect(() => { const supabase = createSupabaseBrowserClient(); supabase.auth.getSession().then(({ data }) => { const t = data.session?.access_token || ''; setToken(t); setStatus(t ? 'Siap check-in hari ini.' : 'Login dulu untuk klaim D-Points.'); }); }, []);

  async function claim() {
    setBusy(true); setStatus('Memproses check-in...');
    const res = await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setStatus(res.ok ? `Berhasil klaim ${data.points} D-Points.` : data.error || 'Gagal check-in.');
    setBusy(false);
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass relative mx-auto max-w-xl overflow-hidden rounded-[2.5rem] p-6 md:p-8"><div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#dfff4f]/45 blur-3xl" /><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE REWARD</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Daily Check-in</h1><p className="mt-3 font-semibold leading-7 text-slate-600">Klaim 25 D-Points setiap hari. Streak reward dan scratch coupon akan masuk ke fase berikutnya.</p><button onClick={claim} disabled={!token || busy} className="mt-6 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Loading...' : 'Klaim Check-in'}</button><p className="mt-4 font-semibold text-slate-700">{status}</p><a className="mt-5 inline-flex rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/login">Login / Signup</a></section></main>;
}
