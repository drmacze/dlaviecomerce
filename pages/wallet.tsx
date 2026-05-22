import { useEffect, useMemo, useState } from 'react';
import { AutomaticTopupCard } from '@/components/automatic-topup-card';
import { DlavieCompactPage } from '@/components/dlavie-compact-page';
import { NeonAmountSelector } from '@/components/neon-amount-selector';
import { TopupPaymentMethods } from '@/components/topup-payment-methods';
import { WalletStackDrawer } from '@/components/wallet-stack-drawer';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type WalletData = { d_balance?: number; d_points?: number; vip_level?: string };
type Tx = { id: string; type: string; amount: number; status: string; provider?: string | null; reference?: string | null };
const rupiah = (v = 0) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

export default function WalletPage() {
  const [token, setToken] = useState('');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [selected, setSelected] = useState(50000);
  const [custom, setCustom] = useState('');
  const [status, setStatus] = useState('Login untuk sinkron D-Balance.');
  const amount = Math.max(10000, Number(custom || selected || 0));

  async function load(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/wallet', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal membaca wallet.');
    setWallet(json.wallet);
    setTransactions(json.transactions || []);
    setStatus('Wallet tersinkron dengan Supabase.');
  }

  async function manualTopup() {
    if (!token) return setStatus('Login dulu sebelum topup.');
    setStatus('Membuat topup pending manual...');
    const res = await fetch('/api/wallet', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount, provider: 'manual-payment' }) });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Topup gagal dibuat.');
    setTransactions((items) => [json.transaction, ...items]);
    setStatus('Topup pending dibuat. Bayar via BRI, Dana, Gopay, atau QRIS lalu tunggu approve admin.');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
    });
  }, []);

  const rewardTotal = useMemo(() => transactions.filter((tx) => tx.type === 'reward').reduce((sum, tx) => sum + Number(tx.amount || 0), 0), [transactions]);
  const purchases = transactions.filter((tx) => tx.type === 'purchase').length;
  const latest = transactions.slice(0, 5);

  const activityContent = <div className="rounded-[1.35rem] bg-white/[.08] p-3 ring-1 ring-white/10"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Latest Activity</p><div className="mt-3 space-y-2">{latest.length ? latest.map((tx) => <div key={tx.id} className="rounded-[1.05rem] bg-white/10 p-3 text-sm font-bold ring-1 ring-white/10"><div className="flex items-center justify-between gap-2"><span>{tx.type === 'topup' && tx.provider === 'midtrans' ? 'Auto Topup' : tx.type}</span><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase text-[#dfff4f]">{tx.status}</span></div><p className="mt-1 text-white/50">{tx.type === 'reward' ? `+${tx.amount} pts` : rupiah(tx.amount)}</p>{tx.reference && <p className="mt-1 break-all text-[11px] text-white/35">{tx.reference}</p>}</div>) : <p className="rounded-[1.1rem] bg-white/10 p-4 text-sm font-bold text-white/50">Belum ada aktivitas wallet.</p>}</div></div>;

  return <DlavieCompactPage eyebrow="DLAVIE WALLET" title="Rotary wallet." description="Pilih nominal lewat dial, buka metode bayar dari kartu bertumpuk, lalu sinkron otomatis via webhook." metrics={[{ label: 'Balance', value: rupiah(wallet?.d_balance || 0), hint: 'D-Balance' }, { label: 'D-Points', value: String(wallet?.d_points || 0), hint: `${rewardTotal} earned` }, { label: 'VIP', value: wallet?.vip_level || 'free', hint: 'Reward tier' }, { label: 'Orders', value: String(purchases), hint: 'Purchases' }]} actions={[{ label: 'Orders', href: '/orders' }, { label: 'Downloads', href: '/downloads' }, { label: 'Topup', href: '#wallet-panel', primary: true }]}><div id="wallet-panel" className="grid gap-4 lg:grid-cols-[.96fr_1.04fr]"><section className="relative overflow-hidden rounded-[1.7rem] bg-slate-950 p-3 text-white shadow-[0_24px_70px_rgba(15,23,42,.22)] md:p-5"><div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dfff4f]/20 blur-3xl" /><div className="pointer-events-none absolute bottom-12 left-8 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" /><div className="relative flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">Wallet Control</p><h2 className="mt-1 text-2xl font-black tracking-tight">{rupiah(amount)}</h2></div><span className="rounded-full bg-[#dfff4f] px-3 py-2 text-[10px] font-black text-slate-950">Min 10K</span></div><WalletStackDrawer items={[{ id: 'topup', label: 'Auto', title: 'Rotary Topup', content: <div><NeonAmountSelector selected={selected} custom={custom} onPick={(value) => { setSelected(value); setCustom(''); }} onCustom={setCustom} /><AutomaticTopupCard token={token} amount={amount} onStatus={setStatus} /></div> }, { id: 'manual', label: 'Pay', title: 'Manual Methods', content: <TopupPaymentMethods selectedAmount={amount} status={status} onCreateTopup={manualTopup} /> }, { id: 'activity', label: 'Logs', title: 'Wallet Activity', content: activityContent }]} /><p className="relative mt-3 rounded-[1.2rem] bg-white/10 p-3 text-xs font-bold leading-5 text-white/60 ring-1 ring-white/10">{status}</p></section><section className="grid gap-3"><div className="dlavie-soft-card rounded-[1.45rem] p-4"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Quick Actions</p><div className="mt-3 grid grid-cols-2 gap-2"><a href="/orders" className="rounded-[1.05rem] bg-slate-950 p-3 text-sm font-black text-white transition hover:-translate-y-1">Orders</a><a href="/downloads" className="rounded-[1.05rem] bg-[#dfff4f] p-3 text-sm font-black text-slate-950 transition hover:-translate-y-1">Downloads</a><a href="/security" className="rounded-[1.05rem] bg-white p-3 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1">Security</a><a href="/rewards" className="rounded-[1.05rem] bg-white p-3 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1">Rewards</a></div></div><div className="dlavie-soft-card rounded-[1.45rem] p-4"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Reward Engine</p><div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-[1rem] bg-[#dfff4f] p-3 text-xs font-black text-slate-950">Points</div><div className="rounded-[1rem] bg-white p-3 text-xs font-bold shadow-sm">VIP</div><div className="rounded-[1rem] bg-white p-3 text-xs font-bold shadow-sm">Logs</div></div></div></section></div></DlavieCompactPage>;
}