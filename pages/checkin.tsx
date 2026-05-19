import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function CheckInPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Login dulu untuk klaim L-Points.');
  const [busy, setBusy] = useState(false);

  useEffect(() => { const supabase = createSupabaseBrowserClient(); supabase.auth.getSession().then(({ data }) => { const t = data.session?.access_token || ''; setToken(t); setStatus(t ? 'Siap check-in hari ini.' : 'Login dulu untuk klaim L-Points.'); }); }, []);

  async function claim() {
    setBusy(true); setStatus('Memproses check-in...');
    const res = await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setStatus(res.ok ? `Berhasil klaim ${data.points} L-Points.` : data.error || 'Gagal check-in.');
    setBusy(false);
  }

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><p className="font-black uppercase tracking-[0.3em] text-emerald-700">LUMINA GAMIFICATION</p><h1 className="mt-3 text-4xl font-black">Daily Check-in</h1><p className="mt-3 font-semibold text-slate-600">Klaim 25 L-Points setiap hari.</p><button onClick={claim} disabled={!token || busy} className="mt-6 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">{busy ? 'Loading...' : 'Klaim Check-in'}</button><p className="mt-4 font-semibold">{status}</p><a className="mt-5 inline-block font-black text-emerald-700" href="/login">Login / Signup</a></section></main>;
}
