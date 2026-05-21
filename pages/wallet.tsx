import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const amounts = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 500000, 750000, 1000000];
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function WalletPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState(50000);
  const [custom, setCustom] = useState('');
  const [pulse, setPulse] = useState(0);
  const [status, setStatus] = useState('Login dulu untuk topup otomatis.');
  const [loading, setLoading] = useState(false);
  const amount = Math.max(10000, Number(custom || selected || 0));

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setToken(session?.access_token || '');
      setEmail(session?.user.email || '');
      setStatus(session ? 'Pilih nominal, lalu lanjutkan pembayaran otomatis.' : 'Belum login. Masuk dulu agar topup punya user_id.');
    });
  }, []);

  function pick(value: number) {
    setSelected(value);
    setCustom('');
    setPulse(value);
    window.setTimeout(() => setPulse(0), 520);
  }

  async function pay() {
    if (!token) return setStatus('Login dulu sebelum topup otomatis.');
    setLoading(true);
    setStatus('Membuat transaksi Midtrans...');
    const res = await fetch('/api/wallet/topup-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setStatus(data.error || 'Gagal membuat transaksi Midtrans.');
    setStatus('Mengalihkan ke Midtrans...');
    window.location.href = data.redirect_url;
  }

  return <main className="min-h-screen overflow-hidden bg-[#f4f8ed] p-5 text-slate-950"><section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.6rem] bg-white/85 p-6 shadow-[0_35px_100px_rgba(15,23,42,.16)] ring-1 ring-black/5 md:p-10"><div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#dfff4f]/70 blur-3xl" /><div className="pointer-events-none absolute -left-20 bottom-28 h-60 w-60 rounded-full bg-cyan-300/25 blur-3xl" /><div className="relative grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><aside className="rounded-[2.2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.28)]"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">DLAVIE WALLET</p><h1 className="mt-4 text-5xl font-black leading-none tracking-tight md:text-6xl">Topup otomatis.</h1><p className="mt-4 text-lg font-bold leading-8 text-white/55">Pilih nominal topup dengan kartu 3D neon, bayar via Midtrans, lalu saldo masuk otomatis lewat webhook.</p><div className="mt-6 rounded-[1.7rem] bg-white/10 p-5 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-widest text-white/40">Account</p><p className="mt-2 break-all text-xl font-black">{email || 'Not logged in'}</p></div><div className="mt-5 grid grid-cols-2 gap-3"><a href="/login" className="rounded-full bg-white/10 px-5 py-4 text-center font-black text-white ring-1 ring-white/10">Login</a><a href="/" className="rounded-full bg-[#dfff4f] px-5 py-4 text-center font-black text-slate-950">Home</a></div></aside><section className="relative rounded-[2.2rem] bg-slate-950 p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,.22)] md:p-6"><div className="pointer-events-none absolute inset-x-10 top-8 h-28 rounded-full bg-[#dfff4f]/10 blur-3xl" /><div className="relative flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Topup Balance</p><h2 className="mt-2 text-3xl font-black tracking-tight">Pilih nominal</h2></div><span className="rounded-full bg-[#dfff4f] px-4 py-2 text-sm font-black text-slate-950">Min 10K</span></div><div className="relative mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">{amounts.map((value) => { const active = !custom && selected === value; return <button key={value} onClick={() => pick(value)} className={`group relative rounded-[1.45rem] p-[1px] transition duration-300 active:scale-95 ${pulse === value ? 'animate-pulse' : ''}`}><span className={`absolute inset-x-4 -bottom-1 h-5 rounded-full blur-xl transition duration-300 ${active ? 'bg-[#dfff4f]/80 opacity-100' : 'bg-cyan-300/25 opacity-40 group-hover:opacity-80'}`} /><span className={`relative block rounded-[1.4rem] px-4 py-5 text-left font-black shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_18px_35px_rgba(0,0,0,.28)] ring-1 transition duration-300 group-hover:-translate-y-1 ${active ? 'bg-[#dfff4f] text-slate-950 ring-[#dfff4f]/80' : 'bg-white/[.09] text-white ring-white/10 group-hover:bg-white/[.14] group-hover:ring-[#dfff4f]/35'}`}><span className="block text-lg">{rupiah(value)}</span><span className={`mt-1 block text-[11px] font-black uppercase tracking-widest ${active ? 'text-slate-600' : 'text-white/35'}`}>{active ? 'Selected' : 'Auto topup'}</span></span></button>; })}</div><div className="relative mt-4 rounded-[1.5rem] bg-white/[.08] p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#dfff4f]">Custom Nominal</p><input value={custom} onChange={(event) => setCustom(event.target.value.replace(/[^0-9]/g, ''))} className="mt-3 w-full rounded-full border border-white/10 bg-slate-950/60 p-4 font-black text-white outline-none transition placeholder:text-white/25 focus:ring-4 focus:ring-[#dfff4f]/20" placeholder="Isi nominal custom, min 10000" inputMode="numeric" /></div><button onClick={pay} disabled={loading || !token} className="relative mt-5 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_18px_45px_rgba(223,255,79,.22)] transition hover:-translate-y-1 disabled:opacity-50">{loading ? 'Membuat transaksi...' : `Bayar Otomatis ${rupiah(amount)}`}</button><p className="relative mt-4 rounded-[1.4rem] bg-white/10 p-4 text-sm font-bold leading-6 text-white/65 ring-1 ring-white/10">{status}</p></section></div></section></main>;
}
