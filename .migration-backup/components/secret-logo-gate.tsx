import { useState } from 'react';

export function SecretLogoGate() {
  const [clicks, setClicks] = useState(0);
  const open = clicks >= 5;
  return <div className="flex shrink-0 items-center gap-2"><button onClick={() => setClicks(clicks + 1)} className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black tracking-tight text-[#dfff4f] shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5">DLAVIE</button>{open && <a className="rounded-full bg-[#dfff4f] px-3 py-2 text-xs font-black text-slate-950 shadow-sm" href="/admin">Secret Admin</a>}</div>;
}
