import { useEffect, useMemo, useState } from 'react';
import { SecretLogoGate } from '@/components/secret-logo-gate';

const VERSION = 'v1.3.0';

const banners = [
  {
    eyebrow: 'DLAVIE SIGNAL',
    title: 'Topup, checkout, dan reward dalam satu orbit.',
    text: 'PPOB-style commerce dengan D-Balance, produk digital, VIP tier, dan admin control yang rapi.',
    href: '/wallet',
    cta: 'Open Wallet',
    aura: 'from-cyan-400/28 via-violet-500/22 to-fuchsia-500/24'
  },
  {
    eyebrow: 'AUTO GATEWAY',
    title: 'Bayar otomatis, saldo tersinkron, pengalaman tetap smooth.',
    text: 'Auto topup Midtrans, manual proof upload, dan review admin untuk transaksi yang lebih jelas.',
    href: '/wallet#wallet-panel',
    cta: 'Topup Now',
    aura: 'from-[#5227ff]/30 via-[#b497cf]/24 to-[#7cff67]/20'
  },
  {
    eyebrow: 'VIP COMMERCE',
    title: 'Benefit, referral, dan loyalty dibuat lebih terlihat.',
    text: 'Bangun repeat order dengan tier VIP, referral reward, D-Points, dan secure account center.',
    href: '/premium',
    cta: 'View VIP',
    aura: 'from-fuchsia-500/26 via-blue-500/20 to-cyan-300/24'
  }
];

const services = [
  { label: 'Pulsa', icon: '📱', href: '/products?type=pulsa', hint: 'Instant mobile credit' },
  { label: 'Data', icon: '🌐', href: '/products?type=data', hint: 'Internet package' },
  { label: 'PLN', icon: '⚡', href: '/products?type=pln', hint: 'Token & bills' },
  { label: 'Game', icon: '🎮', href: '/products?type=game', hint: 'Topup game' },
  { label: 'E-Wallet', icon: '💳', href: '/wallet', hint: 'D-Balance' },
  { label: 'Voucher', icon: '🎟️', href: '/products?type=voucher', hint: 'Digital voucher' },
  { label: 'Orders', icon: '🧾', href: '/orders', hint: 'Track purchase' },
  { label: 'Rewards', icon: '✦', href: '/rewards', hint: 'D-Points vault' }
];

const quickDock = [
  { label: 'Home', href: '/', icon: 'D' },
  { label: 'Shop', href: '/products', icon: '◈' },
  { label: 'Wallet', href: '/wallet', icon: '◍' },
  { label: 'Orders', href: '/orders', icon: '≡' },
  { label: 'Admin', href: '/admin', icon: '⌘' }
];

const metrics = [
  { label: 'Gateway', value: 'Auto', hint: 'Midtrans + manual proof' },
  { label: 'Wallet', value: 'D-Balance', hint: 'Fast checkout' },
  { label: 'Security', value: 'Guard', hint: 'Auth + device logs' }
];

export default function Home() {
  const [active, setActive] = useState(0);
  const [clock, setClock] = useState('--:--');
  const banner = banners[active];

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const timer = window.setInterval(tick, 20_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % banners.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  const primaryServices = useMemo(() => services.slice(0, 6), []);

  return (
    <main className="cosmic-home min-h-screen overflow-hidden px-3 pb-28 pt-4 text-white md:px-7 md:pb-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#03051a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_10%,rgba(19,102,255,.28),transparent_34rem),radial-gradient(circle_at_78%_28%,rgba(208,36,255,.22),transparent_31rem),linear-gradient(145deg,#03051a,#06133b_48%,#11051f)]" />
        <div className="absolute -left-24 bottom-16 h-72 w-[42rem] rotate-[-8deg] rounded-[100%] border border-cyan-300/25 bg-cyan-400/10 blur-2xl" />
        <div className="absolute -right-16 bottom-4 h-72 w-[44rem] rotate-[8deg] rounded-[100%] border border-fuchsia-300/25 bg-fuchsia-500/10 blur-2xl" />
        <div className="absolute inset-0 opacity-[.13] [background-image:radial-gradient(circle,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <div className="ios26-glass flex flex-col gap-2 rounded-[2rem] p-2 shadow-[0_24px_90px_rgba(0,0,0,.34)]">
          {quickDock.map((item) => (
            <a key={item.href} href={item.href} className="group relative grid h-12 w-12 place-items-center rounded-[1.2rem] bg-white/[.08] text-xs font-black text-white/80 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/18 hover:text-white">
              {item.icon}
              <span className="pointer-events-none absolute left-14 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/15 backdrop-blur-xl group-hover:block">{item.label}</span>
            </a>
          ))}
        </div>
      </aside>

      <div className="mx-auto max-w-7xl lg:pl-20">
        <header className="sticky top-3 z-50 mb-4">
          <nav className="ios26-glass rounded-[1.7rem] px-3 py-3 md:px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <SecretLogoGate />
                <div className="min-w-0">
                  <p className="text-xl font-black tracking-tight text-white md:text-2xl">DLAVIE</p>
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/50">AI commerce orbit</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                {['products', 'wallet', 'orders', 'premium', 'security'].map((item) => (
                  <a key={item} href={`/${item}`} className="rounded-full bg-white/[.07] px-4 py-2 text-xs font-black capitalize text-white/72 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white">{item}</a>
                ))}
              </div>
              <a href="/dashboard" className="rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#07112f] shadow-[0_0_30px_rgba(255,255,255,.18)] transition hover:-translate-y-0.5">Dashboard</a>
            </div>
          </nav>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.06fr_.94fr] lg:items-stretch">
          <article className="ios26-panel relative min-h-[31rem] overflow-hidden rounded-[2.35rem] p-5 md:p-8">
            <div className={`absolute inset-0 bg-gradient-to-br ${banner.aura}`} />
            <div className="pointer-events-none absolute -left-28 bottom-8 h-56 w-[46rem] rotate-[5deg] rounded-[100%] border border-cyan-200/30 bg-cyan-300/10 blur-xl" />
            <div className="pointer-events-none absolute -right-28 bottom-16 h-56 w-[46rem] rotate-[-7deg] rounded-[100%] border border-fuchsia-200/30 bg-fuchsia-400/10 blur-xl" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100 ring-1 ring-white/15">{banner.eyebrow}</span>
                  <span className="rounded-full bg-black/18 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/60 ring-1 ring-white/10">{clock} WIB · {VERSION}</span>
                </div>
                <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.06em] text-white md:text-7xl">{banner.title}</h1>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-blue-50/68 md:text-lg">{banner.text}</p>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-wrap gap-3">
                  <a href={banner.href} className="ios26-button rounded-full px-5 py-3.5 text-sm font-black text-white">{banner.cta}</a>
                  <a href="/products" className="rounded-full bg-white/10 px-5 py-3.5 text-sm font-black text-white ring-1 ring-white/15 backdrop-blur-xl transition hover:bg-white/18">Explore PPOB</a>
                </div>
                <div className="flex gap-2">
                  {banners.map((_, index) => (
                    <button key={index} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition-all ${index === active ? 'w-10 bg-white shadow-[0_0_22px_rgba(255,255,255,.5)]' : 'w-2.5 bg-white/28 hover:bg-white/60'}`} aria-label={`Open banner ${index + 1}`} />
                  ))}
                </div>
              </div>
            </div>
          </article>

          <section className="grid gap-4">
            <div className="ios26-panel rounded-[2rem] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/45">Quick PPOB</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Pilih layanan</h2>
                </div>
                <a href="/products" className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 ring-1 ring-white/10">All</a>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
                {primaryServices.map((item) => (
                  <a key={item.label} href={item.href} className="group rounded-[1.25rem] bg-white/[.075] p-3 text-center ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[.14]">
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-[1rem] bg-white/12 text-xl shadow-[inset_0_1px_0_rgba(255,255,255,.16)] ring-1 ring-white/10 transition group-hover:scale-105">{item.icon}</span>
                    <span className="mt-2 block text-xs font-black text-white">{item.label}</span>
                    <span className="mt-1 block truncate text-[10px] font-bold text-white/40">{item.hint}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="ios26-glass rounded-[1.55rem] p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">{metric.label}</p>
                  <p className="mt-2 text-lg font-black text-white">{metric.value}</p>
                  <p className="mt-1 text-[10px] font-bold leading-4 text-white/38">{metric.hint}</p>
                </div>
              ))}
            </div>

            <div className="ios26-panel rounded-[2rem] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-100/45">Smart command</p>
              <div className="mt-3 grid gap-2">
                {services.slice(6).map((item) => (
                  <a key={item.label} href={item.href} className="flex items-center justify-between rounded-[1.15rem] bg-white/[.075] p-3 ring-1 ring-white/10 transition hover:bg-white/[.14]">
                    <span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/12">{item.icon}</span><span><b className="block text-sm text-white">{item.label}</b><small className="font-bold text-white/40">{item.hint}</small></span></span>
                    <span className="text-white/40">→</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
          <div className="ios26-panel rounded-[2rem] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/45">Wallet card</p>
            <div className="mt-4 rounded-[1.65rem] bg-gradient-to-br from-white/18 to-white/[.06] p-5 ring-1 ring-white/12">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">D-Balance</p>
              <p className="mt-2 text-4xl font-black tracking-tight text-white">Rp 0</p>
              <p className="mt-2 text-sm font-bold text-white/45">Login untuk sinkron saldo dan transaksi.</p>
              <a href="/wallet" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#07112f]">Manage Wallet</a>
            </div>
          </div>

          <div className="ios26-panel rounded-[2rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/45">Commerce flow</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Dari layanan ke checkout lebih cepat.</h2>
              </div>
              <a href="/checkout" className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/70 ring-1 ring-white/10 md:block">Checkout</a>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {['Pilih produk', 'Bayar saldo', 'Order masuk', 'Reward aktif'].map((step, index) => (
                <div key={step} className="relative rounded-[1.4rem] bg-white/[.075] p-4 ring-1 ring-white/10">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-black text-[#07112f]">{index + 1}</span>
                  <p className="mt-4 text-sm font-black text-white">{step}</p>
                  <p className="mt-1 text-xs font-bold leading-5 text-white/38">Flow dibuat compact agar cocok untuk mobile dan desktop.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-3 bottom-4 z-50 rounded-[1.6rem] bg-[#07112f]/72 p-2 shadow-[0_18px_70px_rgba(0,0,0,.36)] ring-1 ring-white/12 backdrop-blur-2xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {quickDock.map((item) => (
            <a key={item.href} href={item.href} className="rounded-[1.1rem] px-2 py-2 text-center text-[10px] font-black text-white/68 transition hover:bg-white/10 hover:text-white"><span className="block text-base">{item.icon}</span>{item.label}</a>
          ))}
        </div>
      </nav>
    </main>
  );
}
