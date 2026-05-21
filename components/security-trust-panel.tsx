type SecurityTrustPanelProps = {
  confirmed: boolean;
  eventCount: number;
  trustedCount: number;
  riskyCount: number;
};

export function SecurityTrustPanel({ confirmed, eventCount, trustedCount, riskyCount }: SecurityTrustPanelProps) {
  const score = Math.min(100, 35 + (confirmed ? 25 : 0) + Math.min(eventCount, 4) * 5 + Math.min(trustedCount, 3) * 8 - Math.min(riskyCount, 5) * 6);
  const tone = score >= 75 ? 'Strong' : score >= 55 ? 'Good' : 'Needs Check';

  return (
    <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,.2)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff9f43]">Trust Score</p>
          <h2 className="mt-3 text-5xl font-black tracking-tight">{score}%</h2>
          <p className="mt-2 text-sm font-semibold text-white/55">Security posture: {tone}</p>
        </div>
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white/10 ring-1 ring-white/10">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#ff9f43] text-2xl font-black text-slate-950">✓</div>
        </div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#ff9f43] transition-all duration-700" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.3rem] bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-white/35">Email</p>
          <p className="mt-1 font-black">{confirmed ? 'Verified' : 'Required'}</p>
        </div>
        <div className="rounded-[1.3rem] bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-white/35">Trusted</p>
          <p className="mt-1 font-black">{trustedCount} devices</p>
        </div>
        <div className="rounded-[1.3rem] bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-white/35">Risk</p>
          <p className="mt-1 font-black">{riskyCount} events</p>
        </div>
      </div>
    </section>
  );
}
