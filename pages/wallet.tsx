import { useEffect, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type WalletData = { d_balance?: number; d_points?: number; vip_level?: string; security_score?: number };
type Tx = { id: string; type: string; amount: number; status: string; created_at: string };

const topups = [25000, 50000, 100000, 250000];
const fallbackHistory = ['Topup QRIS pending', 'Cashback product +Rp 7.500', 'Purchase digital vault -Rp 49.000'];
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function WalletPage() {
  const [token, setToken] = useState('');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [selected, setSelected] = useState(50000);
  const [status, setStatus] = useState('Login untuk sinkron D-Balance.');

  async function load(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/wallet', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal membaca wallet.');
    setWallet(json.wallet);
    setTransactions(json.transactions || []);
    setStatus('Wallet tersinkron dengan Supabase.');
  }

  async function topup() {
    if (!token) return setStatus('Login dulu sebelum topup.');
    setStatus('Membuat topup pending...');
    const res = await fetch('/api/wallet', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: selected, provider: 'manual-preview' }) });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Topup gagal dibuat.');
    setTransactions((items) => [json.transaction, ...items]);
    setStatus('Topup pending dibuat. Nanti bisa disambungkan ke QRIS/payment gateway.');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
    });
  }, []);

  return <DlavieEcosystemPage eyebrow="DLAVIE WALLET" title="D-Balance untuk belanja cepat tanpa friction." description="Topup saldo sekali, lalu beli semua produk digital di DLAVIE dengan checkout cepat, cashback, refund internal, dan riwayat transaksi transparan." accent="#dfff4f" metrics={[{ label: 'Balance', value: rupiah(wallet?.d_balance || 0), hint: wallet ? 'Live from Supabase' : 'Login to sync' }, { label: 'D-Points', value: String(wallet?.d_points || 0), hint: 'Reward balance' }, { label: 'VIP', value: wallet?.vip_level || 'free', hint: 'Wallet privilege' }, { label: 'Security', value: `${wallet?.security_score || 65}/100`, hint: 'Account protection' }]} actions={[{ label: 'Shop', href: '/#products' }, { label: 'VIP', href: '/premium' }, { label: 'Profile', href: '/profile', primary: true }]}><div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Topup Balance</p><div className="mt-5 grid grid-cols-2 gap-3">{topups.map((amount) => <button key={amount} onClick={() => setSelected(amount)} className={`rounded-[1.4rem] p-4 text-left font-black ring-1 ring-white/10 transition hover:-translate-y-1 ${selected === amount ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>{rupiah(amount)}<span className="mt-1 block text-xs font-bold opacity-60">QRIS / e-wallet ready</span></button>)}</div><button onClick={topup} className="mt-5 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950">Create Topup Pending</button><p className="mt-4 text-sm font-semibold leading-6 text-white/55">{status}</p></div><div className="grid gap-4"><div className="dlavie-soft-card rounded-[2rem] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Wallet Rules</p><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-[1.3rem] bg-white p-4 font-bold shadow-sm">Pay any product</div><div className="rounded-[1.3rem] bg-white p-4 font-bold shadow-sm">Cashback auto</div><div className="rounded-[1.3rem] bg-white p-4 font-bold shadow-sm">Refund internal</div></div></div><div className="dlavie-soft-card rounded-[2rem] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Latest Activity</p><div className="mt-4 space-y-3">{transactions.length ? transactions.map((tx) => <div key={tx.id} className="flex items-center justify-between rounded-[1.2rem] bg-white/80 p-4 font-bold"><span>{tx.type} · {rupiah(tx.amount)}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-white">{tx.status}</span></div>) : fallbackHistory.map((item) => <div key={item} className="flex items-center justify-between rounded-[1.2rem] bg-white/80 p-4 font-bold"><span>{item}</span><span className="h-2 w-2 rounded-full bg-[#35cf72] dlavie-live-dot" /></div>)}</div></div></div></div></DlavieEcosystemPage>;
}
