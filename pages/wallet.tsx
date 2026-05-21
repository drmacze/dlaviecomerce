import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const amounts = [25000, 50000, 100000, 250000];
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function WalletTestPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState(50000);
  const [status, setStatus] = useState('Login dulu untuk test topup otomatis.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setToken(session?.access_token || '');
      setEmail(session?.user.email || '');
      setStatus(session ? 'Pilih nominal lalu klik Bayar Otomatis.' : 'Belum login. Masuk dulu agar topup punya user_id.');
    });
  }, []);

  async function pay() {
    if (!token) return setStatus('Login dulu sebelum topup otomatis.');
    setLoading(true);
    setStatus('Membuat transaksi Midtrans...');
    const res = await fetch('/api/wallet/topup-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount: selected })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setStatus(data.error || 'Gagal membuat transaksi Midtrans.');
    setStatus('Mengalihkan ke Midtrans...');
    window.location.href = data.redirect_url;
  }

  return <main className="min-h-screen bg-[#f4f7ef] p-6 text-slate-950"><section className="mx-auto max-w-xl rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">DLAVIE WALLET TEST</p><h1 className="mt-3 text-4xl font-black tracking-tight">Topup Otomatis</h1><p className="mt-3 font-semibold leading-7 text-slate-500">Halaman production sementara untuk test Midtrans Snap dan webhook otomatis.</p><div className="mt-5 rounded-[1.5rem] bg-slate-950 p-4 text-white"><p className="text-sm font-bold text-white/55">Account</p><p className="mt-1 break-all font-black">{email || 'Not logged in'}</p></div><div className="mt-5 grid grid-cols-2 gap-3">{amounts.map((amount) => <button key={amount} onClick={() => setSelected(amount)} className={`rounded-[1.4rem] p-4 text-left font-black ring-1 ring-black/5 transition ${selected === amount ? 'bg-[#dfff4f] text-slate-950' : 'bg-white text-slate-950'}`}>{rupiah(amount)}</button>)}</div><button onClick={pay} disabled={loading || !token} className="mt-5 w-full rounded-full bg-slate-950 px-5 py-4 font-black text-[#dfff4f] disabled:opacity-50">{loading ? 'Membuat transaksi...' : `Bayar Otomatis ${rupiah(selected)}`}</button><p className="mt-4 rounded-[1.4rem] bg-slate-100 p-4 text-sm font-bold leading-6 text-slate-600">{status}</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><a href="/login" className="rounded-full bg-white px-4 py-3 text-center font-black ring-1 ring-black/5">Login</a><a href="/" className="rounded-full bg-[#dfff4f] px-4 py-3 text-center font-black text-slate-950">Home</a></div></section></main>;
}
