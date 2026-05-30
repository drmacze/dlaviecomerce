export default function MaintenancePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] px-5 py-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_4%,rgba(125,211,252,.14),transparent_24rem),radial-gradient(circle_at_82%_10%,rgba(216,180,254,.12),transparent_26rem),radial-gradient(circle_at_50%_100%,rgba(184,255,106,.12),transparent_30rem)]" />
      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[2.3rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_34px_120px_rgba(0,0,0,.58)] backdrop-blur-2xl md:p-8">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#bcff6a] shadow-[0_0_24px_rgba(188,255,106,.45)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/46">DLAVIE Maintenance</span>
          </div>

          <h1 className="max-w-xl text-5xl font-semibold leading-[.9] tracking-[-.07em] md:text-7xl">Kami sedang merapikan sistem.</h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/56 md:text-lg">
            DLAVIE sedang dalam mode maintenance. Seluruh halaman dan transaksi ditutup sementara agar proses update berjalan aman dan stabil.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/32">Status</p>
              <p className="mt-2 text-lg font-semibold text-white">Locked</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/32">Access</p>
              <p className="mt-2 text-lg font-semibold text-white">Temporarily closed</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/32">Control</p>
              <p className="mt-2 text-lg font-semibold text-white">Telegram Bot</p>
            </div>
          </div>

          <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm font-medium leading-6 text-white/50">
            Jika kamu adalah admin, matikan maintenance melalui bot Telegram DLAVIE atau endpoint runtime admin yang sudah terhubung.
          </div>
        </div>
      </section>
    </main>
  );
}
