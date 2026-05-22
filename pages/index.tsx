import { SecretLogoGate } from '@/components/secret-logo-gate';
import { VipStatusBanner } from '@/components/vip-status-banner';

const services = [
  { label: 'PPOB', note: 'Pulsa, data, PLN, game', href: '/ppob' },
  { label: 'Wallet', note: 'D-Balance & topup', href: '/wallet' },
  { label: 'Orders', note: 'Riwayat transaksi', href: '/orders' },
  { label: 'Rewards', note: 'D-Points & VIP', href: '/rewards' }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-950 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SecretLogoGate />
              <div>
                <p className="text-xl font-black tracking-tight">DLAVIE</p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Digital commerce</p>
              </div>
            </div>
            <a href="/dashboard" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-[#dfff4f]">Dashboard</a>
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[2.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#dfff4f]">DLAVIE Pay</p>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.045em] md:text-7xl">Bayar digital terasa lebih ringan.</h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600 md:text-lg">Pulsa, data, PLN, game, voucher, wallet, dan reward dibuat dalam tampilan yang cepat dipahami. Fokusnya bukan ramai, tapi jelas.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/ppob" className="rounded-[1.25rem] bg-[#dfff4f] px-5 py-4 text-sm font-black text-slate-950">Buka PPOB</a>
                <a href="/wallet" className="rounded-[1.25rem] bg-slate-950 px-5 py-4 text-sm font-black text-white">Isi Wallet</a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <a key={service.href} href={service.href} className="rounded-[1.6rem] bg-slate-50 p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
                  <p className="text-lg font-black">{service.label}</p>
                  <p className="mt-2 text-sm font-bold text-slate-400">{service.note}</p>
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
