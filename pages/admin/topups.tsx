import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { WalletTransaction } from '@/lib/types';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
type Meta = { sender_name?: string; proof_note?: string; proof_image_data?: string; proof_image_name?: string; provider?: string; reviewed_by?: string; reviewed_at?: string; balance_before?: number; balance_after?: number };
const metaOf = (tx: WalletTransaction) => ((tx as any).metadata || {}) as Meta;
const badge = (s: string) => s === 'pending' ? 'bg-amber-100 text-amber-700' : s === 'approved' ? 'bg-green-100 text-green-700' : s === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';

export default function AdminTopups() {
  const [token, setToken] = useState('');
  const [topups, setTopups] = useState<WalletTransaction[]>([]);
  const [status, setStatus] = useState('Loading topups...');
  const [busy, setBusy] = useState('');

  async function load(nextToken = token) {
    if (!nextToken) return setStatus('Login sebagai admin dulu.');
    const res = await fetch(`/api/admin/topups?ts=${Date.now()}`, { cache: 'no-store', headers: { Authorization: `Bearer ${nextToken}`, 'Cache-Control': 'no-cache' } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(json.error || 'Gagal memuat topup.');
    setTopups(json.topups || []);
    setStatus('');
  }

  async function review(id: string, action: 'approve' | 'reject') {
    if (busy) return;
    setBusy(id);
    setStatus(`${action} topup...`);
    const res = await fetch('/api/admin/topups', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, action, review_note: 'reviewed from admin topups' }) });
    const json = await res.json().catch(() => ({}));
    setStatus(res.ok ? `Topup ${action} selesai. Data direfresh.` : json.error || 'Review gagal. Data direfresh.');
    await load(token);
    setBusy('');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      load(nextToken);
    });
  }, []);

  const pending = topups.filter((tx) => tx.status === 'pending');
  const processing = topups.filter((tx) => tx.status === 'processing');
  const approved = topups.filter((tx) => tx.status === 'approved');
  const pendingAmount = useMemo(() => pending.reduce((sum, tx) => sum + Number(tx.amount || 0), 0), [pending]);

  return <main className="min-h-screen p-4 md:p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.2rem] p-4 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Topup Review Center</h1><p className="mt-2 text-sm font-semibold text-slate-500">Data selalu direfresh dari server setelah approve/reject.</p></div><button onClick={() => load()} className="rounded-full bg-[#dfff4f] px-4 py-3 text-sm font-black text-slate-950">Refresh Data</button></div><div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-5"><div className="rounded-[1.35rem] bg-slate-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pending</p><p className="mt-2 text-3xl font-black">{pending.length}</p></div><div className="rounded-[1.35rem] bg-blue-100 p-4 text-blue-800"><p className="text-[10px] font-black uppercase tracking-widest">Processing</p><p className="mt-2 text-3xl font-black">{processing.length}</p></div><div className="rounded-[1.35rem] bg-[#dfff4f] p-4 text-slate-950"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending Amount</p><p className="mt-2 text-xl font-black">{rupiah(pendingAmount)}</p></div><div className="rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approved</p><p className="mt-2 text-3xl font-black">{approved.length}</p></div><div className="rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p><p className="mt-2 text-3xl font-black">{topups.length}</p></div></div>{status && <p className="mt-4 rounded-[1.1rem] bg-white/70 p-3 text-sm font-bold text-slate-600 ring-1 ring-black/5">{status}</p>}<div className="mt-5 grid gap-4">{topups.map((tx) => { const meta = metaOf(tx); const canReview = tx.status === 'pending'; return <article key={tx.id} className="rounded-[1.7rem] bg-white/80 p-4 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-center gap-2"><p className="text-2xl font-black">{rupiah(tx.amount)}</p><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${badge(String(tx.status))}`}>{tx.status}</span></div><p className="mt-2 break-all text-xs font-bold text-slate-500">User: {tx.user_id}</p><p className="mt-1 text-xs font-bold text-slate-400">{tx.provider || 'manual'} · {new Date(tx.created_at).toLocaleString('id-ID')}</p><p className="mt-1 break-all text-xs font-bold text-slate-400">Ref: {tx.reference || '-'}</p><div className="mt-3 rounded-[1.35rem] bg-slate-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">Payment Proof</p><p className="mt-1 text-sm font-black">{meta.sender_name || 'Belum ada nama pengirim'}</p><p className="mt-3 rounded-[1rem] bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70 ring-1 ring-white/10">{meta.proof_note || 'Tidak ada catatan.'}</p>{meta.proof_image_data && <a href={meta.proof_image_data} target="_blank" rel="noreferrer" className="mt-3 block rounded-[1.1rem] bg-white/10 p-2 ring-1 ring-white/10"><img src={meta.proof_image_data} alt={meta.proof_image_name || 'Bukti pembayaran'} className="max-h-64 w-full rounded-[.9rem] object-contain" /></a>}{meta.balance_before !== undefined && <p className="mt-2 text-xs font-bold text-white/45">Before: {rupiah(meta.balance_before)} · After: {rupiah(meta.balance_after || 0)}</p>}{meta.reviewed_by && <p className="mt-2 text-xs font-bold text-white/45">Reviewed: {meta.reviewed_by}</p>}</div>{canReview ? <div className="mt-4 flex gap-2"><button disabled={Boolean(busy)} onClick={() => review(tx.id, 'approve')} className="rounded-full bg-[#dfff4f] px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy === tx.id ? 'Processing...' : 'Approve'}</button><button disabled={Boolean(busy)} onClick={() => review(tx.id, 'reject')} className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50">Reject</button></div> : <p className="mt-4 rounded-[1.1rem] bg-slate-100 p-3 text-xs font-bold text-slate-500">Action ditutup. Status transaksi: {String(tx.status).toUpperCase()}.</p>}</article>; })}</div></section></main>;
}
