import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function GiftPage() {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Login dulu untuk mengirim L-Points.');
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
    setStatus(res.ok ? `Berhasil kirim ${data.points} L-Points ke ${data.receiver}.` : data.error || 'Gagal mengirim gift.');
    setBusy(false);
  }

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><p className="font-black uppercase tracking-[0.3em] text-emerald-700">LUMINA GIFTING</p><h1 className="mt-3 text-4xl font-black">Kirim L-Points</h1><p className="mt-3 font-semibold text-slate-600">Hadiahkan poin ke user lain memakai email akun LUMINA mereka.</p><input value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} className="mt-5 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Email penerima" type="email" /><input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Jumlah L-Points" type="number" /><button onClick={sendGift} disabled={busy || !receiverEmail || !amount} className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">{busy ? 'Mengirim...' : 'Kirim Gift'}</button><p className="mt-4 font-semibold">{status}</p><div className="mt-6 flex flex-wrap gap-3"><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/profile">Profile</a><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/login">Login</a></div></section></main>;
}
