import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    setErrorMessage('');

    const supabase = createSupabaseBrowserClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const result =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${siteUrl}/auth/confirmed`,
            },
          });

    setLoading(false);

    if (result.error) {
      setErrorMessage(
        mode === 'login'
          ? 'Email atau password tidak valid.'
          : 'Gagal membuat akun. Pastikan email valid dan password minimal 8 karakter.',
      );
      return;
    }

    if (mode === 'signup') {
      setStatus('Akun berhasil dibuat. Cek email kamu untuk konfirmasi akun Dlavie.');
      return;
    }

    setStatus('Login berhasil. Mengalihkan ke Dashboard...');
    router.push('/dashboard');
  }

  async function sendRecoveryLink() {
    setLoading(true);
    setStatus('');
    setErrorMessage('');

    if (!email) {
      setLoading(false);
      setErrorMessage('Isi email dulu untuk mengirim link reset password.');
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMessage('Gagal mengirim link reset password. Coba lagi beberapa saat.');
      return;
    }

    setStatus('Link reset password sudah dikirim ke email kamu.');
  }

  return (
    <main className="min-h-screen bg-[#f6f2e9] p-6 text-slate-950">
      <section className="dlavie-glass mx-auto max-w-md overflow-hidden rounded-[2.5rem] p-6 shadow-2xl md:p-8">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-2xl font-black text-[#dfff4f] shadow-inner">
          D
        </div>
        <p className="text-center font-black uppercase tracking-[0.3em] text-slate-400">
          DLAVIE ACCESS
        </p>
        <h1 className="mt-3 text-center text-4xl font-black tracking-tight text-slate-950">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm font-semibold text-slate-500">
          {mode === 'login'
            ? 'Masuk untuk membuka Dashboard, Security Center, dan benefit akun Dlavie.'
            : 'Daftar akun baru dan konfirmasi email sebelum menggunakan fitur Dlavie.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40"
            placeholder="Email"
            type="email"
            autoComplete="email"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40"
            placeholder="Password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={8}
            required
          />

          {errorMessage && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {status && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              {status}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat akun'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Buat akun baru' : 'Sudah punya akun? Login'}
        </button>

        <button
          type="button"
          onClick={sendRecoveryLink}
          disabled={loading}
          className="mt-3 w-full rounded-full px-4 py-3 text-sm font-black text-slate-500 transition hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Kirim link reset password
        </button>

        <Link href="/" className="mt-5 block text-center text-sm font-bold text-slate-500 underline">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
