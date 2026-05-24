import { DlavieBrandMotion } from '@/components/dlavie-brand-motion';
import { SecretLogoGate } from '@/components/secret-logo-gate';
import { VipStatusBanner } from '@/components/vip-status-banner';

const services = [
  { label: 'Produk', note: 'Pulsa, data, PLN, game', href: '/products', color: 'from-[#dfff4f] to-[#f7ffbf]' },
  { label: 'Wallet', note: 'D-Balance & topup', href: '/wallet', color: 'from-[#75b3e5] to-[#dff4ff]' },
  { label: 'Orders', note: 'Riwayat transaksi', href: '/orders', color: 'from-white to-slate-100' },
  { label: 'Rewards', note: 'D-Points & VIP', href: '/rewards', color: 'from-[#f8ffbd] to-[#dfff4f]' }
];

export default function Home() {
  return (
    <main className="soft-dlavie-home min-h-screen overflow-hidden px-4 py-5 text-slate-950 md:px-8 md:py-8">
      <style jsx global>{`
        .soft-dlavie-home{position:relative;isolation:isolate;background:#edf4ee}.soft-dlavie-home:before{content:'';position:fixed;inset:0;z-index:-3;background:radial-gradient(circle at 14% 8%,rgba(117,179,229,.34),transparent 28rem),radial-gradient(circle at 86% 10%,rgba(223,255,79,.38),transparent 24rem),radial-gradient(circle at 50% 100%,rgba(53,207,114,.16),transparent 32rem),linear-gradient(135deg,#f6faf4,#eaf2ef 44%,#f7fbe8)}.soft-dlavie-home:after{content:'';position:fixed;inset:0;z-index:-2;opacity:.32;background-image:linear-gradient(rgba(16,19,21,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(16,19,21,.035) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(circle at 50% 30%,black,transparent 78%)}.home-mesh{position:fixed;inset:-18%;z-index:-1;filter:blur(76px);opacity:.7;background:conic-gradient(from 120deg at 50% 50%,rgba(117,179,229,.35),rgba(223,255,79,.5),rgba(255,214,163,.35),rgba(255,255,255,.2),rgba(117,179,229,.35));animation:homeMesh 16s ease-in-out infinite alternate}.home-mica{border:1px solid rgba(16,19,21,.08);background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,255,255,.42));box-shadow:0 28px 85px rgba(65,78,74,.16),inset 0 1px 0 rgba(255,255,255,.88);backdrop-filter:blur(24px) saturate(150%)}.home-ring{position:relative;overflow:hidden}.home-ring:before{content:'';position:absolute;inset:-2px;border-radius:inherit;padding:2px;background:conic-gradient(from 0deg,transparent,rgba(117,179,229,.55),rgba(223,255,79,.95),transparent 38%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:homeSpin 10s linear infinite;pointer-events:none}.home-lift{transition:transform .28s ease,box-shadow .28s ease,background .28s ease}.home-lift:hover{transform:translateY(-6px);box-shadow:0 26px 80px rgba(65,78,74,.2)}.home-wave:after{content:'';position:absolute;left:-20%;right:-20%;bottom:18%;height:8rem;border-radius:100%;border-top:2px solid rgba(117,179,229,.52);box-shadow:0 -8px 28px rgba(117,179,229,.25),0 20px 55px rgba(223,255,79,.24);animation:homeWave 8s ease-in-out infinite alternate}@keyframes homeMesh{0%{transform:translate3d(-4%,-2%,0) rotate(0deg) scale(1)}100%{transform:translate3d(4%,3%,0) rotate(18deg) scale(1.08)}}@keyframes homeSpin{to{transform:rotate(360deg)}}@keyframes homeWave{from{transform:translateX(-1.5rem) rotate(-3deg)}to{transform:translateX(1.7rem) rotate(-1deg)}}
      `}</style>
      <div className="home-mesh" />
      <div className="mx-auto max-w-7xl">
        <header className="sticky top-4 z-50 mb-5">
          <nav className="home-mica home-ring rounded-[2rem] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SecretLogoGate />
                <div>
                  <p className="text-xl font-black tracking-tight">DLAVIE</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Digital commerce</p>
                </div>
              </div>
              <div className="hidden gap-2 md:flex">
                <a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black ring-1 ring-black/5" href="/products">Produk</a>
                <a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black ring-1 ring-black/5" href="/wallet">Wallet</a>
                <a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black ring-1 ring-black/5" href="/orders">Orders</a>
              </div>
              <a href="/dashboard" className="rounded-full bg-slate-950 px-4 py-2.5 text-xs font-black text-[#dfff4f] shadow-[0_18px_48px_rgba(16,19,21,.18)]">Dashboard</a>
            </div>
          </nav>
        </header>

        <DlavieBrandMotion />

        <section className="home-mica home-wave relative mt-5 overflow-hidden rounded-[2.8rem] p-6 md:p-10">
          <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full bg-[#dfff4f]/60 blur-2xl md:block" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#dfff4f]">DLAVIE Pay</p>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.045em] md:text-7xl">Bayar digital terasa lebih ringan.</h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600 md:text-lg">Pulsa, data, PLN, game, voucher, wallet, dan reward dibuat dalam satu menu produk yang cepat dipahami. Fokusnya bukan ramai, tapi jelas.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/products" className="rounded-[1.25rem] bg-[#dfff4f] px-5 py-4 text-sm font-black text-slate-950 shadow-[0_18px_44px_rgba(176,205,55,.24)]">Buka Produk</a>
                <a href="/wallet" className="rounded-[1.25rem] bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-[0_18px_48px_rgba(16,19,21,.2)]">Isi Wallet</a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <a key={service.href} href={service.href} className={`home-lift rounded-[1.6rem] bg-gradient-to-br ${service.color} p-5 shadow-sm ring-1 ring-black/5`}>
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-[1.15rem] bg-white/75 shadow-sm ring-1 ring-black/5">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 7h14M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7M9 11h6M10 15h4" /></svg>
                  </div>
                  <p className="text-lg font-black">{service.label}</p>
                  <p className="mt-2 text-sm font-bold text-slate-500">{service.note}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <VipStatusBanner />
      </div>
    </main>
  );
}