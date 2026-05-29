import { useEffect, useMemo, useState } from 'react';
import { AutomaticTopupCard } from '@/components/automatic-topup-card';
import { DlavieCompactPage } from '@/components/dlavie-compact-page';
import { notifyDlavie } from '@/components/dlavie-alert-center';
import { TopupPaymentMethods } from '@/components/topup-payment-methods';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type WalletData = { d_balance?: number; d_points?: number; vip_level?: string };
type Tx = { id: string; type: string; amount: number; status: string; provider?: string | null; reference?: string | null };
type ManualProof = { provider: string; sender_name: string; proof_note: string; proof_image_data: string; proof_image_name: string };
type WalletMode = 'auto' | 'manual' | 'activity';

const amounts = [10000, 25000, 50000, 75000, 100000, 150000];
const rupiah = (v = 0) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

function toneFor(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('gagal') || lower.includes('error') || lower.includes('ditolak')) return 'error' as const;
  if (lower.includes('login') || lower.includes('wajib') || lower.includes('pending')) return 'warning' as const;
  if (lower.includes('berhasil') || lower.includes('terkirim') || lower.includes('mengalihkan')) return 'success' as const;
  return 'info' as const;
}

export default function WalletPage() {
  const [token, setToken] = useState('');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [selected, setSelected] = useState(50000);
  const [custom, setCustom] = useState('');
  const [mode, setMode] = useState<WalletMode>('auto');
  const [status, setStatus] = useState('Login untuk sinkron D-Balance.');
  const amount = Math.max(10000, Number(custom || selected || 0));

  function showStatus(message: string, title = 'Wallet Update') {
    setStatus(message);
    notifyDlavie({ tone: toneFor(message), title, message });
  }

  async function load(nextToken = token) {
    if (!nextToken) return;
    try {
      const res = await fetch('/api/wallet', { headers: { Authorization: `Bearer ${nextToken}` } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return showStatus(json.error || 'Gagal membaca wallet.', 'Wallet Error');
      setWallet(json.wallet || { d_balance: 0, d_points: 0, vip_level: 'free' });
      setTransactions(Array.isArray(json.transactions) ? json.transactions : []);
      setStatus('Wallet tersinkron dengan Supabase.');
    } catch {
      showStatus('Gagal terhubung ke wallet. Cek koneksi lalu refresh.', 'Network Error');
    }
  }

  async function manualTopup(proof: ManualProof) {
    if (!token) return showStatus('Login dulu sebelum request topup manual.', 'Login diperlukan');
    showStatus('Mengirim bukti topup manual...', 'Request Topup');
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, provider: proof.provider, sender_name: proof.sender_name, proof_note: proof.proof_note, proof_image_data: proof.proof_image_data, proof_image_name: proof.proof_image_name })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return showStatus(json.error || 'Topup gagal dibuat.', 'Request Gagal');
      setTransactions((items) => [json.transaction, ...items].filter(Boolean));
      showStatus(`Request topup terkirim. Ref ${json.transaction?.reference || '-'} menunggu review admin.`, 'Request Berhasil');
    } catch {
      showStatus('Request topup gagal dikirim karena koneksi/server bermasalah.', 'Network Error');
    }
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
      else setStatus('Login untuk sinkron D-Balance dan membuat topup.');
    }).catch(() => showStatus('Gagal membaca session login. Coba refresh atau login ulang.', 'Session Error'));
  }, []);

  const rewardTotal = useMemo(() => transactions.filter((tx) => tx.type === 'reward').reduce((sum, tx) => sum + Number(tx.amount || 0), 0), [transactions]);
  const purchases = transactions.filter((tx) => tx.type === 'purchase').length;
  const latest = transactions.slice(0, 6);

  const activityContent = (
    <div className="space-y-3">
      {latest.length ? latest.map((tx) => (
        <div key={tx.id} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{tx.type === 'topup' && tx.provider === 'midtrans' ? 'Auto Gateway' : tx.type}</p>
              <p className="mt-1 text-sm text-white/45">{tx.type === 'reward' ? `+${tx.amount} pts` : rupiah(tx.amount)}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/62">{tx.status}</span>
          </div>
          {tx.reference && <p className="mt-3 break-all rounded-xl bg-black/20 px-3 py-2 text-[11px] text-white/35">{tx.reference}</p>}
        </div>
      )) : <p className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5 text-sm font-medium text-white/48">Belum ada aktivitas wallet.</p>}
    </div>
  );

  const activePanel = mode === 'auto'
    ? <AutomaticTopupCard token={token} amount={amount} onStatus={(message) => showStatus(message, 'Auto Gateway')} />
    : mode === 'manual'
      ? <TopupPaymentMethods selectedAmount={amount} status={status} onCreateTopup={manualTopup} />
      : activityContent;

  return (
    <DlavieCompactPage
      eyebrow="DLAVIE WALLET"
      title="Wallet control center."
      description="Top up D-Balance, pilih metode pembayaran, dan pantau aktivitas wallet dalam satu panel yang bersih."
      metrics={[{ label: 'Balance', value: rupiah(wallet?.d_balance || 0), hint: 'D-Balance' }, { label: 'D-Points', value: String(wallet?.d_points || 0), hint: `${rewardTotal} earned` }, { label: 'VIP', value: wallet?.vip_level || 'free', hint: 'Reward tier' }, { label: 'Orders', value: String(purchases), hint: 'Purchases' }]}
      actions={[{ label: 'Produk', href: '/products' }, { label: 'Orders', href: '/orders' }, { label: 'Top up', href: '#wallet-panel', primary: true }]}
    >
      <div id="wallet-panel" className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="dlavie-premium-surface dlavie-kinetic-card relative overflow-hidden rounded-[2rem] p-5 text-white md:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 left-4 h-52 w-52 rounded-full bg-violet-300/10 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38">Available Balance</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-.06em] text-white md:text-5xl">{rupiah(wallet?.d_balance || 0)}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/48">Pilih nominal top up. Minimal transaksi Rp 10.000.</p>
          </div>

          <div className="relative mt-7 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/36">Top up amount</p>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-950">Min 10K</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {amounts.map((value) => (
                <button key={value} onClick={() => { setSelected(value); setCustom(''); }} className={`rounded-[1.05rem] px-3 py-3 text-sm font-semibold transition ${amount === value && !custom ? 'bg-white text-slate-950 shadow-[0_18px_48px_rgba(255,255,255,.12)]' : 'border border-white/10 bg-white/[0.045] text-white/70 hover:bg-white/[0.08]'}`}>
                  {value / 1000}K
                </button>
              ))}
            </div>
            <input inputMode="numeric" value={custom} onChange={(event) => setCustom(event.target.value.replace(/\D/g, ''))} placeholder="Custom amount" className="mt-3 w-full rounded-[1.15rem] border border-white/10 bg-white/[0.055] px-4 py-4 text-sm font-semibold text-white outline-none placeholder:text-white/28 focus:border-white/25" />
            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/32">Selected</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-.05em] text-white">{rupiah(amount)}</p>
            </div>
          </div>
        </section>

        <section className="dlavie-premium-surface relative overflow-hidden rounded-[2rem] p-5 md:p-6">
          <div className="flex flex-wrap gap-2 rounded-[1.35rem] border border-white/10 bg-black/20 p-2">
            {(['auto', 'manual', 'activity'] as WalletMode[]).map((item) => (
              <button key={item} onClick={() => setMode(item)} className={`flex-1 rounded-[1rem] px-4 py-3 text-sm font-semibold capitalize transition ${mode === item ? 'bg-white text-slate-950' : 'text-white/52 hover:bg-white/[0.06] hover:text-white'}`}>
                {item === 'auto' ? 'Auto gateway' : item === 'manual' ? 'Manual' : 'Activity'}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 md:p-5">
            {activePanel}
          </div>

          <p className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 text-sm font-medium leading-6 text-white/50">{status}</p>
        </section>
      </div>
    </DlavieCompactPage>
  );
}
