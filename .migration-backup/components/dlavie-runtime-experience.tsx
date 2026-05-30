import { useEffect, useMemo, useState } from 'react';

type RuntimeValue = { enabled?: boolean; version?: string; title?: string; message?: string; videoUrl?: string };
type RuntimeStatus = { maintenance?: RuntimeValue; demo?: RuntimeValue; announcement?: RuntimeValue };

const defaultVideo = 'https://image-link.edgeone.app/1779988010622-t0qa9o.mp4';

function storageKey(version?: string) {
  return `dlavie-announcement:${version || 'welcome-v1'}`;
}

export function DlavieRuntimeExperience() {
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [open, setOpen] = useState(false);
  const announcement = runtime?.announcement;
  const maintenance = runtime?.maintenance;
  const demo = runtime?.demo;

  useEffect(() => {
    let alive = true;
    fetch('/api/runtime/status').then((res) => res.json()).then((json) => {
      if (!alive) return;
      setRuntime(json || {});
      const item = json?.announcement as RuntimeValue | undefined;
      if (item?.enabled && !window.localStorage.getItem(storageKey(item.version))) setOpen(true);
    }).catch(() => null);
    return () => { alive = false; };
  }, []);

  const videoUrl = useMemo(() => announcement?.videoUrl || defaultVideo, [announcement?.videoUrl]);

  function closeAnnouncement() {
    if (announcement?.enabled) window.localStorage.setItem(storageKey(announcement.version), 'seen');
    setOpen(false);
  }

  return (
    <>
      {demo?.enabled && !maintenance?.enabled && (
        <div className="fixed left-3 right-3 top-3 z-[95] rounded-[1.35rem] border border-white/10 bg-[#050505]/88 p-3 text-white shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl md:left-1/2 md:right-auto md:w-[34rem] md:-translate-x-1/2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#bcff6a]">Demo Mode</p>
              <p className="mt-1 text-xs font-medium leading-5 text-white/58">{demo.message || 'Kamu bisa melihat halaman, tetapi order dan topup dinonaktifkan.'}</p>
            </div>
            <a href="/dashboard" className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-950">Dashboard</a>
          </div>
        </div>
      )}

      {maintenance?.enabled && (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-[#050505]/92 px-5 text-white backdrop-blur-2xl">
          <div className="w-full max-w-[28rem] rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_34px_120px_rgba(0,0,0,.58)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#bcff6a]">Maintenance</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.055em]">{maintenance.title || 'DLAVIE sedang maintenance'}</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-white/56">{maintenance.message || 'Kami sedang meningkatkan sistem. Silakan coba lagi sebentar lagi.'}</p>
          </div>
        </div>
      )}

      {open && announcement?.enabled && !maintenance?.enabled && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/62 px-4 text-white backdrop-blur-xl">
          <div className="w-full max-w-[32rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#1d1d1d] shadow-[0_34px_120px_rgba(0,0,0,.62)]">
            <div className="m-3 overflow-hidden rounded-[1.5rem] bg-black">
              <video className="aspect-video w-full object-cover" src={videoUrl} autoPlay muted loop playsInline preload="metadata" />
            </div>
            <div className="px-5 pb-5 pt-1">
              <div className="mb-4 flex justify-center gap-2"><span className="h-2 w-9 rounded-full bg-[#86a7ff]" /><span className="h-2 w-2 rounded-full bg-white/10" /><span className="h-2 w-2 rounded-full bg-white/10" /></div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">DLAVIE Update</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.045em]">{announcement.title || 'Kenali DLAVIE'}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-white/55">{announcement.message || 'Lihat wallet, produk, orders, dan notifikasi sebelum mulai transaksi.'}</p>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={closeAnnouncement} className="rounded-full px-4 py-3 text-sm font-semibold text-white/72">Skip</button>
                <button onClick={closeAnnouncement} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
