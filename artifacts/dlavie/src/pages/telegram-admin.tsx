import { useEffect, useState } from 'react';
import { BarChart3, BellRing, ChevronRight, Crown, KeyRound, LockKeyhole, PackageCheck, ShieldCheck, ShoppingBag, Sparkles, TicketPercent } from 'lucide-react';

const tabs = ['Overview', 'Commerce', 'Signals', 'Secure'] as const;
type Tab = typeof tabs[number];

const routes = {
  hub: '/admin/hub',
  stats: '/admin/intelligence',
  orders: '/admin/order-pulse',
  products: '/admin/products',
  coupons: '/admin/coupons',
  signal: '/admin/signal',
  logs: '/admin/sec',
  security: '/admin/security',
  login: '/login',
};

const panels: Record<Tab, { title: string; text: string; modules: Array<[string, string, string, keyof typeof routes]> }> = {
  Overview: { title: 'Admin launcher', text: 'Pintu masuk admin Dlavie dari Telegram.', modules: [['Admin Hub', 'Semua modul premium.', '👑', 'hub'], ['Stats', 'Health, revenue, logs.', '📊', 'stats'], ['Orders', 'Order pulse dashboard.', '🛒', 'orders'], ['Security', 'Security center.', '🛡', 'security']] },
  Commerce: { title: 'Commerce ops', text: 'Order, produk, coupon, dan revenue.', modules: [['Order Pulse', 'Pantau status order.', '🛒', 'orders'], ['Products', 'Kelola katalog produk.', '📦', 'products'], ['Coupons', 'Kelola promo/diskon.', '🎟', 'coupons'], ['Stats', 'Revenue dan health.', '📊', 'stats']] },
  Signals: { title: 'Signal monitor', text: 'Notifikasi, signal, logs, dan audit.', modules: [['Signal Center', 'Priority flow.', '📡', 'signal'], ['Live Logs', 'Audit dan delivery.', '🧾', 'logs'], ['Stats', 'Observability summary.', '📊', 'stats'], ['Hub', 'Pusat admin.', '👑', 'hub']] },
  Secure: { title: 'Secure access', text: 'Akses admin tersembunyi dan protected.', modules: [['Login Admin', 'Masuk email owner.', '🔐', 'login'], ['Security', 'Security foundation.', '🛡', 'security'], ['Logs', 'Audit records.', '🧾', 'logs'], ['Hub', 'Admin hub.', '👑', 'hub']] },
};

const icons = [Crown, BarChart3, ShoppingBag, ShieldCheck, PackageCheck, TicketPercent, BellRing, LockKeyhole];

export default function TelegramAdmin() {
  const [active, setActive] = useState<Tab>('Overview');
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('Masukkan Dlavie Admin Security Key.');
  const panel = panels[active];

  useEffect(() => {
    fetch('/api/admin-gate/status').then((res) => res.json()).then((data) => {
      setUnlocked(Boolean(data.unlocked));
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  async function unlock() {
    setStatus('Memverifikasi security key...');
    const res = await fetch('/api/admin-gate/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Unlock gagal.');
    setUnlocked(true);
    setStatus('Admin panel terbuka.');
  }

  function go(path: string) {
    window.location.href = path;
  }

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#050811] px-4 text-white"><div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-2xl"><p className="font-black text-[#dfff4f]">DLAVIE SECURE GATE</p><p className="mt-2 text-sm font-semibold text-white/50">Checking secure session...</p></div></main>;

  if (!unlocked) return <main className="min-h-screen overflow-hidden bg-[#050811] px-4 py-5 text-white"><div className="fixed left-[-7rem] top-[-9rem] h-72 w-72 rounded-full bg-cyan-500/25 blur-[90px]" /><div className="fixed right-[-9rem] top-24 h-80 w-80 rounded-full bg-violet-600/25 blur-[100px]" /><section className="relative mx-auto max-w-md"><div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-950 p-5 shadow-[0_30px_100px_rgba(0,0,0,.5)]"><div className="grid h-16 w-16 place-items-center rounded-[1.5rem] border border-white/10 bg-white/10"><LockKeyhole className="h-8 w-8 text-[#dfff4f]" /></div><p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-[#dfff4f]/70">DLAVIE SECURE GATE</p><h1 className="mt-3 text-4xl font-black leading-[.9] tracking-[-0.08em]">Admin locked</h1><p className="mt-3 text-sm font-semibold leading-6 text-white/55">Panel ini dilindungi security key dan signed session. Jangan bagikan key ke siapa pun.</p><input value={key} onChange={(event) => setKey(event.target.value)} type="password" placeholder="Masukkan security key" className="mt-5 w-full rounded-[1.3rem] border border-white/10 bg-white/10 px-4 py-4 font-bold text-white outline-none placeholder:text-white/35" /><button onClick={unlock} disabled={!key} className="mt-3 w-full rounded-[1.3rem] bg-[#dfff4f] px-5 py-4 font-black text-slate-950 disabled:opacity-50"><KeyRound className="mr-2 inline h-5 w-5" />Unlock Admin Panel</button><p className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-4 text-xs font-bold leading-5 text-white/48">{status}</p></div></section></main>;

  return <main className="min-h-screen overflow-hidden bg-[#050811] px-4 py-4 text-white"><div className="fixed left-[-7rem] top-[-9rem] h-72 w-72 rounded-full bg-cyan-500/25 blur-[90px]" /><div className="fixed right-[-9rem] top-24 h-80 w-80 rounded-full bg-violet-600/25 blur-[100px]" /><section className="relative mx-auto max-w-md pb-10"><header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-[#dfff4f]/15 p-5 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl"><div className="absolute right-4 top-4 grid h-14 w-14 place-items-center rounded-[1.3rem] border border-white/10 bg-white/10"><Sparkles className="h-7 w-7 text-[#dfff4f]" /></div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">DLAVIE TELEGRAM ADMIN</p><h1 className="mt-3 max-w-[16rem] text-4xl font-black leading-[0.9] tracking-[-0.08em]">{panel.title}</h1><p className="mt-3 max-w-[18rem] text-sm font-semibold leading-6 text-white/62">{panel.text}</p><div className="mt-5 rounded-full border border-emerald-300/25 bg-emerald-400/15 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">● Secure session active</div></header><nav className="sticky top-3 z-20 mt-4 grid grid-cols-4 gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-2 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-2xl">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`rounded-[1.1rem] px-2 py-3 text-center text-[9px] font-black uppercase tracking-[0.08em] active:scale-95 ${active === tab ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/[0.055] text-white/50'}`}>{tab}</button>)}</nav><section className="mt-4 rounded-[2rem] border border-white/10 bg-white/[0.065] p-4 shadow-[0_24px_70px_rgba(0,0,0,.26)] backdrop-blur-2xl"><h2 className="text-2xl font-black">Launch modules</h2><div className="mt-4 grid gap-3">{panel.modules.map(([title, desc, emoji, key], index) => { const Icon = icons[index % icons.length]; return <button key={title} onClick={() => go(routes[key])} className="group flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-4 text-left active:scale-[.98]"><div className="flex min-w-0 items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-xl">{emoji}</div><div><p className="font-black text-white">{title}</p><p className="mt-1 text-xs font-semibold leading-5 text-white/45">{desc}</p></div></div><ChevronRight className="h-5 w-5 text-white/25 group-hover:text-[#dfff4f]" /></button>; })}</div></section><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => go('/admin/hub')} className="rounded-[1.4rem] bg-[#dfff4f] p-4 text-left font-black text-slate-950"><Crown className="mb-3 h-5 w-5" />Open Hub</button><button onClick={() => go('/login')} className="rounded-[1.4rem] border border-white/10 bg-white/[0.075] p-4 text-left font-black text-white"><KeyRound className="mb-3 h-5 w-5 text-cyan-100" />Login</button></div><p className="mt-4 rounded-[1.3rem] border border-white/10 bg-slate-950/45 p-4 text-xs font-bold leading-5 text-white/45">Admin session aktif selama 6 jam. Jika dibuka tanpa unlock, semua route /admin akan diarahkan kembali ke secure gate.</p></section></main>;
}
