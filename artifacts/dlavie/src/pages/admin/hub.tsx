import { Link } from 'wouter';

const modules = [
  ['Stats', '/admin/intelligence', 'Health, revenue, logs, dan audit.'],
  ['Orders', '/admin/order-pulse', 'Pantau order dan status pembelian.'],
  ['Products', '/admin/products', 'Kelola katalog produk digital.'],
  ['Coupons', '/admin/coupons', 'Kelola promo dan diskon.'],
  ['Signal', '/admin/signal', 'Pantau alur signal admin.'],
  ['Security', '/admin/security', 'Cek keamanan dan guard.'],
  ['Logs', '/admin/sec', 'Audit dan delivery log.'],
];

export default function AdminHub() {
  return <main className="min-h-screen bg-[#050811] px-4 py-5 text-white"><section className="mx-auto max-w-md"><Link href="/telegram-admin" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white/70">← Launcher</Link><div className="mt-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-[#dfff4f]/15 p-5 shadow-2xl"><p className="text-xs font-black uppercase tracking-[0.25em] text-[#dfff4f]">DLAVIE ADMIN</p><h1 className="mt-3 text-4xl font-black tracking-[-0.08em]">Admin Hub</h1><p className="mt-3 text-sm font-semibold leading-6 text-white/60">Pusat modul admin Telegram. Website publik tetap bersih, semua akses admin dari sini.</p></div><div className="mt-4 grid gap-3">{modules.map(([name, href, desc]) => <Link key={href} href={href} className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-4 active:scale-[.98]"><p className="text-lg font-black">{name}</p><p className="mt-1 text-sm font-semibold leading-6 text-white/50">{desc}</p></Link>)}</div></section></main>;
}
