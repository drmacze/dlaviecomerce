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
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  return (
    <main className="min-h-screen overflow-hidden px-4 py-4 text-slate-950 md:p-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#dfff4f]/25 blur-3xl" />
        <div className="absolute -right-24 top-32 h-96 w-96 rounded-full bg-[#75b3e5]/20 blur-3xl" />
        <div className="absolute inset-0 dlavie-grid-bg opacity-35" />
      </div>

      <section className="mx-auto max-w-3xl pt-1 md:pt-6">
        <LoginAccessPanel open={drawerOpen} onToggle={() => setDrawerOpen((open) => !open)} />

        <div className={`overflow-hidden transition-all duration-700 ease-out ${drawerOpen ? 'max-h-[760px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <section className={`dlavie-glass dlavie-edge-flow mx-auto mt-8 rounded-[1.7rem] p-4 shadow-[0_22px_65px_rgba(65,78,74,.14)] transition-all duration-700 md:rounded-[2rem] md:p-6 ${drawerOpen ? 'translate-y-0 scale-100' : '-translate-y-6 scale-[.98]'}`}>
            <div className="flex rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5">
              {(['login', 'signup', 'reset'] as Mode[]).map((item) => (
                <button key={item} type="button" onClick={() => setMode(item)} className={`flex-1 rounded-full px-3 py-2.5 text-xs font-black capitalize transition md:text-sm ${mode === item ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>{item === 'signup' ? 'Register' : item}</button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                  {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Recover access'}
                </h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                  {mode === 'login' ? 'Masuk untuk membuka fitur akun.' : mode === 'signup' ? 'Email aktif diperlukan untuk konfirmasi.' : 'Kirim link reset ke email akun.'}
                </p>
              </div>
              <a href="/security" className="rounded-full bg-white/75 px-4 py-2 text-xs font-black text-slate-500 ring-1 ring-black/5">Security</a>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-3.5 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40 md:p-4" placeholder="Email" type="email" autoComplete="email" required />
              {mode !== 'reset' && (
                <div>
                  <div className="flex rounded-full border border-black/5 bg-white/80 pr-2 focus-within:ring-4 focus-within:ring-[#dfff4f]/40">
                    <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full bg-transparent p-3.5 font-semibold outline-none md:p-4" placeholder="Password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="px-3 text-xs font-black text-slate-500 md:px-4 md:text-sm">{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: `${(score / 5) * 100}%` }} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{passwordLabel(score)}</span>
                  </div>
                </div>
              )}
              <button disabled={loading} className="w-full rounded-full bg-[#dfff4f] px-5 py-3.5 font-black text-slate-950 shadow-[0_14px_30px_rgba(120,150,45,.2)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 md:py-4">
                {loading ? 'Processing...' : mode === 'login' ? 'Secure Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {mode === 'signup' && <button onClick={resendConfirmation} disabled={loading} className="rounded-full bg-white/75 px-4 py-3 text-xs font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white disabled:opacity-60">Resend email</button>}
              <button onClick={() => setDrawerOpen(false)} className="rounded-full bg-slate-950 px-4 py-3 text-xs font-black text-white shadow-sm">Minimize</button>
            </div>
            {status && <p className="mt-3 rounded-[1.2rem] bg-white/75 p-3 text-xs font-bold leading-5 text-slate-700 ring-1 ring-black/5 md:text-sm">{status}</p>}
          </section>
        </div>
      </section>
    </main>
  );
}
