import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

const heroVideo = 'https://cdn.imageurlgenerator.com/uploads/59bd535b-3543-4bc3-a000-64374bdfd9fe.mp4';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        MainButton?: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

function cleanCode(value: unknown) {
  return String(Array.isArray(value) ? value[0] : value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

function safeNext(value: unknown) {
  const raw = String(Array.isArray(value) ? value[0] : value || '/dashboard');
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/login')) return '/dashboard';
  return raw;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const rest = Math.max(0, seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

export default function TelegramLoginMiniApp() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(300);
  const [status, setStatus] = useState('Kode siap digunakan untuk login aman.');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => cleanCode(router.query.code), [router.query.code]);
  const next = useMemo(() => safeNext(router.query.next), [router.query.next]);
  const channel = String(router.query.channel || 'telegram');

  useEffect(() => {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard?.writeText(code).catch(() => null);
    setCopied(true);
    setStatus('Kode berhasil disalin. Tempel di halaman login DLAVIE.');
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function verify() {
    if (!code || code.length < 6) {
      setStatus('Kode tidak ditemukan. Minta kode baru dari bot.');
      return;
    }

    setLoading(true);
    setStatus('Memverifikasi kode pairing...');
    const response = await fetch('/api/auth/pairing/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, code, next })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok || !data.loginUrl) {
      setStatus(data.error || 'Kode salah, expired, atau sudah digunakan.');
      return;
    }

    setStatus('Kode valid. Mengalihkan ke DLAVIE...');
    window.location.href = String(data.loginUrl);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#06090f] px-4 py-5 text-white">
      <style jsx global>{`
        body{background:#06090f}.tg-mini{position:relative;isolation:isolate}.tg-mini:before{content:'';position:fixed;inset:-20%;z-index:-3;background:radial-gradient(circle at 20% 8%,rgba(223,255,79,.22),transparent 28rem),radial-gradient(circle at 80% 0%,rgba(69,213,255,.24),transparent 28rem),radial-gradient(circle at 60% 90%,rgba(231,40,255,.2),transparent 32rem),linear-gradient(135deg,#05070d,#09111f 45%,#0b0614)}.tg-mini:after{content:'';position:fixed;inset:-24%;z-index:-2;background:conic-gradient(from 160deg,rgba(223,255,79,.34),rgba(69,213,255,.24),rgba(231,40,255,.22),rgba(223,255,79,.34));filter:blur(70px);opacity:.54;animation:tgAura 13s ease-in-out infinite alternate}.code-card{background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.055));box-shadow:0 30px 90px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(24px) saturate(150%)}.glow-ring{background:linear-gradient(115deg,rgba(223,255,79,.88),rgba(69,213,255,.58),rgba(231,40,255,.45),rgba(223,255,79,.88));background-size:260% 260%;animation:tgGlow 6.5s ease-in-out infinite}.code-text{letter-spacing:.28em;text-shadow:0 0 26px rgba(223,255,79,.42)}@keyframes tgGlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}@keyframes tgAura{from{transform:rotate(0deg) scale(1)}to{transform:rotate(18deg) scale(1.08)}}
      `}</style>
      <section className="tg-mini mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col justify-center">
        <div className="glow-ring rounded-[2.1rem] p-[1px]">
          <div className="code-card overflow-hidden rounded-[2.05rem] border border-white/10">
            <div className="relative h-56 overflow-hidden rounded-b-[1.6rem] bg-slate-950">
              <video className="absolute inset-0 h-full w-full object-cover" src={heroVideo} autoPlay muted loop playsInline preload="metadata" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a10] via-[#070a10]/28 to-transparent" />
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <span className="rounded-full bg-black/42 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f] ring-1 ring-white/10 backdrop-blur-xl">DLAVIE OTP</span>
                <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/62 ring-1 ring-white/10 backdrop-blur-xl">Telegram</span>
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <h1 className="text-3xl font-black leading-none tracking-[-.045em]">Secure Login Panel</h1>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/62">Gunakan kode ini untuk masuk ke akun DLAVIE kamu.</p>
              </div>
            </div>

            <div className="p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/38">Pairing Code</p>
              <button onClick={copyCode} className="mt-3 w-full rounded-[1.6rem] bg-white/10 p-5 ring-1 ring-white/10 transition hover:bg-white/14">
                <span className="code-text block text-center text-4xl font-black text-[#dfff4f]">{code || 'NO CODE'}</span>
                <span className="mt-2 block text-center text-xs font-black uppercase tracking-[0.18em] text-white/35">{copied ? 'Copied' : 'Tap to copy'}</span>
              </button>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.2rem] bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Expires</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatTime(seconds)}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</p>
                  <p className="mt-1 text-sm font-black text-[#dfff4f]">READY</p>
                </div>
              </div>

              <p className="mt-4 rounded-[1.15rem] bg-white/8 p-4 text-sm font-semibold leading-6 text-white/55 ring-1 ring-white/10">{status}</p>

              <div className="mt-4 grid gap-3">
                <button onClick={verify} disabled={loading || !code || seconds <= 0} className="rounded-[1.25rem] bg-[#dfff4f] px-4 py-4 text-sm font-black text-slate-950 shadow-[0_20px_50px_rgba(223,255,79,.2)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <a href={`/login?next=${encodeURIComponent(next)}`} className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-center text-sm font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Open DLAVIE Login</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
