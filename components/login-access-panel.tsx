type LoginAccessPanelProps = {
  open: boolean;
  onToggle: () => void;
};

export function LoginAccessPanel({ open, onToggle }: LoginAccessPanelProps) {
  return (
    <aside className="relative rounded-[2rem] bg-slate-950 p-5 pb-9 text-white shadow-[0_28px_80px_rgba(15,23,42,.28)] md:p-7 md:pb-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#dfff4f]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#75b3e5]/10 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="grid h-14 w-14 place-items-center rounded-full bg-[#dfff4f] text-xl font-black text-slate-950">D</a>
          <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Member Entry</span>
        </div>
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.34em] text-[#dfff4f]">DLAVIE ACCESS</p>
        <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight md:text-5xl">Login aman,<br />cepat, dan<br />tetap premium.</h1>
        <p className="mt-4 text-sm font-semibold leading-6 text-white/60">Akses wallet, orders, reward, dan pusat keamanan akun dari satu pintu masuk yang ringkas.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {['Email check', 'Device log', 'Strong pass'].map((item, index) => (
            <div key={item} className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10">
              <p className="text-xs font-black text-[#dfff4f]">0{index + 1}</p>
              <p className="mt-2 text-sm font-black">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`absolute -bottom-7 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#dfff4f] text-2xl font-black text-slate-950 shadow-[0_18px_45px_rgba(120,150,45,.28)] ring-8 ring-[#f6f2e9]/80 transition hover:-translate-y-1 active:scale-95 ${open ? '' : 'dlavie-login-pulse'}`}
        aria-expanded={open}
        aria-label={open ? 'Tutup form login' : 'Buka form login'}
      >
        <span className={`transition-transform duration-500 ${open ? 'rotate-180' : ''}`}>↓</span>
      </button>
    </aside>
  );
}
