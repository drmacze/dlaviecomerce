import { FormEvent, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [status, setStatus] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus('Loading...');
    const supabase = createSupabaseBrowserClient();
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setStatus(result.error ? result.error.message : 'Berhasil.');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-md rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal">
        <h1 className="text-3xl font-black">{mode === 'login' ? 'Login' : 'Daftar'} LUMINA</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Email" type="email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Password" type="password" />
          <button className="w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Submit</button>
        </form>
        <button className="mt-4 font-black text-emerald-700" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>Ganti mode</button>
        {status && <p className="mt-4 font-semibold">{status}</p>}
      </section>
    </main>
  );
}
