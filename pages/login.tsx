import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DlavieLogo } from '@/components/dlavie-logo';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Mode = 'login' | 'signup' | 'reset';
type Notice = { type: 'success' | 'error' | 'info'; text: string } | null;

const banner = 'https://cdn.imageurlgenerator.com/uploads/216ff627-b7ab-4e36-a2cf-feeaba760057.mp4';

const getSiteUrl = () => (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

function scorePassword(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 5);
}

function scoreLabel(score: number) {
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
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);
  const score = useMemo(() => scorePassword(password), [password]);
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
    setNotice({ type: 'info', text: 'Memproses akses akun...' });

    const supabase = createSupabaseBrowserClient();

    if (mode === 'reset') {
      const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${getSiteUrl()}/reset-password` });
      setLoading(false);
      setNotice(result.error ? { type: 'error', text: authMessage(result.error.message) } : { type: 'success', text: 'Password reset link sudah dikirim. Cek inbox email kamu.' });
      return;
    }

    if (mode === 'signup' && score < 3) {
      setLoading(false);
      setNotice({ type: 'error', text: 'Gunakan password yang lebih kuat sebelum membuat akun.' });
      return;
    }

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: confirmUrl } });

    setLoading(false);
    if (result.error) {
      setNotice({ type: 'error', text: authMessage(result.error.message) });
      return;
    }

    if (mode === 'signup') {
      setNotice({ type: 'success', text: 'Akun dibuat. Cek email kamu untuk konfirmasi sebelum login penuh.' });
      return;
    }

    const accessToken = result.data.session?.access_token;
    if (accessToken) await recordLoginEvent(accessToken);
    setNotice({ type: 'success', text: 'Login berhasil. Mengalihkan ke Dashboard...' });
    router.push('/dashboard');
  }

  async function resendConfirmation() {
    if (!email) return setNotice({ type: 'error', text: 'Masukkan email dulu.' });
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: confirmUrl } });
    setLoading(false);
    setNotice(result.error ? { type: 'error', text: authMessage(result.error.message) } : { type: 'success', text: 'Email konfirmasi sudah dikirim ulang.' });
  }

  const noticeClass = notice?.type === 'error'
    ? 'border-red-400/30 bg-red-500/15 text-red-100'
    : notice?.type === 'success'
      ? 'border-[#dfff4f]/40 bg-[#dfff4f] text-slate-950'
      : 'border-white/10 bg-white/10 text-white/70';

  return (
    <main className="auth-page min-h-screen overflow-hidden px-3 py-4 text-white md:px-6 md:py-8">
      <style jsx global>{`
        .auth-page{position:relative;isolation:isolate;background:#06101f}.auth-page:before{content:'';position:fixed;inset:0;z-index:-4;background:radial-gradient(circle at 13% 8%,rgba(69,213,255,.28),transparent 28rem),radial-gradient(circle at 88% 8%,rgba(82,39,255,.32),transparent 28rem),radial-gradient(circle at 78% 90%,rgba(223,255,79,.18),transparent 26rem),linear-gradient(135deg,#050817,#071326 45%,#12071f)}.auth-page:after{content:'';position:fixed;inset:-18%;z-index:-3;filter:blur(76px);opacity:.72;background:conic-gradient(from 130deg at 50% 50%,rgba(69,213,255,.45),rgba(82,39,255,.48),rgba(231,40,255,.25),rgba(223,255,79,.36),rgba(69,213,255,.45));animation:authAurora 16s ease-in-out infinite alternate}.auth-grid{position:fixed;inset:0;z-index:-2;opacity:.22;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(circle at 50% 28%,black,transparent 78%)}.auth-shell{border:1px solid rgba(255,255,255,.13);background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.055));box-shadow:0 34px 100px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(26px) saturate(155%)}.auth-panel{border:1px solid rgba(255,255,255,.1);background:linear-gradient(145deg,rgba(4,8,22,.86),rgba(12,18,38,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}.auth-input{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.09);color:white}.auth-input::placeholder{color:rgba(255,255,255,.3)}.auth-input:focus{border-color:rgba(223,255,79,.82);outline:none}.auth-progress span{animation:authProgress 7.8s linear infinite;box-shadow:0 0 24px rgba(223,255,79,.56)}.auth-lift{transition:transform .28s ease,box-shadow .28s ease}.auth-lift:hover{transform:translateY(-4px);box-shadow:0 24px 60px rgba(0,0,0,.28)}@keyframes authAurora{from{transform:translate3d(-4%,-2%,0) rotate(0) scale(1)}to{transform:translate3d(5%,4%,0) rotate(18deg) scale(1.08)}}@keyframes authProgress{from{transform:translateX(-100%)}to{transform:translateX(0)}}
      `}</style>
      <div className="auth-grid" />

      <section className="auth-shell mx-auto max-w-4xl overflow-hidden rounded-[2.35rem] p-3 md:p-4">
        <div className="relative min-h-[21rem] overflow-hidden rounded-[2rem] bg-slate-950 md:min-h-[25rem]">
          <video className="absolute inset-0 h-full w-full object-cover" src={banner} autoPlay muted loop playsInline preload="metadata" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050817]/84 via-[#050817]/34 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050817] via-[#050817]/60 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 md:left-6 md:right-6 md:top-6">
            <Link href="/" className="flex items-center rounded-full bg-white/90 px-4 py-2 shadow-[0_18px_50px_rgba(0,0,0,.18)] ring-1 ring-white/60 backdrop-blur-xl">
              <DlavieLogo className="h-8 w-auto" />
            </Link>
            <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/65 ring-1 ring-white/10 backdrop-blur-xl">Back</Link>
          </div>
          <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-7 md:right-7">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">DLAVIE Motion Login</p>
            <h1 className="mt-2 max-w-2xl text-4xl font-black leading-[.95] tracking-[-.045em] md:text-6xl">Masuk ke dunia DLAVIE.</h1>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/68 md:text-base">Satu akses untuk wallet, produk digital, reward, dan dashboard akun.</p>
            <div className="auth-progress mt-5 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/12"><span className="block h-full w-full rounded-full bg-[#dfff4f]" /></div>
          </div>
        </div>

        <div className="auth-panel mt-3 rounded-[2rem] p-4 md:p-6">
          <div className="grid gap-5 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Secure Access</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Masuk ke akun kamu.</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-white/50">Form login dibuat di dalam box yang sama dengan banner agar terasa seperti satu pengalaman DLAVIE Motion, bukan halaman terpisah.</p>
            </div>

            <div>
              <div className="flex rounded-full bg-white/10 p-1 ring-1 ring-white/10">
                {(['login', 'signup', 'reset'] as Mode[]).map((item) => (
                  <button key={item} type="button" onClick={() => { setMode(item); setNotice(null); }} className={`flex-1 rounded-full px-3 py-2.5 text-xs font-black capitalize transition md:text-sm ${mode === item ? 'bg-[#dfff4f] text-slate-950' : 'text-white/48 hover:text-white'}`}>{item === 'signup' ? 'Register' : item}</button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-4">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Email</span>
                  <input value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input mt-2 w-full rounded-[1.15rem] px-4 py-3 text-base font-bold" placeholder="nama@email.com" type="email" autoComplete="email" required />
                </label>

                {mode !== 'reset' && <label className="mt-4 block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Password</span>
                  <div className="auth-input mt-2 flex rounded-[1.15rem] pr-2 focus-within:border-[#dfff4f]/80">
                    <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-[1.15rem] bg-transparent px-4 py-3 text-base font-bold text-white outline-none placeholder:text-white/30" placeholder="Masukkan password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-xs font-black text-white/45 hover:text-white">{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                  <div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: `${(score / 5) * 100}%` }} /></div><span className="text-[10px] font-black uppercase tracking-widest text-white/45">{scoreLabel(score)}</span></div>
                </label>}

                {notice && <div className={`mt-4 rounded-[1.15rem] border px-4 py-3 text-sm font-bold ${noticeClass}`}>{notice.text}</div>}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button disabled={loading} className="auth-lift rounded-[1.25rem] bg-[#dfff4f] px-5 py-4 text-sm font-black text-slate-950 shadow-[0_18px_42px_rgba(223,255,79,.22)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Processing...' : mode === 'login' ? 'Secure Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</button>
                  <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="auth-lift rounded-[1.25rem] bg-white/10 px-5 py-4 text-sm font-black text-white ring-1 ring-white/10">{mode === 'signup' ? 'Login' : 'Register'}</button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={() => setMode('reset')} className="text-sm font-black text-white/45 transition hover:text-white">Lupa password?</button>
                  {mode === 'signup' && <button type="button" onClick={resendConfirmation} disabled={loading} className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/48 ring-1 ring-white/10 disabled:opacity-60">Resend email</button>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
