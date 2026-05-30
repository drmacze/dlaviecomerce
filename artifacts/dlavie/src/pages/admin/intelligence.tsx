import { Link } from 'wouter';

const metrics = [
  ['System', 'Ready', 'Admin modules online'],
  ['Revenue', 'View', 'Ringkasan performa'],
  ['Orders', 'Pulse', 'Pantau status order'],
  ['Audit', 'Tracked', 'Aksi admin tercatat'],
];

export default function AdminIntelligence() {
  return <main className="min-h-screen bg-[#050811] px-4 py-5 text-white"><section className="mx-auto max-w-md"><Link href="/telegram-admin" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white/70">← Launcher</Link><div className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/25 via-cyan-500/15 to-[#dfff4f]/15 p-5 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.25em] text-[#dfff4f]">STATS</p><h1 className="mt-3 text-4xl font-black tracking-[-0.08em]">Admin Intelligence</h1><p className="mt-3 text-sm font-semibold leading-6 text-white/60">Pusat statistik, health, audit, dan ringkasan performa Dlavie.</p></div><div className="mt-4 grid grid-cols-2 gap-3">{metrics.map(([label, value, note]) => <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">{label}</p><h2 className="mt-2 text-2xl font-black">{value}</h2><p className="mt-1 text-xs font-semibold text-white/45">{note}</p></div>)}</div><Link href="/admin/hub" className="mt-4 block rounded-[1.4rem] bg-[#dfff4f] p-4 font-black text-slate-950">Open Admin Hub</Link></section></main>;
}
