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

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-5xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Admin Users</h1><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/admin">Produk</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{users.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-900 p-4"><div><p className="font-black">{user.email || user.id}</p><p className="font-semibold text-slate-600">{user.l_points} L-Points · VIP {user.is_vip ? 'ON' : 'OFF'}</p></div><button onClick={() => toggle(user)} className="rounded-xl border-2 border-slate-900 bg-amber-300 px-4 py-2 font-black shadow-brutal-sm">Toggle VIP</button></div>)}</div></section></main>;
}
