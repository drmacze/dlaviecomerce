import { useState } from 'react';

export function SecretLogoGate() {
  const [clicks, setClicks] = useState(0);
  const open = clicks >= 5;
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setClicks(clicks + 1)} className="rounded-2xl border-2 border-slate-900 bg-emerald-400 px-4 py-3 text-xl font-black shadow-brutal-sm">LUMINA</button>
      {open && <a className="font-black text-emerald-700" href="/admin">Secret Admin</a>}
    </div>
  );
}
