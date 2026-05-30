import { useEffect, useState } from 'react';

type RuntimeFlag = { enabled: boolean; description?: string };
type Announcement = { title: string; body: string; source?: string | null; created_at?: string | null };
type RuntimeState = { maintenance?: RuntimeFlag; beta?: RuntimeFlag; announcement?: Announcement | null; announcements?: Announcement[] };

function lines(text = '') {
  return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function RuntimeControlBanner() {
  const [state, setState] = useState<RuntimeState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/runtime?ts=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        if (alive && json?.ok) setState(json);
      } catch {}
    }
    load();
    const timer = window.setInterval(load, 45000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const maintenance = state?.maintenance;
  const beta = state?.beta;
  const announcement = state?.announcement || state?.announcements?.[0] || null;

  if (maintenance?.enabled) {
    return <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950 px-5 text-white"><section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-2xl"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#dfff4f]">DLAVIE MAINTENANCE MODE</p><h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Kami sedang meningkatkan Dlavie.</h1><p className="mt-3 text-sm font-semibold leading-6 text-white/60">Layanan sedang ditutup sementara agar update dapat dipasang dengan aman.</p><div className="mt-5 rounded-[1.3rem] bg-slate-900 p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Alasan maintenance</p><ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-white/80">{lines(maintenance.description).map((line, index) => <li key={index}>• {line.replace(/^[-•]\s*/, '')}</li>)}</ul></div></section></div>;
  }

  return <>
    {beta?.enabled && <div className="fixed left-1/2 top-3 z-[80] -translate-x-1/2 rounded-full border border-yellow-300/40 bg-slate-950/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-200 shadow-2xl backdrop-blur-xl">BETA MODE ACTIVE</div>}
    {announcement && !dismissed && <div className="fixed bottom-4 left-4 right-4 z-[79] mx-auto max-w-xl rounded-[1.5rem] border border-white/20 bg-slate-950/92 p-4 text-white shadow-2xl backdrop-blur-xl"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">Announcement Update</p><h2 className="mt-1 text-lg font-black">{announcement.title}</h2></div><button onClick={() => setDismissed(true)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 font-black">×</button></div><ul className="mt-3 space-y-1 text-sm font-semibold leading-6 text-white/72">{lines(announcement.body).map((line, index) => <li key={index}>• {line.replace(/^[-•]\s*/, '')}</li>)}</ul></div>}
  </>;
}
