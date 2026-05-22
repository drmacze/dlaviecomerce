import { AmbientBg } from '@/components/ambient-bg';

export default function AmbientPreviewPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-950">
      <AmbientBg />
      <section className="relative z-10 mx-auto grid min-h-[86vh] max-w-5xl place-items-center">
        <article className="overflow-hidden rounded-[2.4rem] bg-white/68 p-6 shadow-[0_30px_100px_rgba(15,23,42,.18)] ring-1 ring-white/70 backdrop-blur-2xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">DLAVIE PREVIEW</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[.95] tracking-tight md:text-7xl">Gemini-style ambient background.</h1>
              <p className="mt-5 max-w-xl text-sm font-bold leading-7 text-slate-600 md:text-base">Jika halaman ini terlihat punya aurora pastel bergerak lembut di belakang card, berarti background global sudah siap dipakai di seluruh web.</p>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-950 text-3xl font-black text-[#dfff4f] shadow-[0_18px_55px_rgba(15,23,42,.22)]">D</div>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {['Blue Orb', 'Purple Glow', 'Pink Mesh', 'Cyan Light'].map((item) => (
              <div key={item} className="rounded-[1.35rem] bg-white/65 p-4 text-sm font-black shadow-sm ring-1 ring-white/70 backdrop-blur-xl">{item}</div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/wallet" className="rounded-full bg-[#dfff4f] px-5 py-3 text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(223,255,79,.24)]">Open Wallet</a>
            <a href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Open Dashboard</a>
          </div>
        </article>
      </section>
    </main>
  );
}
