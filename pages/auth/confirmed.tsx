import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthConfirmedVisual } from '@/components/auth-confirmed-visual';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AuthConfirmedPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Memverifikasi sesi email...');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setStatus('Email berhasil dibuka. Jika sesi belum aktif, silakan login kembali untuk menyelesaikan akses akun.');
        return;
      }

      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ device: navigator.userAgent.slice(0, 90) })
      }).catch(() => null);

      setReady(true);
      setStatus('Email terkonfirmasi. Akun DLAVIE kamu sudah siap digunakan. Mengalihkan ke Dashboard...');
      window.setTimeout(() => router.push('/dashboard'), 1400);
    });
  }, [router]);

  return <AuthConfirmedVisual status={status} ready={ready} />;
}
