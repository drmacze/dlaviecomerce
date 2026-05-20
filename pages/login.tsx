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

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-md overflow-hidden rounded-[2.5rem] p-6 md:p-8"><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-2xl font-black text-[#dfff4f] shadow-inner">D</div><p className="text-center font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ACCESS</p><h1 className="mt-3 text-center text-4xl font-black tracking-tight text-slate-950">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1><form onSubmit={submit} className="mt-6 space-y-4"><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email" type="email" /><input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Password" type="password" /><button className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1">Submit</button></form><button className="mt-4 w-full rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Buat akun baru' : 'Sudah punya akun? Login'}</button>{status && <p className="mt-4 text-center font-semibold text-slate-700">{status}</p>}</section></main>;
}
