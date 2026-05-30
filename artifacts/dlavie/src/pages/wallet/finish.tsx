import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function WalletFinishPage() {
  const router = useRouter();
  const orderId = String(router.query.order_id || router.query.orderId || '');
  const amount = Number(router.query.amount || 0);
  const status = String(router.query.transaction_status || router.query.status || 'processing');
  const [syncStatus, setSyncStatus] = useState('Menunggu data transaksi...');
  const [verified, setVerified] = useState(false);
  const success = verified || ['settlement', 'capture', 'success', 'paid'].includes(status);

  useEffect(() => {
    if (!router.isReady || !orderId) return;
    let alive = true;
    async function verify() {
      setSyncStatus('Mengecek status pembayaran ke Midtrans...');
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (alive) setSyncStatus('Login ulang diperlukan untuk sinkron saldo otomatis.');
        return;
      }
      const res = await fetch('/api/wallet/verify-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: orderId })
      });
      const json = await res.json().catch(() => ({}));
      if (!alive) return;
      if (!res.ok) return setSyncStatus(json.error || 'Verifikasi pembayaran gagal.');
      if (json.status === 'approved') {
        setVerified(true);
        setSyncStatus('Saldo berhasil disinkronkan ke D-Balance.');
      } else if (json.status === 'rejected') {
        setSyncStatus('Pembayaran ditolak / gagal menurut gateway.');
      } else {
        setSyncStatus(`Status gateway: ${json.status || 'pending'}. Coba refresh beberapa detik lagi.`);
      }
    }
    verify();
    return () => { alive = false; };
  }, [router.isReady, orderId]);

  return <main className="min-h-screen overflow-hidden bg-[#f4f8ed] p-4 text-slate-950"><div className="pointer-events-none fixed inset-0 -z-10"><div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#dfff4f]/30 blur-3xl" /><div className="absolute -right-24 top-32 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" /><div className="absolute inset-0 dlavie-grid-bg opacity-35" /></div><section className="mx-auto grid min-h-[92vh] max-w-5xl items-center gap-5 lg:grid-cols-[.85fr_1.15fr]"><aside className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-[0_28px_90px_rgba(15,23,42,.28)] md:p-7"><div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#dfff4f]/18 blur-3xl" /><p className="relative text-[10px] font-black uppercase tracking-[0.28em] text-[#dfff4f]">DLAVIE RECEIPT</p><h1 className="relative mt-3 text-4xl font-black leading-none tracking-tight md:text-5xl">{success ? 'Payment synced.' : 'Payment processing.'}</h1><p className="relative mt-4 text-sm font-semibold leading-6 text-white/58">Halaman ini sekarang mengecek status Midtrans langsung. Jika webhook terlambat, sistem tetap bisa menambahkan saldo melalui verifikasi fallback.</p><div className="relative mx-auto mt-7 grid h-44 w-44 place-items-center rounded-full bg-white/10 ring-1 ring-white/10"><div className="absolute inset-3 rounded-full border-2 border-[#dfff4f]/25" /><div className="absolute inset-7 rounded-full border border-white/10" /><div className="grid h-28 w-28 place-items-center rounded-full bg-[#dfff4f] text-slate-950 shadow-[0_0_55px_rgba(223,255,79,.35)]"><span className="text-4xl font-black">{success ? '✓' : '…'}</span></div></div></aside><section className="relative"><div className="absolute inset-x-6 top-4 h-20 rounded-t-[2rem] bg-slate-900/20 blur-sm" /><article className="relative overflow-hidden rounded-[2.2rem] bg-white p-5 shadow-[0_26px_80px_rgba(15,23,42,.16)] ring-1 ring-black/5 md:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Receipt Card</p><h2 className="mt-1 text-2xl font-black tracking-tight">Topup D-Balance</h2></div><span className="rounded-full bg-[#dfff4f] px-3 py-2 text-xs font-black text-slate-950">{success ? 'SYNCED' : 'VERIFY'}</span></div><div className="mt-5 grid gap-3"><div className="rounded-[1.4rem] bg-slate-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-widest text-white/35">Amount</p><p className="mt-1 text-3xl font-black text-[#dfff4f]">{amount ? rupiah(amount) : '-'}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[1.3rem] bg-slate-100 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p><p className="mt-1 text-lg font-black">{success ? 'Approved' : status}</p></div><div className="rounded-[1.3rem] bg-slate-100 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync</p><p className="mt-1 text-lg font-black">Webhook + Verify</p></div></div><div className="rounded-[1.3rem] bg-slate-100 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</p><p className="mt-1 break-all text-sm font-black text-slate-700">{orderId || 'Waiting data'}</p></div><p className="rounded-[1.2rem] bg-[#dfff4f] p-3 text-sm font-black leading-5 text-slate-950">{syncStatus}</p></div><div className="mt-5 grid grid-cols-2 gap-3"><a href="/wallet" className="rounded-full bg-[#dfff4f] px-4 py-3 text-center text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(223,255,79,.22)] transition hover:-translate-y-1">Refresh Wallet</a><a href="/orders" className="rounded-full bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:-translate-y-1">Orders</a><a href="/dashboard" className="rounded-full bg-white px-4 py-3 text-center text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1">Dashboard</a><a href="/wallet#wallet-panel" className="rounded-full bg-white px-4 py-3 text-center text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1">Topup Lagi</a></div></article></section></section></main>;
}
