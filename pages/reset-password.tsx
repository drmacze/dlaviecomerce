import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      if (!router.isReady) return;
      const supabase = createSupabaseBrowserClient();
      const code = router.query.code;

      if (typeof code === 'string') {
        const result = await supabase.auth.exchangeCodeForSession(code);
        setCanUpdate(!result.error);
        setError(result.error ? 'Link reset tidak valid atau sudah kedaluwarsa.' : '');
        setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setCanUpdate(Boolean(data.session));
      setReady(true);
    }

    init();
  }, [router.isReady, router.query.code]);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const supabase = createSupabaseBrowserClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    setLoading(false);

    if (result.error) {
      setError('Gagal mengirim link reset. Coba lagi.');
      return;
    }

    setMessage('Link reset sudah dikirim ke email kamu.');
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password.length < 8) {
      setLoading(false);
      setError('Password minimal 8 karakter.');
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (result.error) {
      setError('Gagal mengganti password. Minta link baru lalu coba lagi.');
      return;
    }

    await supabase.auth.signOut();
    setMessage('Password berhasil diganti. Silakan login kembali.');
  }

  return (
    <main className="min-h-screen bg-[#f6f2e9] p-6 text-slate-950">
      <section className="dlavie-glass mx-auto max-w-md rounded-[2.5rem] p-6 md:p-8">
        <p className="text-center font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE RECOVERY</p>
        <h1 className="mt-3 text-center text-4xl font-black tracking-tight">Reset Password</h1>
        <p className="mt-3 text-center font-semibold text-slate-500">Pulihkan akses akun Dlavie kamu.</p>

        {!ready ? (
          <p className="mt-6 text-center font-bold text-slate-500">Memeriksa link...</p>
        ) : canUpdate ? (
          <form onSubmit={updatePassword} className="mt-6 space-y-4">
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Password baru" type="password" minLength={8} required />
            <button disabled={loading} className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 disabled:opacity-60">{loading ? 'Menyimpan...' : 'Simpan password baru'}</button>
          </form>
        ) : (
          <form onSubmit={requestReset} className="mt-6 space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email akun" type="email" required />
            <button disabled={loading} className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 disabled:opacity-60">{loading ? 'Mengirim...' : 'Kirim link reset'}</button>
          </form>
        )}

        {error && <p className="mt-4 rounded-3xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
        {message && <p className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</p>}

        <Link href="/login" className="mt-5 block text-center text-sm font-bold text-slate-500 underline">Kembali ke login</Link>
      </section>
    </main>
  );
}
