import {
  Bot,
  ChevronRight,
  Clock3,
  Gift,
  Package,
  ReceiptText,
  Shield,
  WalletCards,
} from "lucide-react";

const services = [
  {
    label: "Produk Digital",
    note: "Pulsa, data, token PLN, game, voucher, dan layanan harian.",
    href: "/products",
    icon: Package,
    accent: "#c7a329",
  },
  {
    label: "Smart Wallet",
    note: "Top up, balance, payment, dan kontrol transaksi dalam satu ruang.",
    href: "/wallet",
    icon: WalletCards,
    accent: "#3f75a2",
  },
  {
    label: "Order Radar",
    note: "Pantau status transaksi dan fulfillment dengan timeline yang jelas.",
    href: "/orders",
    icon: ReceiptText,
    accent: "#ac531e",
  },
  {
    label: "Rewards Club",
    note: "Poin, referral, check-in, dan benefit pelanggan loyal.",
    href: "/rewards",
    icon: Gift,
    accent: "#dfff4f",
  },
];

const timeline = [
  {
    step: "01",
    title: "Browse",
    copy: "Kategori ringkas dan kartu produk besar.",
  },
  { step: "02", title: "Pay", copy: "Wallet dan checkout terasa cepat." },
  { step: "03", title: "Track", copy: "Status order tetap terlihat jelas." },
];

export function DlaviePremiumHome() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <div className="dlv-glass-card dlv-scroll-reveal rounded-[2.3rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c7a329]">
              Commerce cockpit
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl">
              Semua flow utama dibuat seperti kartu aplikasi mobile premium.
            </h2>
          </div>
          <a
            href="/ai"
            className="dlv-dark-button dlv-magnetic inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-black transition hover:-translate-y-1"
          >
            <Bot className="h-4 w-4 text-[#c7a329]" /> AI Assist
          </a>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <a
                key={service.href}
                href={service.href}
                className="dlv-product-card group rounded-[1.65rem] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-[1.1rem] border border-white/10 bg-white/[0.06]"
                    style={{ color: service.accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/28 transition group-hover:translate-x-1 group-hover:text-[#c7a329]" />
                </div>
                <p className="mt-5 text-xl font-black tracking-[-0.04em] text-white">
                  {service.label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#c3b49d]/62">
                  {service.note}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      <aside className="dlv-command-card dlv-scroll-reveal rounded-[2.3rem] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c3b49d]/58">
              Live transaction path
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">
              Flow yang mudah dibaca.
            </h3>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c7a329]/18 text-[#f4d675] ring-1 ring-[#c7a329]/24">
            <Clock3 className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-7 space-y-3">
          {timeline.map((item) => (
            <div
              key={item.step}
              className="flex gap-4 rounded-[1.45rem] border border-white/10 bg-white/[0.045] p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.08] text-xs font-black text-[#c7a329]">
                {item.step}
              </span>
              <div>
                <p className="font-black text-white">{item.title}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#c3b49d]/62">
                  {item.copy}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="dlv-shimmer mt-5 rounded-[1.7rem] border border-[#c7a329]/22 bg-[#c7a329]/12 p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#f4d675]" />
            <p className="text-sm font-black text-white">
              Protected checkout, readable status, dan motion yang tetap ringan.
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}
