import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Mode = 'login' | 'signup' | 'reset';

function getSiteUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
}

function passwordLabel(score: number) {
  if (score <= 1) return 'Weak';
  if (score <= 3) return 'Medium';
  return 'Strong';
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const score = useMemo(() => passwordScore(password), [password]);
  const confirmUrl = `${getSiteUrl()}/auth/confirmed`;

  async function recordLoginEvent(accessToken: string) {
    await fetch('/api/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ device: navigator.userAgent.slice(0, 90) })
    }).catch(() => null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus('Processing secure request...');
    const supabase = createSupabaseBrowserClient();

    if (mode === 'reset') {
      const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${getSiteUrl()}/reset-password` });
      setLoading(false);
      setStatus(result.error ? result.error.message : 'Password reset link sudah dikirim. Cek inbox email kamu.');
      return;
    }

    if (mode === 'signup' && score < 3) {
      setLoading(false);
      setStatus('Gunakan password yang lebih kuat sebelum membuat akun.');
      return;
    }

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: confirmUrl } });

    setLoading(false);
    if (result.error) return setStatus(result.error.message);

    if (mode === 'signup') {
      setStatus('Akun dibuat. Cek Gmail kamu untuk konfirmasi email sebelum login penuh.');
      return;
    }

    const accessToken = result.data.session?.access_token;
    if (accessToken) await recordLoginEvent(accessToken);
    setStatus('Login berhasil. Mengalihkan ke Security Center...');
    router.push('/security');
  }

  async function resendConfirmation() {
    if (!email) return setStatus('Masukkan email dulu.');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: confirmUrl } });
    setLoading(false);
    setStatus(result.error ? result.error.message : 'Email konfirmasi sudah dikirim ulang.');
  }

  return <main className="min-h-screen overflow-hidden p-6"><div className="pointer-events-none fixed inset-0 -z-10"><div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#dfff4f]/25 blur-3xl" /><div className="absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full bg-[#75b3e5]/25 blur-3xl" /><div className="absolute inset-0 dlavie-grid-bg opacity-40" /></div><section className="dlavie-glass dlavie-edge-flow mx-auto grid max-w-5xl overflow-hidden rounded-[2.75rem] p-5 md:grid-cols-[.95fr_1.05fr] md:p-7"><div className="rounded-[2.2rem] bg-slate-950 p-7 text-white"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#dfff4f] text-2xl font-black text-slate-950 shadow-[0_0_60px_rgba(223,255,79,.24)]">D</div><p className="mt-8 text-xs font-black uppercase tracking-[0.32em] text-[#dfff4f]">DLAVIE SECURE ACCESS</p><h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">Akses akun yang aman untuk wallet dan order.</h1><p className="mt-5 text-sm font-semibold leading-7 text-white/55">Login dan registrasi DLAVIE memakai Supabase Auth. Email confirmation, password reset, dan login event disiapkan untuk menjaga akun commerce tetap aman.</p><div className="mt-7 grid gap-3"><div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="font-black">Email confirmation</p><p className="mt-1 text-sm font-semibold text-white/48">Akun baru diarahkan untuk verifikasi email.</p></div><div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="font-black">Login event logging</p><p className="mt-1 text-sm font-semibold text-white/48">Setelah login, device session dicatat ke Security Center.</p></div><div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="font-black">Password health</p><p className="mt-1 text-sm font-semibold text-white/48">Registrasi membutuhkan password yang lebih kuat.</p></div></div></div><div className="p-2 md:p-5"><div className="flex rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5"><button onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-3 text-sm font-black ${mode === 'login' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>Login</button><button onClick={() => setMode('signup')} className={`flex-1 rounded-full px-4 py-3 text-sm font-black ${mode === 'signup' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>Register</button><button onClick={() => setMode('reset')} className={`flex-1 rounded-full px-4 py-3 text-sm font-black ${mode === 'reset' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>Reset</button></div><h2 className="mt-7 text-4xl font-black tracking-tight text-slate-950">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create secure account' : 'Recover access'}</h2><p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{mode === 'login' ? 'Masuk untuk melihat wallet, order, security, dan fitur akun.' : mode === 'signup' ? 'Gunakan email aktif agar konfirmasi bisa diterima di Gmail.' : 'Masukkan email akun untuk menerima link reset password.'}</p><form onSubmit={submit} className="mt-6 space-y-4"><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email" type="email" required />{mode !== 'reset' && <div><div className="flex rounded-full border border-black/5 bg-white/80 pr-2 focus-within:ring-4 focus-within:ring-[#dfff4f]/40"><input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full bg-transparent p-4 font-semibold outline-none" placeholder="Password" type={showPassword ? 'text' : 'password'} required /><button type="button" onClick={() => setShowPassword((v) => !v)} className="px-4 text-sm font-black text-slate-500">{showPassword ? 'Hide' : 'Show'}</button></div><div className="mt-3 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: `${(score / 5) * 100}%` }} /></div><span className="text-xs font-black uppercase tracking-widest text-slate-500">{passwordLabel(score)}</span></div></div>}<button disabled={loading} className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Processing...' : mode === 'login' ? 'Secure Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</button></form>{mode === 'signup' && <button onClick={resendConfirmation} disabled={loading} className="mt-3 w-full rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5 disabled:opacity-60">Resend confirmation email</button>}{status && <p className="mt-4 rounded-[1.4rem] bg-white/75 p-4 text-sm font-bold leading-6 text-slate-700 ring-1 ring-black/5">{status}</p>}<div className="mt-5 grid gap-2 text-xs font-bold text-slate-400"><p>Confirmation redirect: /auth/confirmed</p><p>Reset redirect: /reset-password</p><p>Data security hanya tampil setelah login dan berasal dari Supabase.</p></div></div></section></main>;
}
