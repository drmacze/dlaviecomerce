const services = [
  { label: 'Produk', note: 'Pulsa, data, PLN, game, dan voucher digital dalam alur transaksi yang rapi.', href: '/products' },
  { label: 'Wallet', note: 'Kelola D-Balance, top up, dan pembayaran dari satu ruang yang aman.', href: '/wallet' },
  { label: 'Orders', note: 'Pantau status transaksi, riwayat pembelian, dan proses fulfillment.', href: '/orders' },
  { label: 'Rewards', note: 'Akses benefit, poin, dan level pelanggan dengan tampilan yang lebih jelas.', href: '/rewards' }
];

const trust = [
  { value: '24/7', label: 'Access' },
  { value: 'PPOB', label: 'Ready' },
  { value: 'D-Balance', label: 'Wallet' }
];

export function DlaviePremiumHome() {
  return (
    <section className="dlavie-glass dlavie-edge-flow relative mt-5 overflow-hidden rounded-[2.8rem] p-6 md:p-10">
      <div className="pointer-events-none absolute right-10 top-10 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/38 md:flex">
        <span className="dlavie-accent-dot" />
        Online
      </div>
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div className="dlv-reveal">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
            <span className="dlavie-accent-dot" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/52">DLAVIE Pay</span>
          </div>
          <h1 className="dlv-text-balance max-w-3xl text-[3.4rem] font-semibold leading-[.9] tracking-[-.07em] text-white md:text-7xl">
            Transaksi digital yang terasa tenang, cepat, dan terkendali.
          </h1>
          <p className="dlv-text-balance mt-6 max-w-2xl text-base font-medium leading-8 text-white/52 md:text-lg">
            DLAVIE menyatukan produk PPOB, wallet, order tracking, dan reward dalam satu pengalaman yang bersih. Dibangun untuk transaksi harian tanpa tampilan yang berisik.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/products" className="dlavie-magnetic-cta rounded-[1.25rem] bg-white px-5 py-4 text-sm font-semibold text-[#050505] shadow-[0_20px_55px_rgba(0,0,0,.28)] transition hover:-translate-y-1">Buka Produk</a>
            <a href="/wallet" className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/82 transition hover:-translate-y-1 hover:bg-white/[0.08]">Isi Wallet</a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {trust.map((item) => (
              <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xl font-semibold tracking-[-.04em] text-white">{item.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/34">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <a key={service.href} href={service.href} className="dlv-reveal dlavie-kinetic-card dlavie-premium-surface rounded-[1.65rem] p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/[0.045]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/72" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M5 7h14M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7M9 11h6M10 15h4" /></svg>
              </div>
              <p className="text-lg font-semibold tracking-[-.03em] text-white">{service.label}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white/46">{service.note}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
