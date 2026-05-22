import { useEffect, useState } from 'react';
import { SecretLogoGate } from '@/components/secret-logo-gate';

const VERSION = 'v1.4.0';

const slides = [
  {
    tag: 'Bayar harian',
    title: 'Pulsa, data, PLN, dan game dalam satu tempat.',
    body: 'Pilih layanan, bayar pakai D-Balance, lalu cek statusnya tanpa buka banyak halaman.',
    href: '/products',
    cta: 'Mulai transaksi'
  },
  {
    tag: 'Auto Gateway',
    title: 'Top up saldo tidak perlu ditebak lagi.',
    body: 'Pembayaran otomatis dicek lewat gateway. Kalau manual, bukti pembayaran wajib jelas sebelum diproses admin.',
    href: '/wallet',
    cta: 'Isi saldo'
  },
  {
    tag: 'Akun rapi',
    title: 'Riwayat, order, dan reward tetap kelihatan.',
    body: 'Semua aktivitas penting dibuat mudah dibaca, supaya user dan admin tidak bingung saat ada transaksi.',
    href: '/dashboard',
    cta: 'Buka dashboard'
  }
];

const services = [
  { name: 'Pulsa', icon: '📱', href: '/products?type=pulsa', note: 'Isi cepat' },
  { name: 'Paket Data', icon: '🌐', href: '/products?type=data', note: 'Internet' },
  { name: 'Token PLN', icon: '⚡', href: '/products?type=pln', note: 'Listrik' },
  { name: 'Game', icon: '🎮', href: '/products?type=game', note: 'Top up' },
  { name: 'Voucher', icon: '🎟️', href: '/products?type=voucher', note: 'Kode digital' },
  { name: 'Wallet', icon: '💳', href: '/wallet', note: 'D-Balance' },
  { name: 'Order', icon: '🧾', href: '/orders', note: 'Status beli' },
  { name: 'Reward', icon: '✦', href: '/rewards', note: 'D-Points' }
];

const dock = [
  { label: 'Home', href: '/', mark: 'D' },
  { label: 'Produk', href: '/products', mark: '◈' },
  { label: 'Wallet', href: '/wallet', mark: '◍' },
  { label: 'Order', href: '/orders', mark: '≡' },
  { label: 'Admin', href: '/admin', mark: '⌘' }
];

export default function Home() {
  const [active, setActive] = useState(0);
  const [clock, setClock] = useState('--:--');
  const slide = slides[active];

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const timer = window.setInterval(tick, 20000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="cosmic-home relative min-h-screen overflow-hidden bg-[#020418] px-3 pb-28 pt-4 text-white md:px-7 md:pb-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(38,120,255,.32),transparent_30rem),radial-gradient(circle_at_82%_20%,rgba(221,42,255,.24),transparent_28rem),linear-gradient(145deg,#020418,#061743_52%,#17051f)]" />
        <div className="absolute inset-0 opacity-[.12] [background-image:radial-gradient(circle,rgba(255,255,255,.75)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute -left-28 bottom-[18%] h-52 w-[52rem] rotate-[8deg] rounded-[100%] border border-cyan-300/25 bg-cyan-400/10 blur-xl" />
        <div className="absolute -right-24 bottom-[11%] h-52 w-[54rem] rotate-[-7deg] rounded-[100%] border border-fuchsia-300/25 bg-fuchsia-500/10 blur-xl" />
      </div>

      <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <div className="ios26-glass flex flex-col gap-2 rounded-[2rem] p-2">
          {dock.map((item) => (
            <a key={item.href} href={item.href} className="group relative grid h-12 w-12 place-items-center rounded-[1.2rem] bg-white/[.08] text-xs font-black text-white/75 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/18 hover:text-white">
              {item.mark}
              <span className="pointer-events-none absolute left-14 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ring-1 ring-white/15 backdrop-blur-xl group-hover:block">{item.label}</span>
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
                  <p className="text-xl font-black tracking-tight md:text-2xl">Dlavie</p>
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/48">bayar digital lebih rapi</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <a href="/products" className="rounded-full bg-white/[.07] px-4 py-2 text-xs font-black text-white/72 ring-1 ring-white/10 hover:bg-white/15">Produk</a>
                <a href="/wallet" className="rounded-full bg-white/[.07] px-4 py-2 text-xs font-black text-white/72 ring-1 ring-white/10 hover:bg-white/15">Wallet</a>
                <a href="/orders" className="rounded-full bg-white/[.07] px-4 py-2 text-xs font-black text-white/72 ring-1 ring-white/10 hover:bg-white/15">Order</a>
                <a href="/premium" className="rounded-full bg-white/[.07] px-4 py-2 text-xs font-black text-white/72 ring-1 ring-white/10 hover:bg-white/15">VIP</a>
              </div>
              <a href="/dashboard" className="rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#07112f] shadow-[0_0_30px_rgba(255,255,255,.18)]">Dashboard</a>
            </div>
          </nav>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
          <article className="ios26-panel relative min-h-[34rem] overflow-hidden rounded-[2.4rem] p-5 md:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/16 via-violet-500/14 to-fuchsia-500/18" />
            <div className="pointer-events-none absolute left-[-8rem] top-[44%] h-40 w-[44rem] rotate-[9deg] rounded-[100%] border border-cyan-200/35 bg-cyan-300/10 blur-xl" />
            <div className="pointer-events-none absolute right-[-10rem] top-[52%] h-40 w-[48rem] rotate-[-8deg] rounded-[100%] border border-fuchsia-200/35 bg-fuchsia-400/10 blur-xl" />
            <div className="relative z-10 flex min-h-[29rem] flex-col justify-between gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100 ring-1 ring-white/15">{slide.tag}</span>
                  <span className="rounded-full bg-black/18 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/55 ring-1 ring-white/10">{clock} · {VERSION}</span>
                </div>
                <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[.9] tracking-[-.065em] md:text-7xl">Bayar kebutuhan digital tanpa ribet.</h1>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-blue-50/68 md:text-lg">Dlavie dibuat untuk transaksi harian: pulsa, paket data, token PLN, game, voucher, dan saldo. Cepat dipakai, mudah dicek, tidak bikin user menebak-nebak.</p>
              </div>
              <div className="rounded-[1.55rem] bg-white/[.075] p-4 ring-1 ring-white/10 backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/48">{slide.title}</p>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/58">{slide.body}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {slides.map((_, index) => <button key={index} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition-all ${active === index ? 'w-10 bg-white shadow-[0_0_22px_rgba(255,255,255,.5)]' : 'w-2.5 bg-white/28'}`} aria-label={`Slide ${index + 1}`} />)}
                  </div>
                  <a href={slide.href} className="ios26-button rounded-full px-5 py-3 text-sm font-black">{slide.cta}</a>
                </div>
              </div>
            </div>
          </article>

          <section className="grid gap-4">
            <div className="ios26-panel rounded-[2rem] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/45">Layanan cepat</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">Mau bayar apa?</h2>
                </div>
                <a href="/products" className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 ring-1 ring-white/10">Semua</a>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-4 lg:grid-cols-4">
                {services.map((item) => (
                  <a key={item.name} href={item.href} className="group rounded-[1.22rem] bg-white/[.075] p-3 text-center ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[.14]">
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-[.95rem] bg-white/12 text-lg ring-1 ring-white/10 transition group-hover:scale-105">{item.icon}</span>
                    <span className="mt-2 block truncate text-[11px] font-black">{item.name}</span>
                    <span className="mt-1 block truncate text-[9px] font-bold text-white/36">{item.note}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="ios26-panel rounded-[1.6rem] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">D-Balance</p>
                <p className="mt-2 text-3xl font-black">Rp 0</p>
                <p className="mt-1 text-xs font-bold text-white/40">Login untuk sinkron saldo.</p>
                <a href="/wallet" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-[#07112f]">Isi saldo</a>
              </div>
              <div className="ios26-panel rounded-[1.6rem] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Order</p>
                <p className="mt-2 text-3xl font-black">0</p>
                <p className="mt-1 text-xs font-bold text-white/40">Cek status pembelian.</p>
                <a href="/orders" className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black ring-1 ring-white/10">Lihat order</a>
              </div>
            </div>

            <div className="ios26-panel rounded-[2rem] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-100/45">Alur transaksi</p>
              <div className="mt-3 grid gap-2">
                {['Pilih layanan', 'Bayar pakai D-Balance', 'Status order tercatat'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-[1.15rem] bg-white/[.07] p-3 ring-1 ring-white/10">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-[#07112f]">{index + 1}</span>
                    <p className="text-sm font-black">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>

      <nav className="fixed inset-x-3 bottom-4 z-50 rounded-[1.6rem] bg-[#07112f]/72 p-2 shadow-[0_18px_70px_rgba(0,0,0,.36)] ring-1 ring-white/12 backdrop-blur-2xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {dock.map((item) => (
            <a key={item.href} href={item.href} className="rounded-[1.1rem] px-2 py-2 text-center text-[10px] font-black text-white/68 transition hover:bg-white/10 hover:text-white"><span className="block text-base">{item.mark}</span>{item.label}</a>
          ))}
        </div>
      </nav>
    </main>
  );
}
