import { useEffect, useState } from 'react';
import { DlavieMegaSuite } from '@/components/dlavie-mega-suite';
import { SecretLogoGate } from '@/components/secret-logo-gate';
import { VipStatusBanner } from '@/components/vip-status-banner';

const VERSION = 'v1.5.0';
const services = [
  ['Pulsa', 'Isi nomor HP', '/products?type=pulsa', '#75b3e5'],
  ['Data', 'Paket internet', '/products?type=data', '#8ed7ff'],
  ['PLN', 'Token listrik', '/products?type=pln', '#dfff4f'],
  ['Game', 'Top up cepat', '/products?type=game', '#ffd6a3'],
  ['Voucher', 'Kode digital', '/products?type=voucher', '#c9b6ff'],
  ['Wallet', 'D-Balance', '/wallet', '#35cf72'],
  ['Order', 'Status beli', '/orders', '#ffffff'],
  ['Reward', 'D-Points', '/rewards', '#f8ffbd']
] as const;
const slides = [
  ['Top up saldo lebih jelas', 'Auto Gateway untuk pembayaran otomatis. Manual topup tetap wajib bukti agar admin dan user sama-sama aman.', '/wallet', 'Isi saldo'],
  ['Belanja digital lebih cepat', 'Pilih layanan, bayar pakai D-Balance, lalu cek status order dari satu tempat.', '/products', 'Buka produk'],
  ['Reward dibuat terlihat', 'D-Points, VIP, referral, dan riwayat transaksi disiapkan agar user tahu manfaatnya.', '/rewards', 'Lihat reward']
] as const;

export default function Home() {
  const [active, setActive] = useState(0);
  const [clock, setClock] = useState('--:--');
  const slide = slides[active];

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActive((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, []);

  return <main className="soft-home min-h-screen overflow-hidden px-4 py-5 text-slate-950 md:px-8 md:py-7">
    <style jsx global>{`
      body{background:#edf4ee;color:#101315}.soft-home{position:relative;isolation:isolate}.soft-home:before{content:'';position:fixed;inset:0;z-index:-4;background:radial-gradient(circle at 14% 8%,rgba(117,179,229,.34),transparent 28rem),radial-gradient(circle at 86% 10%,rgba(223,255,79,.38),transparent 24rem),radial-gradient(circle at 50% 100%,rgba(53,207,114,.16),transparent 32rem),linear-gradient(135deg,#f6faf4,#eaf2ef 44%,#f7fbe8)}.soft-home:after{content:'';position:fixed;inset:0;z-index:-3;opacity:.36;background-image:linear-gradient(rgba(16,19,21,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(16,19,21,.035) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(circle at 50% 30%,black,transparent 78%)}.mesh{position:fixed;inset:-18%;z-index:-2;filter:blur(70px);opacity:.78;background:conic-gradient(from 120deg at 50% 50%,rgba(117,179,229,.35),rgba(223,255,79,.5),rgba(255,214,163,.35),rgba(255,255,255,.2),rgba(117,179,229,.35));animation:mesh 16s ease-in-out infinite alternate}.mica{border:1px solid rgba(16,19,21,.08);background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,255,255,.42));box-shadow:0 28px 85px rgba(65,78,74,.16),inset 0 1px 0 rgba(255,255,255,.88);backdrop-filter:blur(24px) saturate(150%)}.lift{transition:transform .28s ease,box-shadow .28s ease,background .28s ease}.lift:hover{transform:translateY(-6px);box-shadow:0 26px 80px rgba(65,78,74,.2)}.primary-btn{background:linear-gradient(135deg,#101315,#26323d);color:#dfff4f;box-shadow:0 18px 48px rgba(16,19,21,.2),inset 0 1px 0 rgba(255,255,255,.13)}.lime-btn{background:linear-gradient(135deg,#dfff4f,#f7ffbb);color:#101315;box-shadow:0 18px 44px rgba(176,205,55,.24),inset 0 1px 0 rgba(255,255,255,.85)}.ring-run{position:relative;overflow:hidden}.ring-run:before{content:'';position:absolute;inset:-2px;border-radius:inherit;padding:2px;background:conic-gradient(from 0deg,transparent,rgba(117,179,229,.55),rgba(223,255,79,.95),transparent 38%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:spin 9s linear infinite;pointer-events:none}.wave-card:after{content:'';position:absolute;left:-20%;right:-20%;bottom:16%;height:8rem;border-radius:100%;border-top:2px solid rgba(117,179,229,.52);box-shadow:0 -8px 28px rgba(117,179,229,.25),0 20px 55px rgba(223,255,79,.24);animation:wave 8s ease-in-out infinite alternate}.svc{--tone:#dfff4f}.svc:after{content:'';position:absolute;left:20%;right:20%;bottom:-20px;height:28px;border-radius:999px;background:var(--tone);filter:blur(18px);opacity:0;transition:.28s}.svc:hover:after{opacity:.65}.svc svg{transition:transform .28s ease}.svc:hover svg{transform:translateY(-2px) scale(1.08)}@keyframes mesh{0%{transform:translate3d(-4%,-2%,0) rotate(0deg) scale(1)}100%{transform:translate3d(4%,3%,0) rotate(18deg) scale(1.08)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes wave{from{transform:translateX(-1.5rem) rotate(-3deg)}to{transform:translateX(1.7rem) rotate(-1deg)}}
    `}</style>
    <div className="mesh" />
    <aside className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 rounded-[2rem] bg-white/60 p-2 shadow-[0_20px_60px_rgba(65,78,74,.16)] ring-1 ring-black/5 backdrop-blur-xl lg:flex lg:flex-col lg:gap-2">
      {['D','Shop','Pay','VIP','Cart'].map((item, i) => <a key={item} href={['/','/products','/wallet','/premium','/cart'][i]} className={`grid h-12 w-12 place-items-center rounded-full text-xs font-black transition hover:-translate-y-1 ${i===0?'bg-slate-950 text-[#dfff4f]':'bg-white/75 text-slate-700 ring-1 ring-black/5'}`}>{item}</a>)}
    </aside>
    <div className="mx-auto max-w-7xl lg:pl-20">
      <header className="sticky top-4 z-50 mb-5">
        <nav className="mica ring-run rounded-[2rem] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3"><SecretLogoGate /><div><p className="text-xl font-black tracking-tight">DLAVIE</p><p className="text-[10px] font-black uppercase tracking-[.24em] text-slate-400">Digital commerce</p></div></div>
            <div className="hidden gap-2 md:flex"><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black ring-1 ring-black/5" href="/products">Products</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black ring-1 ring-black/5" href="/wallet">Wallet</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black ring-1 ring-black/5" href="/orders">Orders</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black ring-1 ring-black/5" href="/security">Security</a></div>
            <a href="/dashboard" className="primary-btn rounded-full px-4 py-2.5 text-xs font-black">Dashboard</a>
          </div>
        </nav>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.04fr_.96fr]">
        <article className="mica wave-card relative min-h-[34rem] overflow-hidden rounded-[2.8rem] p-6 md:p-10">
          <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full bg-[#dfff4f]/60 blur-2xl md:block" />
          <div className="relative z-10 flex min-h-[29rem] flex-col justify-between gap-8">
            <div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-[#dfff4f]">DLAVIE Pay</span><span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-slate-500 ring-1 ring-black/5">{clock} · {VERSION}</span></div><h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.045em] md:text-7xl">Bayar digital terasa lebih ringan.</h1><p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Pulsa, data, PLN, game, voucher, wallet, dan reward dibuat dalam tampilan yang cepat dipahami. Fokusnya bukan ramai, tapi jelas.</p></div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]"><div className="rounded-[1.5rem] bg-white/60 p-4 ring-1 ring-black/5 backdrop-blur"><p className="text-[10px] font-black uppercase tracking-[.24em] text-slate-400">{slide[0]}</p><h2 className="mt-2 text-2xl font-black tracking-tight">{slide[1]}</h2><p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{slide[2]}</p><div className="mt-4 flex gap-2">{slides.map((_,i)=><button key={i} onClick={()=>setActive(i)} className={`h-2.5 rounded-full transition-all ${active===i?'w-10 bg-slate-950':'w-2.5 bg-slate-300'}`}/>)}</div></div><div className="flex gap-2 md:flex-col"><a className="lime-btn grid place-items-center rounded-[1.4rem] px-5 py-4 text-sm font-black" href={slide[2] ? slide[3] : '/products'}>{slide[4]}</a><a className="primary-btn grid place-items-center rounded-[1.4rem] px-5 py-4 text-sm font-black" href="/wallet">Wallet</a></div></div>
          </div>
        </article>
        <aside className="grid gap-4">
          <div className="mica rounded-[2.3rem] p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-slate-400">Quick services</p><h2 className="mt-1 text-2xl font-black">Mau transaksi apa?</h2></div><a href="/products" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">All</a></div><div className="mt-4 grid grid-cols-4 gap-2">{services.map(([name,note,href,tone])=><a key={name} href={href} style={{'--tone':tone} as React.CSSProperties} className="svc lift relative overflow-hidden rounded-[1.25rem] bg-white/65 p-3 text-center ring-1 ring-black/5"><span className="mx-auto grid h-11 w-11 place-items-center rounded-[1rem] bg-white shadow-sm ring-1 ring-black/5"><Icon /></span><b className="mt-2 block text-xs">{name}</b><span className="mt-1 block truncate text-[10px] font-bold text-slate-400">{note}</span></a>)}</div></div>
          <div className="grid grid-cols-2 gap-3"><div className="mica lift rounded-[1.8rem] p-5"><p className="text-[10px] font-black uppercase tracking-[.22em] text-slate-400">D-Balance</p><p className="mt-2 text-3xl font-black">Rp 0</p><p className="mt-1 text-xs font-bold text-slate-500">Sinkron setelah login.</p><a href="/wallet" className="mt-4 inline-flex rounded-full bg-[#dfff4f] px-4 py-2 text-xs font-black">Isi saldo</a></div><div className="mica lift rounded-[1.8rem] p-5"><p className="text-[10px] font-black uppercase tracking-[.22em] text-slate-400">Status</p><p className="mt-2 text-3xl font-black">Clear</p><p className="mt-1 text-xs font-bold text-slate-500">Order dan topup mudah dicek.</p><a href="/orders" className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Orders</a></div></div>
        </aside>
      </section>
      <VipStatusBanner />
      <DlavieMegaSuite />
    </div>
  </main>;
}

function Icon(){return <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 7h14M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7M9 11h6M10 15h4"/></svg>}
