import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Mode = 'login' | 'signup' | 'reset';
type Notice = { type: 'success' | 'error' | 'info'; text: string } | null;

const loginVideo = {
  src: 'https://cdn.imageurlgenerator.com/uploads/216ff627-b7ab-4e36-a2cf-feeaba760057.mp4',
  label: 'DLAVIE Motion',
  title: 'Masuk ke dunia DLAVIE.',
  desc: 'Wallet, produk digital, reward, dan dashboard akun disatukan dalam pengalaman yang lebih hidup.'
};

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
  const [formOpen, setFormOpen] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
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
    if (!email) {
      setNotice({ type: 'error', text: 'Masukkan email dulu.' });
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: confirmUrl } });
    setLoading(false);
    setNotice(result.error ? { type: 'error', text: authMessage(result.error.message) } : { type: 'success', text: 'Email konfirmasi sudah dikirim ulang.' });
  }

  const noticeClass = notice?.type === 'error'
    ? 'bg-red-100 text-red-700 ring-red-200'
    : notice?.type === 'success'
      ? 'bg-[#dfff4f] text-slate-950 ring-black/5'
      : 'bg-white/75 text-slate-600 ring-black/5';

  return (
    <main className="dl-login-page min-h-screen overflow-hidden px-3 py-3 text-slate-950 md:px-6 md:py-6">
      <style jsx global>{`
        .dl-login-page{position:relative;isolation:isolate;background:radial-gradient(circle at 14% 8%,rgba(117,179,229,.34),transparent 28rem),radial-gradient(circle at 86% 10%,rgba(223,255,79,.38),transparent 24rem),radial-gradient(circle at 50% 100%,rgba(53,207,114,.16),transparent 32rem),linear-gradient(135deg,#f6faf4,#eaf2ef 44%,#f7fbe8)}
        .dl-login-page:before{content:'';position:fixed;inset:0;z-index:-3;opacity:.32;background-image:linear-gradient(rgba(16,19,21,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(16,19,21,.035) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(circle at 50% 30%,black,transparent 78%)}
        .dl-login-mesh{position:fixed;inset:-18%;z-index:-2;filter:blur(76px);opacity:.7;background:conic-gradient(from 120deg at 50% 50%,rgba(117,179,229,.35),rgba(223,255,79,.5),rgba(255,214,163,.35),rgba(255,255,255,.2),rgba(117,179,229,.35));animation:dlLoginMesh 16s ease-in-out infinite alternate;pointer-events:none}
        .dl-login-glass{border:1px solid rgba(16,19,21,.08);background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,255,255,.42));box-shadow:0 28px 85px rgba(65,78,74,.16),inset 0 1px 0 rgba(255,255,255,.88);-webkit-backdrop-filter:blur(24px) saturate(150%);backdrop-filter:blur(24px) saturate(150%)}
        .dl-login-ring{position:relative;overflow:hidden}.dl-login-ring:before{content:'';position:absolute;inset:-2px;border-radius:inherit;padding:2px;background:conic-gradient(from 0deg,transparent,rgba(117,179,229,.55),rgba(223,255,79,.95),rgba(180,151,207,.38),transparent 42%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:dlLoginSpin 12s linear infinite;pointer-events:none}
        .dl-login-float{animation:dlLoginFloat 8s ease-in-out infinite alternate}.dl-login-progress span{animation:dlLoginProgress 8.2s linear infinite}.dl-login-lift{transition:transform .28s ease,box-shadow .28s ease,background .28s ease}.dl-login-lift:hover{transform:translateY(-4px);box-shadow:0 24px 60px rgba(65,78,74,.17)}
        @keyframes dlLoginMesh{0%{transform:translate3d(-4%,-2%,0) rotate(0deg) scale(1)}100%{transform:translate3d(4%,3%,0) rotate(18deg) scale(1.08)}}@keyframes dlLoginSpin{to{transform:rotate(360deg)}}@keyframes dlLoginFloat{from{transform:translate3d(-10px,-8px,0) scale(.97)}to{transform:translate3d(14px,10px,0) scale(1.04)}}@keyframes dlLoginProgress{from{transform:translateX(-100%)}to{transform:translateX(0)}}
      `}</style>
      <div className="dl-login-mesh" />

      <section className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="dl-login-glass dl-login-ring relative min-h-[32rem] overflow-hidden rounded-[2.35rem] lg:min-h-[calc(100vh-3rem)]">
          <div className="dl-login-float absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#75b3e5]/30 blur-3xl" />
          <div className="dl-login-float absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#dfff4f]/22 blur-3xl" />

          <div className="grid h-full grid-rows-[1fr_auto]">
            <div className="relative min-h-[24rem] overflow-hidden">
              <video className="absolute inset-0 h-full w-full object-cover" src={loginVideo.src} autoPlay muted loop playsInline preload="metadata" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/76 via-slate-950/22 to-slate-950/5" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/44 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full bg-white/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f] ring-1 ring-white/15 backdrop-blur-xl md:left-6 md:top-6">{loginVideo.label}</div>
              <div className="absolute bottom-4 left-4 right-4 max-w-2xl md:bottom-6 md:left-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">DLAVIE Login Stage</p>
                <h1 className="mt-2 text-4xl font-black leading-[.95] tracking-[-.045em] text-white md:text-6xl">{loginVideo.title}</h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/68 md:text-base">{loginVideo.desc}</p>
              </div>
            </div>
            <div className="border-t border-white/10 bg-slate-950/88 p-4 text-white md:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Secure entry</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Akses akun dibuat terasa seperti produk premium.</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/54">Motion branding dipakai sebagai pembuka, sementara form tetap fokus dan cepat digunakan.</p>
              <div className="dl-login-progress mt-4 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-full rounded-full bg-[#dfff4f]" /></div>
            </div>
          </div>
        </article>

        <aside className="dl-login-glass dl-login-ring relative overflow-hidden rounded-[2.35rem] p-4 md:p-6">
          <div className="dl-login-float absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#dfff4f]/18 blur-3xl" />
          <div className="dl-login-float absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-[#75b3e5]/16 blur-3xl" />
          <div className="relative z-10 flex min-h-full flex-col">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-slate-950 text-xl font-black text-[#dfff4f] shadow-[0_14px_34px_rgba(15,23,42,.18)]">D</div>
                <div><p className="text-lg font-black tracking-tight text-slate-950">DLAVIE</p><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Secure access</p></div>
              </Link>
              <Link href="/" className="rounded-full bg-white/72 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:text-slate-950">Back</Link>
            </div>

            <div className="mt-6 rounded-[1.65rem] bg-slate-950 p-4 text-white shadow-[0_24px_64px_rgba(15,23,42,.18)]">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Account Login</p><p className="mt-2 text-2xl font-black tracking-tight">Masuk ke akun kamu.</p><p className="mt-1 text-xs font-bold text-white/45">Akses wallet, transaksi, reward, dan dashboard.</p></div>
                <button type="button" onClick={() => setFormOpen((value) => !value)} className="grid h-12 w-12 place-items-center rounded-full bg-[#dfff4f] text-slate-950 shadow-[0_0_28px_rgba(223,255,79,.32)] transition hover:-translate-y-1" aria-label="Toggle form">
                  <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform ${formOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
              </div>
              <div className="dl-login-progress mt-4 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-full rounded-full bg-[#dfff4f]" /></div>
            </div>

            <div className={`grid transition-all duration-500 ${formOpen ? 'mt-5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="flex rounded-full bg-white/72 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
                  {(['login', 'signup', 'reset'] as Mode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setNotice(null); }} className={`flex-1 rounded-full px-3 py-2.5 text-xs font-black capitalize transition md:text-sm ${mode === item ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>{item === 'signup' ? 'Register' : item}</button>)}
                </div>

                <form onSubmit={submit} className="mt-4 rounded-[1.65rem] bg-white/72 p-4 ring-1 ring-black/5 backdrop-blur-xl">
                  <div><p className="text-2xl font-black tracking-tight text-slate-950">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Recover access'}</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{mode === 'login' ? 'Masuk untuk membuka semua fitur akun.' : mode === 'signup' ? 'Email aktif diperlukan untuk konfirmasi.' : 'Kirim link reset ke email akun.'}</p></div>
                  <label className="mt-4 block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-[1.15rem] border border-black/5 bg-white/85 px-4 py-3 text-base font-bold text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950" placeholder="nama@email.com" type="email" autoComplete="email" required /></label>
                  {mode !== 'reset' && <label className="mt-4 block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Password</span><div className="mt-2 flex rounded-[1.15rem] border border-black/5 bg-white/85 pr-2 focus-within:border-slate-950"><input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-[1.15rem] bg-transparent px-4 py-3 text-base font-bold text-slate-950 outline-none placeholder:text-slate-400" placeholder="Masukkan password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-xs font-black text-slate-500">{showPassword ? 'Hide' : 'Show'}</button></div><div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: `${(score / 5) * 100}%` }} /></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{passwordLabel(score)}</span></div></label>}
                  {notice && <div className={`mt-4 rounded-[1.15rem] px-4 py-3 text-sm font-bold ring-1 ${noticeClass}`}>{notice.text}</div>}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={loading} className="dl-login-lift rounded-[1.25rem] bg-[#dfff4f] px-5 py-4 text-sm font-black text-slate-950 shadow-[0_18px_42px_rgba(176,205,55,.24)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Processing...' : mode === 'login' ? 'Secure Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</button><button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="dl-login-lift rounded-[1.25rem] bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(15,23,42,.18)]">{mode === 'signup' ? 'Login' : 'Register'}</button></div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setMode('reset')} className="text-sm font-black text-slate-500 transition hover:text-slate-950">Lupa password?</button>{mode === 'signup' && <button type="button" onClick={resendConfirmation} disabled={loading} className="rounded-full bg-white/86 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 ring-1 ring-black/5 disabled:opacity-60">Resend email</button>}</div>
                </form>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
