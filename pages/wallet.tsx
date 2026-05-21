import { useEffect, useMemo, useState } from 'react';
import { AutomaticTopupCard } from '@/components/automatic-topup-card';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { NeonAmountSelector } from '@/components/neon-amount-selector';
import { TopupPaymentMethods } from '@/components/topup-payment-methods';
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

  return <DlavieEcosystemPage eyebrow="DLAVIE WALLET" title="Topup otomatis dan manual dalam satu wallet." description="Gunakan pembayaran otomatis via gateway untuk saldo masuk otomatis, atau gunakan BRI/Dana/Gopay/QRIS manual sebagai fallback." accent="#dfff4f" metrics={[{ label: 'Balance', value: rupiah(wallet?.d_balance || 0), hint: 'D-Balance' }, { label: 'D-Points', value: String(wallet?.d_points || 0), hint: `${rewardTotal} earned` }, { label: 'VIP', value: wallet?.vip_level || 'free', hint: 'Reward tier' }, { label: 'Purchases', value: String(purchases), hint: 'Wallet logs' }]} actions={[{ label: 'Orders', href: '/orders' }, { label: 'Downloads', href: '/downloads' }, { label: 'Topup', href: '#topup', primary: true }]}><div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]"><section id="topup" className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]"><div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dfff4f]/20 blur-3xl" /><div className="pointer-events-none absolute bottom-12 left-8 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" /><p className="relative text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Topup Balance</p><h2 className="relative mt-3 text-3xl font-black tracking-tight">Pilih nominal topup</h2><p className="relative mt-2 text-sm font-semibold text-white/50">Nominal minimum Rp 10.000 sampai Rp 1.000.000, dengan efek 3D neon.</p><NeonAmountSelector selected={selected} custom={custom} onPick={(value) => { setSelected(value); setCustom(''); }} onCustom={setCustom} /><AutomaticTopupCard token={token} amount={amount} onStatus={setStatus} /><TopupPaymentMethods selectedAmount={amount} status={status} onCreateTopup={manualTopup} /></section><section className="grid gap-4"><div className="dlavie-soft-card rounded-[2rem] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Reward Engine</p><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-[1.3rem] bg-[#dfff4f] p-4 font-black text-slate-950">Fulfill order → D-Points</div><div className="rounded-[1.3rem] bg-white p-4 font-bold shadow-sm">VIP tier = multiplier</div><div className="rounded-[1.3rem] bg-white p-4 font-bold shadow-sm">Rewards logged</div></div></div><div className="dlavie-soft-card rounded-[2rem] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Latest Activity</p><div className="mt-4 space-y-3">{transactions.length ? transactions.map((tx) => <div key={tx.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[1.2rem] bg-white/80 p-4 font-bold"><span>{tx.type === 'topup' && tx.provider === 'midtrans' ? 'Auto Topup' : tx.type} · {tx.type === 'reward' ? `+${tx.amount} pts` : rupiah(tx.amount)}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">{tx.status}</span>{tx.reference && <span className="w-full break-all text-xs font-bold text-slate-400">Ref: {tx.reference}</span>}</div>) : <p className="rounded-[1.2rem] bg-white/80 p-4 font-bold text-slate-500">Belum ada aktivitas wallet.</p>}</div></div></section></div></DlavieEcosystemPage>;
}
