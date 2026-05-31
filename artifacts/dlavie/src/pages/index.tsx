import {
  ArrowRight,
  Bell,
  CreditCard,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { DlavieBrandMotion } from "@/components/dlavie-brand-motion";
import { DlaviePremiumHome } from "@/components/dlavie-premium-home";
import { SecretLogoGate } from "@/components/secret-logo-gate";
import { VipStatusBanner } from "@/components/vip-status-banner";

const categories = [
  "PPOB",
  "Wallet",
  "Gaming",
  "Rewards",
  "Premium",
  "AI Assist",
];

const showcaseProducts = [
  {
    name: "Data Flash",
    meta: "Paket internet cepat",
    price: "Rp 25K",
    tone: "from-[#c7a329] to-[#ac531e]",
  },
  {
    name: "Game Credits",
    meta: "Voucher gaming instan",
    price: "Rp 50K",
    tone: "from-[#3f75a2] to-[#5f4930]",
  },
  {
    name: "PLN Token",
    meta: "Token listrik harian",
    price: "Rp 100K",
    tone: "from-[#e5e4e2] to-[#c7a329]",
  },
];

const insights = [
  { icon: ShieldCheck, label: "Secure flow", value: "2FA ready" },
  { icon: PackageCheck, label: "Order pulse", value: "Live status" },
  { icon: WalletCards, label: "DLAVIE Pay", value: "Fast topup" },
];

export default function Home() {
  return (
    <main className="dlv-app-frame relative min-h-screen overflow-hidden px-4 pb-8 pt-4 text-[#e5e4e2] sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="dlv-hyper-grid absolute inset-0" />
        <div className="dlv-hyper-noise absolute inset-0" />
        <span className="dlv-orb left-[-8rem] top-24 h-72 w-72 bg-[#c7a329]/30" />
        <span className="dlv-orb right-[-7rem] top-10 h-80 w-80 bg-[#3f75a2]/24" />
        <span className="dlv-orb bottom-20 left-1/3 h-72 w-72 bg-[#ac531e]/20" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="sticky top-3 z-50 dlv-scroll-reveal">
          <nav className="dlv-glass-card rounded-[2rem] px-3 py-3 sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <a href="/" className="flex items-center gap-3">
                <SecretLogoGate />
                <div>
                  <p className="text-lg font-black leading-none tracking-[-0.04em] text-white">
                    DLAVIE
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c3b49d]/70">
                    commerce OS
                  </p>
                </div>
              </a>

              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] p-1 md:flex">
                {["Products", "Wallet", "Orders", "AI"].map((item) => (
                  <a
                    key={item}
                    href={`/${item === "Products" ? "products" : item.toLowerCase()}`}
                    className="dlv-liquid-tab rounded-full px-4 py-2 text-xs font-bold text-[#e5e4e2]/68 transition hover:text-white"
                  >
                    {item}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="hidden rounded-full px-4 py-2 text-xs font-bold text-[#e5e4e2]/70 transition hover:text-white sm:block"
                >
                  Login
                </a>
                <a
                  href="/dashboard"
                  className="dlv-gold-button dlv-magnetic rounded-full px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 sm:px-5"
                >
                  Dashboard
                </a>
              </div>
            </div>
          </nav>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
          <div className="dlv-glass-card dlv-scroll-reveal rounded-[2.4rem] p-5 sm:p-7 lg:p-9">
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <span className="dlv-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em]">
                <Sparkles className="h-3.5 w-3.5 text-[#c7a329]" /> Hypermotion
                3.0
              </span>
              <span className="dlv-pill rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em]">
                Dark commerce redesign
              </span>
            </div>

            <h1 className="dlv-hero-title max-w-4xl text-[3.3rem] font-black leading-[0.9] sm:text-7xl lg:text-8xl">
              Belanja digital terasa premium, cepat, dan hidup.
            </h1>
            <p className="dlv-soft-text mt-6 max-w-2xl text-base font-semibold leading-8 sm:text-lg">
              DLAVIE kini memakai visual gelap, product cards besar, quick
              action, wallet pulse, dan motion engine yang membuat transaksi
              harian terasa seperti aplikasi commerce modern.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/products"
                className="dlv-gold-button dlv-magnetic inline-flex items-center gap-2 rounded-[1.25rem] px-5 py-4 text-sm font-black transition hover:-translate-y-1"
              >
                Mulai Belanja <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/wallet"
                className="dlv-dark-button dlv-magnetic rounded-[1.25rem] px-5 py-4 text-sm font-black transition hover:-translate-y-1"
              >
                Top Up Wallet
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {insights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4"
                  >
                    <Icon className="h-5 w-5 text-[#c7a329]" />
                    <p className="mt-4 text-lg font-black tracking-[-0.04em] text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c3b49d]/58">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="dlv-phone-shell dlv-scroll-reveal mx-auto w-full max-w-[430px] rounded-[2.8rem] p-3 lg:max-w-none">
            <div className="dlv-phone-notch mx-auto mb-3 h-6 w-32 rounded-full" />
            <div className="rounded-[2.15rem] border border-white/10 bg-[#0b0a07] p-4 shadow-inner">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c3b49d]/55">
                    Good evening
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-white">
                    Mau transaksi apa?
                  </h2>
                </div>
                <button className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                  <Bell className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.055] px-4 py-3">
                <Search className="h-4 w-4 text-[#c3b49d]" />
                <span className="text-sm font-semibold text-[#e5e4e2]/52">
                  Cari pulsa, token, voucher...
                </span>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {categories.map((item, index) => (
                  <a
                    key={item}
                    href={index === 0 ? "/products" : "/rewards"}
                    className="dlv-category-chip shrink-0 rounded-full px-4 py-2 text-xs font-black text-[#e5e4e2]/72"
                  >
                    {item}
                  </a>
                ))}
              </div>

              <div className="mt-5 rounded-[1.8rem] bg-gradient-to-br from-[#c7a329] via-[#ac531e] to-[#3f75a2] p-[1px]">
                <div className="rounded-[1.75rem] bg-[#0b0a07]/88 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#fff0b7]/70">
                        DLAVIE Balance
                      </p>
                      <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">
                        Rp 1.280.000
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-[#c7a329]" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href="/wallet"
                      className="dlv-gold-button rounded-[1rem] px-3 py-3 text-center text-xs font-black"
                    >
                      Top Up
                    </a>
                    <a
                      href="/orders"
                      className="rounded-[1rem] border border-white/10 bg-white/[0.07] px-3 py-3 text-center text-xs font-black text-white"
                    >
                      Riwayat
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {showcaseProducts.map((product, index) => (
                  <a
                    key={product.name}
                    href="/products"
                    className="dlv-product-card flex items-center gap-3 rounded-[1.55rem] p-3"
                  >
                    <div
                      className={`dlv-product-visual grid h-16 w-16 shrink-0 place-items-center rounded-[1.25rem] bg-gradient-to-br ${product.tone}`}
                    >
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">
                        {product.name}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-[#c3b49d]/62">
                        {product.meta}
                      </p>
                    </div>
                    <p className="text-sm font-black text-[#f4d675]">
                      {product.price}
                    </p>
                    <span className="sr-only">Open product {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <DlaviePremiumHome />
        <DlavieBrandMotion />

        <div className="dlv-scroll-reveal">
          <VipStatusBanner />
        </div>
      </div>
    </main>
  );
}
