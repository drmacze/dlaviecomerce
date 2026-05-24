const services = [
  { label: 'Pulsa', note: 'Isi nomor HP', href: '/products?type=pulsa', tone: '#dfff4f', path: 'M7 4h10v16H7z M10 7h4 M11 17h2' },
  { label: 'Paket Data', note: 'Internet harian', href: '/products?type=data', tone: '#75b3e5', path: 'M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16z M4 12h16 M12 4c2 2 3 5 3 8s-1 6-3 8 M12 4c-2 2-3 5-3 8s1 6 3 8' },
  { label: 'Token PLN', note: 'Listrik prabayar', href: '/products?type=pln', tone: '#f8ffbd', path: 'M13 2 4 14h7l-1 8 10-13h-7z' },
  { label: 'Game', note: 'Top up game', href: '/products?type=game', tone: '#c9b6ff', path: 'M7 13h3 M8.5 11.5v3 M15 12h.01 M17 14h.01 M6 8h12a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3l-2-2H8l-2 2a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z' },
  { label: 'Voucher', note: 'Kode digital', href: '/products?type=voucher', tone: '#ffd6a3', path: 'M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z M9 9v6 M15 9v6' },
  { label: 'E-Wallet', note: 'Saldo digital', href: '/wallet', tone: '#35cf72', path: 'M4 7h16v12H4z M16 12h4 M7 7V5h10v2' },
  { label: 'Riwayat', note: 'Cek order', href: '/orders', tone: '#ffffff', path: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6 M9 16h4' },
  { label: 'Reward', note: 'D-Points', href: '/rewards', tone: '#dff4ff', path: 'M12 3l2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8z' }
];

const flow = [
  ['1', 'Pilih produk', 'Buka kategori layanan yang kamu butuhkan.'],
  ['2', 'Isi data', 'Nomor HP, ID game, meter PLN, atau detail lain.'],
  ['3', 'Bayar', 'Gunakan D-Balance agar proses lebih cepat.'],
  ['4', 'Cek status', 'Order tersimpan dan bisa dipantau dari halaman Orders.']
] as const;

export default function ProductsPage() {
  return <main className="dlavie-system-page px-4 py-6 md:px-8">
    <div className="dlavie-mesh" />
    <section className="dlavie-mica dlavie-ring mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-5 md:p-8">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
        <article className="dlavie-wave-card relative overflow-hidden rounded-[2.1rem] bg-white/62 p-5 ring-1 ring-black/5 md:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#dfff4f]/50 blur-3xl dlavie-float-orb" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-[#75b3e5]/24 blur-3xl" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">DLAVIE PRODUK</p>
          <h1 className="relative mt-3 max-w-3xl text-4xl font-black leading-[.95] tracking-[-.045em] md:text-6xl">Satu menu untuk semua layanan digital.</h1>
          <p className="relative mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">Produk di DLAVIE berarti semua kebutuhan digital: pulsa, data, PLN, game, voucher, wallet, order, dan reward. Tidak dipisah-pisah agar user tidak bingung.</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <a className="dlavie-lime-btn rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-1" href="/wallet">Isi D-Balance</a>
            <a className="dlavie-primary-btn rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-1" href="/orders">Cek Orders</a>
          </div>
        </article>

        <aside className="grid gap-3 sm:grid-cols-2">
          {flow.map(([step, title, text]) => <div key={step} className="dlavie-lift rounded-[1.45rem] bg-white/68 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-black text-[#dfff4f]">{step}</span>
            <p className="mt-4 text-lg font-black">{title}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{text}</p>
          </div>)}
        </aside>
      </div>

      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Menu layanan</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">Pilih produk digital</h2>
          </div>
          <div className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm ring-1 ring-black/5">Unified Product Menu</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => <a key={service.label} href={service.href} style={{ '--tone': service.tone } as React.CSSProperties} className="dlavie-service-glow dlavie-lift group rounded-[1.55rem] bg-white/68 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[1.15rem] bg-white shadow-sm ring-1 ring-black/5 transition group-hover:-translate-y-1">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d={service.path} /></svg>
              </span>
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">Open</span>
            </div>
            <p className="mt-5 text-xl font-black">{service.label}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{service.note}</p>
          </a>)}
        </div>
      </section>
    </section>
  </main>;
}
