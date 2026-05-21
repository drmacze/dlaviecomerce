import { useEffect, useMemo, useState } from 'react';
import { BarChart3, BellRing, Boxes, ChevronRight, Crown, KeyRound, LockKeyhole, PackageCheck, RefreshCw, ShieldCheck, ShoppingBag, Sparkles, TicketPercent, UserRound } from 'lucide-react';

const tabs = ['Overview', 'Commerce', 'Signals', 'Secure'] as const;
type Tab = typeof tabs[number];

declare global {
  interface Window {
    Telegram?: { WebApp?: { ready?: () => void; expand?: () => void; openLink?: (url: string) => void } };
  }
}

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
  profile: '/profile',
};

const tabCopy: Record<Tab, { title: string; subtitle: string; accent: string; modules: Array<[string, string, string, keyof typeof routes]> }> = {
  Overview: {
    title: 'Admin launcher',
    subtitle: 'Panel Telegram ini sekarang menjadi pintu masuk fungsional ke seluruh admin Dlavie.',
    accent: 'from-cyan-500/25 via-violet-500/20 to-[#dfff4f]/15',
    modules: [
      ['Admin Hub', 'Pusat semua modul premium.', '👑', 'hub'],
      ['Stats', 'Health, revenue, logs, audits.', '📊', 'stats'],
      ['Orders', 'Pantau dan update order.', '🛒', 'orders'],
      ['Security', 'Security foundation.', '🛡', 'security'],
    ],
  },
  Commerce: {
    title: 'Commerce ops',
    subtitle: 'Akses cepat untuk order, produk, coupon, dan workflow penjualan.',
    accent: 'from-emerald-500/25 via-cyan-500/15 to-[#dfff4f]/15',
    modules: [
      ['Order Pulse', 'Order dashboard dengan audit.', '🛒', 'orders'],
      ['Products', 'Kelola katalog produk.', '📦', 'products'],
      ['Coupons', 'Kelola promo dan diskon.', '🎟', 'coupons'],
      ['Stats', 'Lihat revenue view.', '📊', 'stats'],
    ],
  },
  Signals: {
    title: 'Signal monitor',
    subtitle: 'Pusat untuk memantau signal, logs, delivery, dan audit ringkas.',
    accent: 'from-violet-500/25 via-fuchsia-500/15 to-cyan-500/15',
    modules: [
      ['Signal Center', 'Signal dan priority flow.', '📡', 'signal'],
      ['Live Logs', 'Notification dan audit logs.', '🧾', 'logs'],
      ['Stats', 'Observability summary.', '📊', 'stats'],
      ['Hub', 'Kembali ke pusat admin.', '👑', 'hub'],
    ],
  },
  Secure: {
    title: 'Secure access',
    subtitle: 'Akses admin tetap tersembunyi dari website publik dan masuk dari Telegram.',
    accent: 'from-[#dfff4f]/20 via-emerald-500/15 to-cyan-500/15',
    modules: [
      ['Login Admin', 'Masuk dengan email owner.', '🔐', 'login'],
      ['Security', 'Security center.', '🛡', 'security'],
      ['Profile', 'Cek akun login.', '👤', 'profile'],
      ['Logs', 'Audit dan delivery records.', '🧾', 'logs'],
    ],
  },
};

const icons = [Crown, BarChart3, ShoppingBag, ShieldCheck, Boxes, TicketPercent, BellRing, LockKeyhole];

export default function P() {
  const [active, setActive] = useState<Tab>('Overview');
  const [stamp, setStamp] = useState('');
  const panel = tabCopy[active];

  useEffect(() => {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
    setStamp(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const statusCards = useMemo(() => [
    ['Entry', 'Telegram', 'Admin masuk dari bot.'],
    ['Website', 'Clean', 'Tidak ada secret admin publik.'],
    ['Routes', 'Hidden', 'Panel tetap hidup dan protected.'],
    ['Mode', active, 'Tab aktif sekarang.'],
  ], [active]);

  function go(path: string) {
    window.location.href = path;
  }

  return <main className="min-h-screen overflow-hidden bg-[#050811] px-4 py-4 text-white"><div className="fixed left-[-7rem] top-[-9rem] h-72 w-72 rounded-full bg-cyan-500/25 blur-[90px]" /><div className="fixed right-[-9rem] top-24 h-80 w-80 rounded-full bg-violet-600/25 blur-[100px]" /><div className="fixed bottom-[-8rem] left-1/4 h-72 w-72 rounded-full bg-[#dfff4f]/10 blur-[100px]" /><section className="relative mx-auto max-w-md pb-10"><header className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${panel.accent} p-5 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl transition-all duration-500`}><div className="absolute right-4 top-4 grid h-14 w-14 place-items-center rounded-[1.3rem] border border-white/10 bg-white/10"><Sparkles className="h-7 w-7 text-[#dfff4f]" /></div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">DLAVIE TELEGRAM ADMIN</p><h1 className="mt-3 max-w-[16rem] text-4xl font-black leading-[0.9] tracking-[-0.08em]">{panel.title}</h1><p className="mt-3 max-w-[18rem] text-sm font-semibold leading-6 text-white/62">{panel.subtitle}</p><div className="mt-5 flex items-center justify-between gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/15 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_16px_rgba(167,243,208,.9)]" />Ready</span><span>{stamp || 'Live'}</span></div></header><nav className="sticky top-3 z-20 mt-4 grid grid-cols-4 gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-2 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-2xl">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`rounded-[1.1rem] px-2 py-3 text-center text-[9px] font-black uppercase tracking-[0.08em] transition-all duration-300 active:scale-95 ${active === tab ? 'bg-[#dfff4f] text-slate-950 shadow-[0_0_26px_rgba(223,255,79,.24)]' : 'bg-white/[0.055] text-white/50'}`}>{tab}</button>)}</nav><div className="mt-4 grid grid-cols-2 gap-3">{statusCards.map(([label, value, text]) => <article key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.075] p-4 shadow-[0_18px_48px_rgba(0,0,0,.25)] backdrop-blur-xl"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/38">{label}</p><h3 className="mt-2 text-2xl font-black text-white">{value}</h3><p className="mt-1 text-xs font-semibold leading-5 text-white/48">{text}</p></article>)}</div><section className="mt-4 rounded-[2rem] border border-white/10 bg-white/[0.065] p-4 shadow-[0_24px_70px_rgba(0,0,0,.26)] backdrop-blur-2xl"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#dfff4f]/65">{active}</p><h2 className="mt-1 text-2xl font-black tracking-tight text-white">Launch modules</h2></div><button onClick={() => setStamp(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/60 active:scale-95"><RefreshCw className="h-4 w-4" /></button></div><div className="mt-4 grid gap-3">{panel.modules.map(([title, desc, emoji, key], index) => { const Icon = icons[index % icons.length]; const path = routes[key]; return <button key={title} onClick={() => go(path)} className="group flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-4 text-left transition hover:bg-slate-950/70 active:scale-[.98]"><div className="flex min-w-0 items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-xl"><span>{emoji}</span></div><div className="min-w-0"><p className="font-black text-white">{title}</p><p className="mt-1 text-xs font-semibold leading-5 text-white/45">{desc}</p></div></div><ChevronRight className="h-5 w-5 shrink-0 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#dfff4f]" /></button>; })}</div></section><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => go('/admin/hub')} className="rounded-[1.4rem] bg-[#dfff4f] p-4 text-left font-black text-slate-950 active:scale-[.98]"><Crown className="mb-3 h-5 w-5" />Open Hub</button><button onClick={() => go('/login')} className="rounded-[1.4rem] border border-white/10 bg-white/[0.075] p-4 text-left font-black text-white active:scale-[.98]"><KeyRound className="mb-3 h-5 w-5 text-cyan-100" />Login</button></div><p className="mt-4 rounded-[1.3rem] border border-white/10 bg-slate-950/45 p-4 text-xs font-bold leading-5 text-white/45">Catatan: jika modul admin meminta login, masuk memakai email owner. Panel ini adalah launcher Telegram; data sensitif tetap dijaga oleh admin guard di website.</p></section></main>;
}
