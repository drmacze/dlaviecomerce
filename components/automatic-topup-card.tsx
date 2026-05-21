import { useState } from 'react';

type Props = { token: string; amount: number; onStatus: (message: string) => void };

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
    <section className="mt-5 rounded-[2rem] bg-[#dfff4f] p-4 text-slate-950 shadow-[0_0_48px_rgba(223,255,79,.16)]">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">Topup Otomatis</p>
      <h3 className="mt-1 text-2xl font-black tracking-tight">Bayar otomatis, saldo masuk otomatis.</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">Sistem membuat transaksi unik. Setelah pembayaran sukses, webhook menambah saldo D-Balance.</p>
      <button onClick={start} disabled={loading} className="mt-4 w-full rounded-full bg-slate-950 px-5 py-4 font-black text-[#dfff4f] transition hover:-translate-y-1 disabled:opacity-60">
        {loading ? 'Membuat transaksi...' : `Bayar Otomatis Rp ${amount.toLocaleString('id-ID')}`}
      </button>
    </section>
  );
}
