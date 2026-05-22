import { useState } from 'react';

type Props = { token: string; amount: number; onStatus: (message: string) => void };
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export function AutomaticTopupCard({ token, amount, onStatus }: Props) {
  const [loading, setLoading] = useState(false);

  async function start() {
    if (!token) return onStatus('Login dulu untuk topup otomatis.');
    setLoading(true);
    onStatus('Membuat transaksi otomatis...');
    const res = await fetch('/api/wallet/topup-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return onStatus(data.error || 'Topup otomatis gagal dibuat.');
    onStatus('Mengalihkan ke halaman pembayaran...');
    window.location.href = data.redirect_url;
  }

  return (
    <section className="relative mt-3 overflow-hidden rounded-[1.6rem] bg-[#dfff4f] p-3 text-slate-950 shadow-[0_0_48px_rgba(223,255,79,.18)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/50 blur-2xl" />
      <div className="relative grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-sm font-black text-[#dfff4f] shadow-[0_10px_28px_rgba(15,23,42,.22)]">⚡</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">Auto Gateway</p>
              <h3 className="text-lg font-black leading-tight tracking-tight">{rupiah(amount)}</h3>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['Unique ID', 'Webhook', 'Auto Sync'].map((item) => <span key={item} className="rounded-full bg-slate-950/10 px-2 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-700">{item}</span>)}
          </div>
        </div>
        <button onClick={start} disabled={loading} className="group relative overflow-hidden rounded-[1.2rem] bg-slate-950 px-5 py-4 text-sm font-black text-[#dfff4f] shadow-[0_18px_38px_rgba(15,23,42,.24)] transition hover:-translate-y-1 disabled:opacity-60 sm:min-w-[11rem]">
          <span className="absolute inset-y-0 -left-10 w-10 rotate-12 bg-white/20 transition duration-500 group-hover:left-[120%]" />
          <span className="relative">{loading ? 'Creating...' : 'Pay Now →'}</span>
        </button>
      </div>
      <p className="relative mt-3 rounded-[1.05rem] bg-white/35 p-3 text-xs font-bold leading-5 text-slate-700">Saldo bertambah otomatis setelah pembayaran sukses dan webhook Midtrans terverifikasi.</p>
    </section>
  );
}