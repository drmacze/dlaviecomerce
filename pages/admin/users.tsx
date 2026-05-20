import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [status, setStatus] = useState('Loading users...');
  const [token, setToken] = useState('');

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat users.');
    setUsers(json.users || []);
    setStatus('');
  }

  async function toggle(user: Profile) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: user.id, isVip: !user.is_vip })
    });
    const json = await res.json();
    setStatus(res.ok ? 'VIP updated.' : json.error || 'Update gagal.');
    await load();
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (!nextToken) return setStatus('Login sebagai admin dulu.');
      load(nextToken);
    });
  }, []);

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-5xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Admin Users</h1></div><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/admin">Produk</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{users.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/70 p-4 shadow-sm ring-1 ring-black/5"><div><p className="font-black">{user.email || user.id}</p><p className="font-semibold text-slate-600">{user.l_points} D-Points · VIP {user.is_vip ? 'ON' : 'OFF'}</p></div><button onClick={() => toggle(user)} className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm">Toggle VIP</button></div>)}</div></section></main>;
}
