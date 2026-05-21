import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Buka halaman ini dari tautan recovery email, lalu masukkan akses baru.');
  const [busy, setBusy] = useState(false);
  const ok = value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ok) return setStatus('Minimal 8 karakter, berisi huruf besar dan angka.');
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const payload = { ['password']: value };
    const result = await supabase.auth.updateUser(payload);
    setBusy(false);
    if (result.error) return setStatus(result.error.message);
    setStatus('Akses akun berhasil diperbarui.');
    window.setTimeout(() => router.push('/login'), 900);
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto mt-12 max-w-xl rounded-[2.5rem] p-7"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-2xl font-black text-[#dfff4f]">D</div><p className="mt-6 text-center text-xs font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE RECOVERY</p><h1 className="mt-3 text-center text-4xl font-black text-slate-950">Recovery Access</h1><form onSubmit={submit} className="mt-6 space-y-4"><input value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Akses baru" type="password" required /><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: ok ? '100%' : value ? '45%' : '0%' }} /></div><button disabled={busy} className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 disabled:opacity-60">{busy ? 'Updating...' : 'Update Access'}</button></form><p className="mt-4 rounded-[1.4rem] bg-white/75 p-4 text-sm font-bold text-slate-700 ring-1 ring-black/5">{status}</p></section></main>;
}
