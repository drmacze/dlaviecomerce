import { useEffect, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const vaultItems = ['Owner coupon reveal', 'Mystery D-Points capsule', 'VIP secret drop token', 'Daily commerce streak bonus'];
type Claim = { id: string; title: string; amount: number; status: string; created_at: string };

export default function RewardsPage() {
  const [token, setToken] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [status, setStatus] = useState('Login untuk menyimpan reward ke akun.');

  async function load(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/rewards', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal membaca rewards.');
    setClaims(json.claims || []);
    setStatus('Reward Vault tersinkron dengan Supabase.');
  }

  async function claim(type: 'scratch' | 'capsule') {
    if (!token) return setStatus('Login dulu untuk claim reward.');
    const res = await fetch('/api/rewards', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reward_type: type }) });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Claim reward gagal.');
    setClaims((items) => [json.claim, ...items]);
    setStatus(`Reward terbuka: ${json.claim.title} +${json.claim.amount} DP`);
    if (type === 'scratch') setRevealed(true);
    if (type === 'capsule') setCapsuleOpen(true);
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
    });
  }, []);

  const totalReward = claims.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return <DlavieEcosystemPage eyebrow="REWARD VAULT" title="Reward harus terasa ditemukan, bukan sekadar diberikan." description="DLAVIE Reward Vault membuat coupon, D-Points, cashback, capsule, dan secret drop terasa lebih interaktif untuk meningkatkan retention dan rasa penasaran user." accent="#ff5f68" metrics={[{ label: 'Vault', value: '4', hint: 'Reward modes' }, { label: 'Earned', value: `+${totalReward || 750}`, hint: 'Live reward claims' }, { label: 'Claims', value: String(claims.length || 0), hint: 'Saved to Supabase' }, { label: 'VIP', value: 'Secret', hint: 'Exclusive drops' }]} actions={[{ label: 'Wallet', href: '/wallet' }, { label: 'VIP', href: '/premium' }, { label: 'Shop', href: '/#products', primary: true }]}><div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]"><div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.25)]"><div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ff5f68]/35 blur-3xl" /><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff9f43]">Reveal Card</p><div className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#dfff4f] via-white to-[#ffccd1] p-6 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.7)]"><div className={`absolute inset-0 z-10 grid place-items-center bg-slate-950 text-white transition duration-700 ${revealed ? 'translate-x-full opacity-0' : 'opacity-100'}`}><button onClick={() => claim('scratch')} className="rounded-full bg-[#dfff4f] px-6 py-4 font-black text-slate-950 shadow-[0_16px_45px_rgba(223,255,79,.25)]">Reveal Reward</button></div><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">DLAVIE Coupon</p><h2 className="mt-4 text-5xl font-black">FREE250</h2><p className="mt-3 font-bold text-slate-600">+250 D-Points atau diskon rahasia untuk checkout berikutnya.</p></div><p className="mt-5 text-sm font-semibold leading-7 text-white/55">{status}</p></div><div className="grid gap-5"><div className="dlavie-soft-card rounded-[2rem] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Mystery Capsule</p><div className="mt-5 flex flex-col items-center gap-5 rounded-[1.7rem] bg-slate-950 p-8 text-white"><button onClick={() => claim('capsule')} className={`grid h-36 w-36 place-items-center rounded-full font-black shadow-[0_0_80px_rgba(255,95,104,.25)] ring-1 ring-white/10 transition duration-700 ${capsuleOpen ? 'rotate-[360deg] scale-110 bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white hover:scale-105'}`}>{capsuleOpen ? '+500 DP' : 'Open'}</button><p className="max-w-md text-center text-sm font-semibold text-white/55">Capsule dapat berisi D-Points, cashback, coupon, atau token unlock produk rahasia.</p></div></div><div className="grid gap-3 md:grid-cols-2">{vaultItems.map((item, index) => <div key={item} className="dlavie-soft-card rounded-[1.5rem] p-5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Vault {index + 1}</p><p className="mt-2 font-black">{item}</p></div>)}{claims.slice(0, 4).map((claim) => <div key={claim.id} className="rounded-[1.5rem] bg-white/70 p-5 font-bold ring-1 ring-black/5">{claim.title} · +{claim.amount} DP</div>)}</div></div></div></DlavieEcosystemPage>;
}
