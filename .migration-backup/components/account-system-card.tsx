type AccountSystemCardProps = {
  title?: string;
  status: string;
  verified?: boolean;
  trustedCount?: number;
  eventCount?: number;
};

export function AccountSystemCard({
  title = 'System Status',
  status,
  verified = false,
  trustedCount = 0,
  eventCount = 0,
}: AccountSystemCardProps) {
  const items = [
    { label: 'Email', value: verified ? 'Verified' : 'Check', tone: verified ? 'text-green-700' : 'text-amber-700' },
    { label: 'Trusted', value: `${trustedCount} device`, tone: 'text-slate-950' },
    { label: 'Events', value: `${eventCount} log`, tone: 'text-slate-950' },
  ];

  return (
    <div className="dlavie-soft-card rounded-[1.6rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{status}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfff4f] text-lg font-black text-slate-950 shadow-sm">✓</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-[1.15rem] bg-white/75 p-3 ring-1 ring-black/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
            <p className={`mt-1 text-sm font-black ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
