import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { WalletTransaction } from '@/lib/types';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

type TopupMeta = {
  provider?: string;
  sender_name?: string;
  proof_note?: string;
  submitted_at?: string;
  reviewed_by?: string;
  review_note?: string;
};

function metaOf(tx: WalletTransaction): TopupMeta {
  return ((tx as any).metadata || {}) as TopupMeta;
}

export default function AdminTopups() {
  const [token, setToken] = useState('');
  const [topups, setTopups] = useState<WalletTransaction[]>([]);
  const [status, setStatus] = useState('Loading topups...');
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/topups', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat topup.');
    setTopups(json.topups || []);
    setStatus('');
  }

  async function review(id: string, action: 'approve' | 'reject') {
    setStatus(`${action} topup...`);
    const res = await fetch('/api/admin/topups', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, action, review_note: notes[id] || '' }) });
    const json = await res.json();
    setStatus(res.ok ? `Topup ${action} berhasil.` : json.error || 'Review gagal.');
    await load();
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (!nextToken) return setStatus('Login sebagai admin dulu.');
      load(nextToken);
    });
  }, []);

  const pending = topups.filter((tx) => tx.status === 'pending');
  const approved = topups.filter((tx) => tx.status === 'approved');
  const totalPending = useMemo(() => pending.reduce((sum, tx) => sum + Number(tx.amount || 0), 0), [pending]);

  return <main className="min-h-screen p-4 md:p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.2rem] p-4 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Topup Review Center</h1><p className="mt-2 text-sm font-semibold text-slate-500">Review bukti manual topup sebelum menambah D-Balance user.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 text-sm font-black ring-1 ring-black/5" href="/admin">Products</a><a className="rounded-full bg-white/75 px-4 py-3 text-sm font-black ring-1 ring-black/5" href="/admin/users">Users</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 text-sm font-black text-slate-950" href="/admin/referrals">Referrals</a></div></div><div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4"><div className="rounded-[1.35rem] bg-slate-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pending</p><p className="mt-2 text-3xl font-black">{pending.length}</p></div><div className="rounded-[1.35rem] bg-[#dfff4f] p-4 text-slate-950"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</p><p className="mt-2 text-xl font-black">{rupiah(totalPending)}</p></div><div className="rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approved</p><p className="mt-2 text-3xl font-black">{approved.length}</p></div><div className="rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p><p className="mt-2 text-3xl font-black">{topups.length}</p></div></div>{status && <p className="mt-4 rounded-[1.1rem] bg-white/70 p-3 text-sm font-bold text-slate-600 ring-1 ring-black/5">{status}</p>}<div className="mt-5 grid gap-4">{topups.map((tx) => { const meta = metaOf(tx); const isPending = tx.status === 'pending'; return <article key={tx.id} className="rounded-[1.7rem] bg-white/80 p-4 shadow-sm ring-1 ring-black/5"><div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]"><div><div className="flex flex-wrap items-center gap-2"><p className="text-2xl font-black">{rupiah(tx.amount)}</p><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : tx.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{tx.status}</span></div><p className="mt-2 break-all text-xs font-bold text-slate-500">User: {tx.user_id}</p><p className="mt-1 text-xs font-bold text-slate-400">{tx.provider || 'manual'} · {new Date(tx.created_at).toLocaleString('id-ID')}</p><p className="mt-1 break-all text-xs font-bold text-slate-400">Ref: {tx.reference || '-'}</p></div><div className="rounded-[1.35rem] bg-slate-950 p-4 text-white"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">Payment Proof</p><p className="mt-1 text-sm font-black">{meta.sender_name || 'Belum ada nama pengirim'}</p></div><span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60">{meta.provider || tx.provider || 'manual'}</span></div><p className="mt-3 rounded-[1rem] bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70 ring-1 ring-white/10">{meta.proof_note || 'Tidak ada catatan bukti pembayaran.'}</p>{meta.submitted_at && <p className="mt-2 text-[10px] font-bold text-white/35">Submitted: {new Date(meta.submitted_at).toLocaleString('id-ID')}</p>}{meta.reviewed_by && <p className="mt-2 text-[10px] font-bold text-white/35">Reviewed by: {meta.reviewed_by}</p>}{meta.review_note && <p className="mt-2 text-[10px] font-bold text-white/45">Note: {meta.review_note}</p>}</div></div>{isPending && <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><input value={notes[tx.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [tx.id]: event.target.value }))} className="rounded-full bg-slate-100 px-4 py-3 text-sm font-bold outline-none ring-1 ring-black/5" placeholder="Catatan admin opsional: bukti valid / kurang jelas / salah nominal" /><div className="flex gap-2"><button onClick={() => review(tx.id, 'approve')} className="rounded-full bg-[#dfff4f] px-4 py-3 text-sm font-black text-slate-950">Approve</button><button onClick={() => review(tx.id, 'reject')} className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white">Reject</button></div></div>}</article>; })}{!topups.length && <div className="rounded-[2rem] bg-white/75 p-8 font-bold text-slate-500 ring-1 ring-black/5">Belum ada topup.</div>}</div></section></main>;
}