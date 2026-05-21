import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type SecurityData = {
  ok: true;
  user: {
    id: string;
    email: string | null;
    emailConfirmed: boolean;
    createdAt: string | null;
    lastSignInAt: string | null;
  };
  trustedDeviceCount: number;
};

type Device = {
  id: string;
  device_name: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_seen_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function SecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function token() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function load() {
    setLoading(true);
    setError('');

    const accessToken = await token();
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };
    const [accountRes, deviceRes] = await Promise.all([
      fetch('/api/security', { headers }),
      fetch('/api/trusted-devices', { headers }),
    ]);

    const accountJson = await accountRes.json();
    const deviceJson = await deviceRes.json();

    if (!accountRes.ok || !accountJson.ok) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/login');
      return;
    }

    if (!deviceRes.ok || !deviceJson.ok) {
      setError('Gagal memuat perangkat terpercaya.');
      setLoading(false);
      return;
    }

    setSecurity(accountJson);
    setDevices(deviceJson.devices ?? []);
    setLoading(false);
  }

  async function addDevice() {
    setSaving(true);
    setMessage('');
    setError('');

    const accessToken = await token();
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const deviceName = typeof navigator !== 'undefined' ? navigator.platform || 'Perangkat ini' : 'Perangkat ini';
    const res = await fetch('/api/trusted-devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ deviceName }),
    });
    const json = await res.json();

    if (!res.ok || !json.ok) {
      setError('Gagal menambahkan perangkat.');
      setSaving(false);
      return;
    }

    setMessage('Perangkat berhasil ditambahkan.');
    setSaving(false);
    await load();
  }

  async function removeDevice(id: string) {
    setSaving(true);
    setMessage('');
    setError('');

    const accessToken = await token();
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const res = await fetch(`/api/trusted-devices?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();

    if (!res.ok || !json.ok) {
      setError('Gagal menghapus perangkat.');
      setSaving(false);
      return;
    }

    setMessage('Perangkat berhasil dihapus.');
    setSaving(false);
    await load();
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f2e9] px-5 py-8 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-black uppercase tracking-[0.3em] text-slate-400">Dlavie Account</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Security Center</h1>
            <p className="mt-3 max-w-2xl font-semibold text-slate-500">
              Pantau status akun, verifikasi email, dan perangkat terpercaya.
            </p>
          </div>
          <button onClick={logout} className="rounded-full border border-red-200 bg-white/80 px-5 py-3 font-black text-red-600 shadow-sm">
            Logout
          </button>
        </div>

        {loading ? (
          <div className="dlavie-glass rounded-[2rem] p-6 font-black text-slate-500">Memuat data keamanan...</div>
        ) : (
          <div className="grid gap-5">
            {error && <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-700">{error}</div>}
            {message && <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 px-5 py-4 font-bold text-emerald-700">{message}</div>}

            <section className="grid gap-5 md:grid-cols-3">
              <div className="dlavie-glass rounded-[2rem] p-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Email</p>
                <h2 className="mt-3 break-all text-xl font-black">{security?.user.email ?? '-'}</h2>
              </div>
              <div className="dlavie-glass rounded-[2rem] p-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Verified</p>
                <h2 className="mt-3 text-xl font-black">{security?.user.emailConfirmed ? 'Verified' : 'Belum verified'}</h2>
              </div>
              <div className="dlavie-glass rounded-[2rem] p-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Trusted Devices</p>
                <h2 className="mt-3 text-xl font-black">{security?.trustedDeviceCount ?? 0} perangkat</h2>
              </div>
            </section>

            <section className="dlavie-glass rounded-[2.5rem] p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-black uppercase tracking-[0.25em] text-slate-400">Device Trust</p>
                  <h2 className="mt-2 text-3xl font-black">Perangkat Terpercaya</h2>
                </div>
                <button onClick={addDevice} disabled={saving} className="rounded-full bg-[#dfff4f] px-6 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] disabled:opacity-60">
                  {saving ? 'Memproses...' : 'Percayai perangkat ini'}
                </button>
              </div>

              {devices.length === 0 ? (
                <div className="rounded-[2rem] border border-black/5 bg-white/60 p-5 font-bold text-slate-500">Belum ada perangkat terpercaya.</div>
              ) : (
                <div className="grid gap-4">
                  {devices.map((device) => (
                    <article key={device.id} className="rounded-[2rem] border border-black/5 bg-white/70 p-5 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-black">{device.device_name}</h3>
                          <p className="mt-2 max-w-3xl break-words text-xs font-semibold text-slate-400">{device.user_agent ?? 'Unknown user agent'}</p>
                          <div className="mt-4 grid gap-1 text-sm font-bold text-slate-500">
                            <p>IP: {device.ip_address ?? '-'}</p>
                            <p>Ditambahkan: {formatDate(device.created_at)}</p>
                            <p>Terakhir aktif: {formatDate(device.last_seen_at)}</p>
                          </div>
                        </div>
                        <button onClick={() => removeDevice(device.id)} disabled={saving} className="rounded-full border border-red-200 bg-red-50 px-5 py-3 font-black text-red-600 disabled:opacity-60">
                          Hapus
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
