import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { LoginAccessPanel } from '@/components/login-access-panel';
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

function authMessage(message?: string) {
  const lower = String(message || '').toLowerCase();
  if (lower.includes('invalid login')) return 'Email atau password tidak cocok.';
  if (lower.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek inbox atau kirim ulang konfirmasi.';
  if (lower.includes('rate')) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  return message || 'Request gagal diproses.';
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
      setStatus(result.error ? authMessage(result.error.message) : 'Password reset link sudah dikirim. Cek inbox email kamu.');
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
    if (result.error) return setStatus(authMessage(result.error.message));

    if (mode === 'signup') {
      setStatus('Akun dibuat. Cek Gmail kamu untuk konfirmasi email sebelum login penuh.');
      return;
    }

    const accessToken = result.data.session?.access_token;
    if (accessToken) await recordLoginEvent(accessToken);
    setStatus('Login berhasil. Mengalihkan ke Dashboard...');
    router.push('/dashboard');
  }

  async function resendConfirmation() {
    if (!email) return setStatus('Masukkan email dulu.');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: confirmUrl } });
    setLoading(false);
    setStatus(result.error ? authMessage(result.error.message) : 'Email konfirmasi sudah dikirim ulang.');
  }

  return <main className="min-h-screen overflow-hidden px-4 py-5 text-slate-950 md:p-6"><div className="pointer-events-none fixed inset-0 -z-10"><div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#dfff4f]/25 blur-3xl" /><div className="absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full bg-[#75b3e5]/25 blur-3xl" /><div className="absolute inset-0 dlavie-grid-bg opacity-40" /></div><section className="dlavie-glass dlavie-edge-flow mx-auto grid max-w-5xl items-start gap-4 overflow-hidden rounded-[2.2rem] p-4 md:grid-cols-[.92fr_1.08fr] md:rounded-[2.75rem] md:p-6"><LoginAccessPanel /><section className="p-1 md:p-5"><div className="flex rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5">{(['login','signup','reset'] as Mode[]).map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`flex-1 rounded-full px-4 py-3 text-sm font-black capitalize transition ${mode === item ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>{item === 'signup' ? 'Register' : item}</button>)}</div><h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create secure account' : 'Recover access'}</h2><p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{mode === 'login' ? 'Masuk untuk membuka dashboard, wallet, order, security, dan fitur akun.' : mode === 'signup' ? 'Gunakan email aktif agar konfirmasi bisa diterima.' : 'Masukkan email akun untuk menerima link reset password.'}</p><form onSubmit={submit} className="mt-6 space-y-4"><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email" type="email" autoComplete="email" required />{mode !== 'reset' && <div><div className="flex rounded-full border border-black/5 bg-white/80 pr-2 focus-within:ring-4 focus-within:ring-[#dfff4f]/40"><input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full bg-transparent p-4 font-semibold outline-none" placeholder="Password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /><button type="button" onClick={() => setShowPassword((v) => !v)} className="px-4 text-sm font-black text-slate-500">{showPassword ? 'Hide' : 'Show'}</button></div><div className="mt-3 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: `${(score / 5) * 100}%` }} /></div><span className="text-xs font-black uppercase tracking-widest text-slate-500">{passwordLabel(score)}</span></div></div>}<button disabled={loading} className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Processing...' : mode === 'login' ? 'Secure Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</button></form>{mode === 'signup' && <button onClick={resendConfirmation} disabled={loading} className="mt-3 w-full rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white disabled:opacity-60">Resend confirmation email</button>}{status && <p className="mt-4 rounded-[1.4rem] bg-white/75 p-4 text-sm font-bold leading-6 text-slate-700 ring-1 ring-black/5">{status}</p>}<div className="mt-5 grid gap-2 text-xs font-bold text-slate-400"><p>Login success: /dashboard</p><p>Confirmation redirect: /auth/confirmed</p><p>Reset redirect: /reset-password</p></div></section></section></main>;
}
