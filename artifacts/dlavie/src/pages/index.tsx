import { DlavieBrandMotion } from '@/components/dlavie-brand-motion';
import { DlaviePremiumHome } from '@/components/dlavie-premium-home';
import { SecretLogoGate } from '@/components/secret-logo-gate';
import { VipStatusBanner } from '@/components/vip-status-banner';

export default function Home() {
  return (
    <main className="dlavie-lux-page min-h-screen overflow-hidden px-4 py-5 text-white md:px-8 md:py-8">
      <div className="dlavie-mesh" />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="dlavie-holo-noise absolute inset-0" />
        <div className="dlavie-scanline absolute inset-0" />
      </div>

      <div className="mx-auto max-w-7xl">
        <header className="sticky top-4 z-50 mb-5 dlv-reveal">
          <nav className="dlavie-glass dlavie-edge-flow rounded-[2rem] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SecretLogoGate />
                <div>
                  <p className="text-xl font-semibold tracking-[-.04em] text-white">DLAVIE</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">Digital services</p>
                </div>
              </div>
              <div className="hidden gap-2 md:flex">
                <a className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/68 transition hover:bg-white/[0.08] hover:text-white" href="/products">Produk</a>
                <a className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/68 transition hover:bg-white/[0.08] hover:text-white" href="/wallet">Wallet</a>
                <a className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/68 transition hover:bg-white/[0.08] hover:text-white" href="/orders">Orders</a>
              </div>
              <a href="/dashboard" className="dlavie-magnetic-cta rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#050505] shadow-[0_18px_48px_rgba(0,0,0,.22)]">Dashboard</a>
            </div>
          </nav>
        </header>

        <div className="dlv-reveal">
          <DlavieBrandMotion />
        </div>

        <DlaviePremiumHome />

        <div className="dlv-reveal dlv-lazy-media">
          <VipStatusBanner />
        </div>
      </div>
    </main>
  );
}
