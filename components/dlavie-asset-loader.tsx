import { useEffect, useMemo, useState } from 'react';

type Props = {
  routeLoading?: boolean;
  authChecking?: boolean;
};

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function waitForVisibleAssets() {
  if (typeof document === 'undefined') return;

  const imageTasks = Array.from(document.images)
    .filter((image) => !image.complete)
    .slice(0, 28)
    .map((image) => {
      if ('decode' in image) return image.decode().catch(() => undefined);
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    });

  const fontTask = 'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();
  await Promise.race([
    Promise.allSettled([fontTask, ...imageTasks]),
    wait(1800)
  ]);
}

export function DlavieAssetLoader({ routeLoading, authChecking }: Props) {
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(8);
  const [message, setMessage] = useState('Loading assets...');

  const active = booting || routeLoading || authChecking;
  const displayProgress = useMemo(() => {
    if (authChecking) return Math.max(progress, 72);
    if (routeLoading) return Math.max(progress, 58);
    return progress;
  }, [authChecking, progress, routeLoading]);

  useEffect(() => {
    let cancelled = false;
    let interval: number | null = null;

    const boot = async () => {
      const stages = [
        { at: 18, text: 'Preparing interface...' },
        { at: 36, text: 'Loading assets...' },
        { at: 58, text: 'Optimizing motion...' },
        { at: 78, text: 'Composing experience...' },
        { at: 92, text: 'Almost ready...' }
      ];

      interval = window.setInterval(() => {
        setProgress((value) => Math.min(value + Math.random() * 7 + 2, 92));
      }, 130);

      for (const stage of stages) {
        await wait(140);
        if (cancelled) return;
        setProgress((value) => Math.max(value, stage.at));
        setMessage(stage.text);
      }

      await Promise.allSettled([waitForVisibleAssets(), wait(850)]);
      if (cancelled) return;

      if (interval !== null) window.clearInterval(interval);
      setProgress(100);
      setMessage('Assets ready.');
      await wait(360);
      if (!cancelled) setBooting(false);
    };

    boot();

    return () => {
      cancelled = true;
      if (interval !== null) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (routeLoading) {
      setMessage('Loading page...');
      setProgress(64);
      return;
    }
    if (authChecking) {
      setMessage('Checking secure session...');
      setProgress(78);
    }
  }, [authChecking, routeLoading]);

  if (!active) return null;

  return (
    <div className="dlv-asset-loader fixed inset-0 z-[140] grid place-items-center bg-[#050505] px-6 text-white">
      <style jsx>{`
        .dlv-asset-loader{isolation:isolate}.dlv-asset-loader:before{content:'';position:absolute;inset:-20%;z-index:-2;background:radial-gradient(circle at 50% 10%,rgba(188,255,106,.14),transparent 28rem),radial-gradient(circle at 75% 70%,rgba(255,255,255,.045),transparent 26rem),linear-gradient(180deg,#050505,#080908)}.dlv-asset-loader:after{content:'';position:absolute;inset:0;z-index:-1;opacity:.16;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(circle at 50% 44%,black,transparent 72%)}.loader-card{width:min(100%,420px);border:1px solid rgba(255,255,255,.09);background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.028));box-shadow:0 32px 110px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(30px) saturate(120%)}.brand-mark{position:relative}.brand-mark:before{content:'';position:absolute;inset:-12px;border-radius:999px;background:rgba(188,255,106,.18);filter:blur(18px);animation:pulse 1.9s ease-in-out infinite}.loader-line{height:6px;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.08)}.loader-line span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#f7f7f3,#bcff6a);box-shadow:0 0 28px rgba(188,255,106,.34);transition:width .26s cubic-bezier(.16,1,.3,1)}.loader-scan{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}.loader-scan:after{content:'';position:absolute;inset:0;transform:translateX(-120%);background:linear-gradient(110deg,transparent,rgba(255,255,255,.08),transparent);animation:scan 2.4s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:.48;transform:scale(.96)}50%{opacity:.9;transform:scale(1.04)}}@keyframes scan{0%,42%{transform:translateX(-120%)}100%{transform:translateX(120%)}}@media(prefers-reduced-motion:reduce){.brand-mark:before,.loader-scan:after{animation:none!important}}
      `}</style>

      <div className="loader-card relative overflow-hidden rounded-[2rem] p-6">
        <div className="loader-scan" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/38">DLAVIE System</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-.045em] text-white">Loading assets...</p>
          </div>
          <div className="brand-mark grid h-14 w-14 place-items-center rounded-full bg-white text-xl font-black text-[#050505]">D</div>
        </div>

        <p className="mt-5 min-h-6 text-sm font-medium text-white/52">{message}</p>
        <div className="loader-line mt-4"><span style={{ width: `${Math.min(displayProgress, 100)}%` }} /></div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/32">
          <span>Asset Pipeline</span>
          <span>{Math.round(Math.min(displayProgress, 100))}%</span>
        </div>
      </div>
    </div>
  );
}
