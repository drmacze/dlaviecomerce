type LoginAccessPanelProps = {
  open: boolean;
  onToggle: () => void;
};

export function LoginAccessPanel({ open, onToggle }: LoginAccessPanelProps) {
  const chips = ['Wallet', 'Orders', 'Security', 'Rewards'];

  return (
    <aside className="relative overflow-hidden rounded-[1.8rem] bg-slate-950 p-4 pb-7 text-white shadow-[0_22px_65px_rgba(15,23,42,.24)] md:rounded-[2.2rem] md:p-6 md:pb-8">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#dfff4f]/12 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#75b3e5]/10 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="grid h-12 w-12 place-items-center rounded-full bg-[#dfff4f] text-lg font-black text-slate-950 md:h-14 md:w-14 md:text-xl">D</a>
          <div className="flex gap-2">
            <a href="/wallet" className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 ring-1 ring-white/10">Wallet</a>
            <span className="rounded-full bg-[#dfff4f] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-950">Member</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.15fr_.85fr] md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dfff4f]">DLAVIE ACCESS</p>
            <h1 className="mt-2 text-3xl font-black leading-[1.02] tracking-tight md:text-5xl">Login aman, cepat, premium.</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/58 md:max-w-md">Satu akses untuk wallet, order, reward, dan security center.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {chips.map((item) => (
              <a key={item} href={`/${item.toLowerCase()}`} className="rounded-full bg-white/10 px-3 py-2 text-center text-xs font-black text-white/75 ring-1 ring-white/10 transition hover:bg-[#dfff4f] hover:text-slate-950">{item}</a>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`absolute -bottom-6 left-1/2 z-20 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#dfff4f] text-xl font-black text-slate-950 shadow-[0_14px_36px_rgba(120,150,45,.24)] ring-8 ring-[#f6f2e9]/80 transition hover:-translate-y-1 active:scale-95 md:h-14 md:w-14 md:text-2xl ${open ? '' : 'dlavie-login-pulse'}`}
        aria-expanded={open}
        aria-label={open ? 'Tutup form login' : 'Buka form login'}
      >
        <span className={`transition-transform duration-500 ${open ? 'rotate-180' : ''}`}>↓</span>
      </button>
    </aside>
  );
}
