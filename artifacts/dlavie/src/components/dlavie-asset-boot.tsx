import { useEffect, useState } from 'react';
import { DlavieMetallicLoader } from '@/components/effects/DlavieMetallicLoader';

type Props = { routeLoading?: boolean; authChecking?: boolean };

export function DlavieAssetBoot({ routeLoading, authChecking }: Props) {
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(12);
  const active = booting || routeLoading || authChecking;

  useEffect(() => {
    let cancelled = false;
    const timer = window.setInterval(() => setProgress((value) => Math.min(value + 8, 96)), 140);
    const done = window.setTimeout(() => {
      if (!cancelled) {
        setProgress(100);
        window.setTimeout(() => setBooting(false), 280);
      }
    }, 1200);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(done);
    };
  }, []);

  useEffect(() => {
    if (routeLoading) setProgress(62);
    if (authChecking) setProgress(78);
  }, [authChecking, routeLoading]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-[#050505] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(188,255,106,.14),transparent_28rem)]" />
      <div className="relative w-full max-w-[420px] rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_32px_110px_rgba(0,0,0,.55)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/38">DLAVIE System</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-.045em] text-white">Loading assets...</p>
          </div>
          <div className="grid h-16 w-16 place-items-center">
            <DlavieMetallicLoader />
          </div>
        </div>
        <p className="mt-5 text-sm font-medium text-white/52">Preparing interface and motion system.</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full bg-gradient-to-r from-white to-[#bcff6a] transition-[width] duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/32">
          <span>Asset Pipeline</span>
          <span>{Math.round(Math.min(progress, 100))}%</span>
        </div>
      </div>
    </div>
  );
}
