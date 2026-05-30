import { Link } from 'wouter';

const checks = [
  ['Admin Guard', 'Active', 'Route admin disiapkan untuk akses owner.'],
  ['Telegram Entry', 'Active', 'Admin masuk dari bot dan mini app.'],
  ['Public Website', 'Clean', 'Admin tidak terlihat di website publik.'],
  ['Env Readiness', 'Tracked', 'Token dan admin IDs dipisah di environment.'],
];

export default function SecurityAdmin() {
  return <main className="min-h-screen bg-[#050811] px-4 py-5 text-white"><section className="mx-auto max-w-md"><Link href="/telegram-admin" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white/70">← Launcher</Link><div className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#dfff4f]/20 via-emerald-500/15 to-cyan-500/15 p-5 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.25em] text-[#dfff4f]">SECURITY</p><h1 className="mt-3 text-4xl font-black tracking-[-0.08em]">Security Center</h1><p className="mt-3 text-sm font-semibold leading-6 text-white/60">Pusat kontrol keamanan, akses admin, dan readiness sistem.</p></div><div className="mt-4 grid gap-3">{checks.map(([label, value, note]) => <div key={label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">{label}</p><h2 className="mt-2 text-2xl font-black">{value}</h2><p className="mt-1 text-xs font-semibold leading-5 text-white/45">{note}</p></div>)}</div><Link href="/admin/hub" className="mt-4 block rounded-[1.4rem] bg-[#dfff4f] p-4 font-black text-slate-950">Open Admin Hub</Link></section></main>;
}
