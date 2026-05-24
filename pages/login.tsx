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
  desc: 'Akses wallet, produk digital, reward, dan dashboard akun dalam satu ruang yang lebih hidup.'
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
    await fetch('/api/security', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ device: navigator.userAgent.slice(0, 90) }) }).catch(() => null);
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
    const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: confirmUrl } });
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

  const noticeClass = notice?.type === 'error' ? 'bg-red-500/15 text-red-100 ring-red-400/25' : notice?.type === 'success' ? 'bg-[#dfff4f] text-slate-950 ring-[#dfff4f]/40' : 'bg-white/10 text-white/70 ring-white/10';

  return (
    <main className="dl-login-page min-h-screen overflow-hidden px-3 py-3 text-white md:px-6 md:py-6">
      <style jsx global>{`
        .dl-login-page{position:relative;isolation:isolate;background:radial-gradient(circle at 14% 8%,rgba(0,207,255,.25),transparent 28rem),radial-gradient(circle at 86% 10%,rgba(93,56,255,.34),transparent 28rem),radial-gradient(circle at 86% 88%,rgba(223,255,79,.2),transparent 24rem),linear-gradient(135deg,#050817,#071326 46%,#12071f)}
        .dl-login-page:before{content:'';position:fixed;inset:0;z-index:-3;opacity:.22;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(circle at 50% 30%,black,transparent 78%)}
        .dl-login-mesh{position:fixed;inset:-20%;z-index:-2;filter:blur(78px);opacity:.82;background:conic-gradient(from 130deg at 50% 50%,rgba(0,207,255,.48),rgba(93,56,255,.52),rgba(231,40,255,.34),rgba(223,255,79,.42),rgba(0,207,255,.48));animation:dlLoginMesh 15s ease-in-out infinite alternate;pointer-events:none}
        .dl-login-glass{border:1px solid rgba(255,255,255,.13);background:linear-gradient(145deg,rgba(9,14,35,.84),rgba(8,12,28,.58));box-shadow:0 34px 100px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.12);-webkit-backdrop-filter:blur(26px) saturate(160%);backdrop-filter:blur(26px) saturate(160%)}
        .dl-login-ring{position:relative;overflow:hidden}.dl-login-ring:before{content:'';position:absolute;inset:-2px;border-radius:inherit;padding:2px;background:conic-gradient(from 0deg,transparent,rgba(0,207,255,.75),rgba(93,56,255,.72),rgba(223,255,79,.98),rgba(231,40,255,.5),transparent 48%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:dlLoginSpin 11s linear infinite;pointer-events:none}
        .auth-accent-card{position:relative;overflow:hidden}.auth-accent-card:before{content:'';position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,#45d5ff,#7b5cff,#dfff4f,#45d5ff);background-size:220% 100%;animation:authAccentFlow 4.8s ease-in-out infinite}.auth-accent-card:after{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#45d5ff,#7b5cff,#dfff4f);opacity:.82;box-shadow:0 0 22px rgba(69,213,255,.35)}
        .dl-login-float{animation:dlLoginFloat 8s ease-in-out infinite alternate}.dl-login-progress span{animation:dlLoginProgress 8.2s linear infinite;box-shadow:0 0 24px rgba(223,255,79,.55)}.dl-login-lift{transition:transform .28s ease,box-shadow .28s ease,background .28s ease}.dl-login-lift:hover{transform:translateY(-4px);box-shadow:0 24px 60px rgba(0,0,0,.28)}
        @keyframes authAccentFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@keyframes dlLoginMesh{0%{transform:translate3d(-4%,-2%,0) rotate(0deg) scale(1)}100%{transform:translate3d(5%,4%,0) rotate(18deg) scale(1.08)}}@keyframes dlLoginSpin{to{transform:rotate(360deg)}}@keyframes dlLoginFloat{from{transform:translate3d(-10px,-8px,0) scale(.97)}to{transform:translate3d(14px,10px,0) scale(1.04)}}@keyframes dlLoginProgress{from{transform:translateX(-100%)}to{transform:translateX(0)}}
      `}</style>
      <div className="dl-login-mesh" />
      <section className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="dl-login-glass dl-login-ring relative min-h-[32rem] overflow-hidden rounded-[2.35rem] lg:min-h-[calc(100vh-3rem)]">
          <div className="dl-login-float absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/24 blur-3xl" />
          <div className="dl-login-float absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#dfff4f]/18 blur-3xl" />
          <div className="grid h-full grid-rows-[1fr_auto]">
            <div className="relative min-h-[24rem] overflow-hidden"><video className="absolute inset-0 h-full w-full object-cover" src={loginVideo.src} autoPlay muted loop playsInline preload="metadata" /><div className="absolute inset-0 bg-gradient-to-r from-[#050817]/86 via-[#050817]/34 to-[#050817]/8" /><div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050817] via-[#050817]/60 to-transparent" /><div className="absolute left-4 top-4 rounded-full bg-white/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f] ring-1 ring-white/15 backdrop-blur-xl md:left-6 md:top-6">{loginVideo.label}</div><div className="absolute bottom-4 left-4 right-4 max-w-2xl md:bottom-6 md:left-6"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">DLAVIE Login Stage</p><h1 className="mt-2 text-4xl font-black leading-[.95] tracking-[-.045em] text-white md:text-6xl">{loginVideo.title}</h1><p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/72 md:text-base">{loginVideo.desc}</p></div></div>
            <div className="border-t border-white/10 bg-[#030712]/88 p-4 text-white md:p-6"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Secure entry</p><h2 className="mt-2 text-2xl font-black tracking-tight">Akses akun dibuat terasa seperti produk premium.</h2><p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/54">Motion branding dipakai sebagai pembuka, sementara form tetap fokus dan cepat digunakan.</p><div className="dl-login-progress mt-4 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-full rounded-full bg-[#dfff4f]" /></div></div>
          </div>
        </article>
        <aside className="dl-login-glass dl-login-ring relative overflow-hidden rounded-[2.35rem] p-4 md:p-6">
          <div className="dl-login-float absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#dfff4f]/18 blur-3xl" /><div className="dl-login-float absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-cyan-400/18 blur-3xl" />
          <div className="relative z-10 flex min-h-full flex-col">
            <div className="flex items-center justify-between gap-3"><Link href="/" className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[#dfff4f] text-xl font-black text-slate-950 shadow-[0_0_32px_rgba(223,255,79,.35)]">D</div><div><p className="text-lg font-black tracking-tight text-white">DLAVIE</p><p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Secure access</p></div></Link><Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/60 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:text-white">Back</Link></div>
            <div className="auth-accent-card mt-6 rounded-[1.65rem] bg-[#030712]/86 p-4 text-white shadow-[0_24px_64px_rgba(0,0,0,.24)] ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Account Login</p><p className="mt-2 text-2xl font-black tracking-tight">Masuk ke akun kamu.</p><p className="mt-1 text-xs font-bold text-white/48">Akses wallet, transaksi, reward, dan dashboard.</p></div><button type="button" onClick={() => setFormOpen((value) => !value)} className="grid h-12 w-12 place-items-center rounded-full bg-[#dfff4f] text-slate-950 shadow-[0_0_28px_rgba(223,255,79,.38)] transition hover:-translate-y-1" aria-label="Toggle form"><svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform ${formOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg></button></div><div className="dl-login-progress mt-4 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-full rounded-full bg-[#dfff4f]" /></div></div>
            <div className={`grid transition-all duration-500 ${formOpen ? 'mt-5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><div className="flex rounded-full bg-white/10 p-1 shadow-sm ring-1 ring-white/10 backdrop-blur-xl">{(['login','signup','reset'] as Mode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setNotice(null); }} className={`flex-1 rounded-full px-3 py-2.5 text-xs font-black capitalize transition md:text-sm ${mode === item ? 'bg-[#dfff4f] text-slate-950 shadow-sm' : 'text-white/48 hover:text-white'}`}>{item === 'signup' ? 'Register' : item}</button>)}</div>
              <form onSubmit={submit} className="mt-4 rounded-[1.65rem] border border-white/10 bg-white/[.075] p-4 backdrop-blur-xl"><div><p className="text-2xl font-black tracking-tight text-white">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Recover access'}</p><p className="mt-1 text-sm font-semibold leading-6 text-white/48">{mode === 'login' ? 'Masuk untuk membuka semua fitur akun.' : mode === 'signup' ? 'Email aktif diperlukan untuk konfirmasi.' : 'Kirim link reset ke email akun.'}</p></div><label className="mt-4 block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-[1.15rem] border border-white/10 bg-white/10 px-4 py-3 text-base font-bold text-white outline-none placeholder:text-white/28 focus:border-[#dfff4f]/80" placeholder="nama@email.com" type="email" autoComplete="email" required /></label>{mode !== 'reset' && <label className="mt-4 block"><span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Password</span><div className="mt-2 flex rounded-[1.15rem] border border-white/10 bg-white/10 pr-2 focus-within:border-[#dfff4f]/80"><input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-[1.15rem] bg-transparent px-4 py-3 text-base font-bold text-white outline-none placeholder:text-white/28" placeholder="Masukkan password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-xs font-black text-white/45 hover:text-white">{showPassword ? 'Hide' : 'Show'}</button></div><div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: `${(score / 5) * 100}%` }} /></div><span className="text-[10px] font-black uppercase tracking-widest text-white/45">{passwordLabel(score)}</span></div></label>}{notice && <div className={`mt-4 rounded-[1.15rem] px-4 py-3 text-sm font-bold ring-1 ${noticeClass}`}>{notice.text}</div>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={loading} className="dl-login-lift rounded-[1.25rem] bg-[#dfff4f] px-5 py-4 text-sm font-black text-slate-950 shadow-[0_18px_42px_rgba(223,255,79,.22)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Processing...' : mode === 'login' ? 'Secure Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</button><button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="dl-login-lift rounded-[1.25rem] bg-white/10 px-5 py-4 text-sm font-black text-white ring-1 ring-white/10">{mode === 'signup' ? 'Login' : 'Register'}</button></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setMode('reset')} className="text-sm font-black text-white/45 transition hover:text-white">Lupa password?</button>{mode === 'signup' && <button type="button" onClick={resendConfirmation} disabled={loading} className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/48 ring-1 ring-white/10 disabled:opacity-60">Resend email</button>}</div></form>
            </div></div>
          </div>
        </aside>
      </section>
    </main>
  );
}
