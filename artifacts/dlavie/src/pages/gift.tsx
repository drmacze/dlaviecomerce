import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function GiftPage() {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Login dulu untuk mengirim D-Points.');
  const [busy, setBusy] = useState(false);

  async function sendGift() {
    setBusy(true);
    setStatus('Mengirim gift...');
    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setBusy(false);
      return setStatus('Login dulu sebelum mengirim gift.');
    }
    const res = await fetch('/api/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ receiverEmail, amount })
    });
    const data = await res.json();
    setStatus(res.ok ? `Berhasil kirim ${data.points} D-Points ke ${data.receiver}.` : data.error || 'Gagal mengirim gift.');
    setBusy(false);
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-xl overflow-hidden rounded-[2.5rem] p-6 md:p-8"><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE GIFTING</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Kirim D-Points</h1><p className="mt-3 font-semibold leading-7 text-slate-600">Hadiahkan poin ke user lain memakai email akun DLAVIE mereka.</p><input value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} className="mt-5 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email penerima" type="email" /><input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Jumlah D-Points" type="number" /><button onClick={sendGift} disabled={busy || !receiverEmail || !amount} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Mengirim...' : 'Kirim Gift'}</button><p className="mt-4 font-semibold text-slate-700">{status}</p><div className="mt-6 flex flex-wrap gap-3"><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/profile">Profile</a><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/login">Login</a></div></section></main>;
}
