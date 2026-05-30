import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/lib/router';

const heroVideo = 'https://cdn.imageurlgenerator.com/uploads/59bd535b-3543-4bc3-a000-64374bdfd9fe.mp4';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
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
  const [status, setStatus] = useState('Secure pairing ready.');
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
    setStatus('Code copied successfully.');
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function verify() {
    if (!code || code.length < 6) {
      setStatus('Pairing code not found.');
      return;
    }

    setLoading(true);
    setStatus('Verifying secure session...');

    const response = await fetch('/api/auth/pairing/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, code, next })
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok || !data.loginUrl) {
      setStatus(data.error || 'Verification failed.');
      return;
    }

    setStatus('Authenticated. Redirecting...');
    window.location.href = String(data.loginUrl);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] px-5 py-6 text-white">
      <style dangerouslySetInnerHTML={{__html: `
        html,body{background:#050505}body{font-feature-settings:'ss01' on,'cv01' on}.dlv-panel{position:relative;isolation:isolate}.dlv-panel:before{content:'';position:fixed;inset:0;background:radial-gradient(circle at top,rgba(188,255,106,.08),transparent 28%),linear-gradient(180deg,#050505 0%,#090909 100%);z-index:-2}.dlv-panel:after{content:'';position:fixed;inset:-30%;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.03),transparent 32%);filter:blur(90px);z-index:-1}.glass{background:rgba(255,255,255,.045);backdrop-filter:blur(28px) saturate(120%);border:1px solid rgba(255,255,255,.08);box-shadow:0 30px 80px rgba(0,0,0,.5)}.hero-mask{background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.72) 75%,#050505)}.soft-ring{box-shadow:0 0 0 1px rgba(255,255,255,.05),0 20px 60px rgba(0,0,0,.45)}.code{letter-spacing:.34em}.primary-btn{background:#f5f5f5;color:#050505}.primary-btn:hover{background:white;transform:translateY(-1px)}.secondary-btn:hover{background:rgba(255,255,255,.09)}
      `}} />

      <section className="dlv-panel mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center justify-center">
        <div className="glass soft-ring w-full overflow-hidden rounded-[2rem]">
          <div className="relative h-64 overflow-hidden border-b border-white/10">
            <video className="absolute inset-0 h-full w-full object-cover" src={heroVideo} autoPlay muted loop playsInline preload="metadata" />
            <div className="hero-mask absolute inset-0" />

            <div className="absolute left-5 top-5 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#bcff6a]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">DLAVIE SECURE ACCESS</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="max-w-[14rem] text-[2.4rem] font-semibold leading-[.92] tracking-[-.06em]">Telegram Login Panel</h1>
              <p className="mt-3 max-w-[18rem] text-sm leading-6 text-white/46">Secure authentication channel for DLAVIE ecosystem.</p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/34">
                <span>Pairing Code</span>
                <span>{copied ? 'Copied' : 'Tap to copy'}</span>
              </div>

              <button onClick={copyCode} className="mt-3 w-full rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-6 transition hover:bg-white/[0.05]">
                <span className="code block text-center font-mono text-[2.3rem] font-semibold text-white">{code || '------'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/32">Session</p>
                <p className="mt-2 text-sm font-medium text-white/78">Telegram Secure</p>
              </div>

              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/32">Expires</p>
                <p className="mt-2 text-sm font-medium text-white">{formatTime(seconds)}</p>
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/48">
              {status}
            </div>

            <div className="grid gap-3 pt-1">
              <button onClick={verify} disabled={loading || !code || seconds <= 0} className="primary-btn rounded-[1.2rem] px-5 py-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <a href={`/login?next=${encodeURIComponent(next)}`} className="secondary-btn rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm font-medium text-white/82 transition">
                Open Login Page
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
