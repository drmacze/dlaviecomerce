export function LoginAccessPanel() {
  return (
    <aside className="rounded-[2rem] bg-slate-950 p-5 text-white md:p-7">
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
    </aside>
  );
}
