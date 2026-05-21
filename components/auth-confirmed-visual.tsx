type AuthConfirmedVisualProps = {
  status: string;
  ready: boolean;
};

export function AuthConfirmedVisual({ status, ready }: AuthConfirmedVisualProps) {
  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 text-slate-950 md:p-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#dfff4f]/30 blur-3xl" />
        <div className="absolute -right-24 top-32 h-[28rem] w-[28rem] rounded-full bg-[#75b3e5]/25 blur-3xl" />
        <div className="absolute inset-0 dlavie-grid-bg opacity-40" />
      </div>
      <section className="dlavie-glass dlavie-edge-flow mx-auto grid max-w-5xl gap-4 rounded-[2.4rem] p-4 md:grid-cols-[.95fr_1.05fr] md:p-6">
        <aside className="rounded-[2rem] bg-slate-950 p-6 text-white md:p-8">
          <div className="flex items-center justify-between gap-3">
            <a href="/" className="grid h-16 w-16 place-items-center rounded-full bg-[#dfff4f] text-2xl font-black text-slate-950">D</a>
            <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Verified Access</span>
          </div>
          <p className="mt-8 text-[11px] font-black uppercase tracking-[0.34em] text-[#dfff4f]">DLAVIE AUTH GATE</p>
          <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">Email verified. Akun siap masuk DLAVIE.</h1>
          <p className="mt-5 text-sm font-semibold leading-7 text-white/60">Akses member untuk Dashboard, Wallet, Orders, Download Vault, dan Security Center sudah disiapkan.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {['Dashboard', 'Wallet', 'Security'].map((item, index) => <div key={item} className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-black text-[#dfff4f]">0{index + 1}</p><p className="mt-2 text-sm font-black">{item}</p></div>)}
          </div>
        </aside>
        <section className="rounded-[2rem] bg-white/70 p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Confirmation Status</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{ready ? 'Account verified' : 'Checking session'}</h2></div>
            <div className={`grid h-16 w-16 place-items-center rounded-full text-2xl font-black ${ready ? 'bg-[#dfff4f] text-slate-950' : 'bg-slate-950 text-[#dfff4f]'}`}>{ready ? '✓' : 'D'}</div>
          </div>
          <p className="mt-4 rounded-[1.35rem] bg-white/75 p-4 text-sm font-bold leading-6 text-slate-600 ring-1 ring-black/5">{status}</p>
          <div className="mt-5 grid gap-3">
            {['Email link opened', 'Session secured', 'Dashboard ready'].map((item, index) => <div key={item} className="flex gap-3 rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#dfff4f] text-sm font-black text-slate-950">{index + 1}</span><p className="self-center font-black text-slate-950">{item}</p></div>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a className="rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/dashboard">Dashboard</a>
            <a className="rounded-full bg-slate-950 px-5 py-3 font-black text-white" href="/security">Security</a>
            <a className="rounded-full bg-white px-5 py-3 font-black shadow-sm ring-1 ring-black/5" href="/login">Login</a>
          </div>
        </section>
      </section>
    </main>
  );
}
