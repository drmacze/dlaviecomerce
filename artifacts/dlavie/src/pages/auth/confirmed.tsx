import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { AuthConfirmedVisual } from '@/components/auth-confirmed-visual';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AuthConfirmedPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Memverifikasi sesi email...');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const supabase = createSupabaseBrowserClient();

    async function finishAuth() {
      try {
        const code = typeof router.query.code === 'string' ? router.query.code : null;

        if (code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          if (result.error) throw result.error;
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setStatus('Email berhasil dibuka. Jika sesi belum aktif, silakan login ulang memakai email yang sudah dikonfirmasi.');
          return;
        }

        await fetch('/api/security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
          body: JSON.stringify({ device: navigator.userAgent.slice(0, 90) })
        }).catch(() => null);

        setReady(true);
        setStatus('Email terkonfirmasi. Akun DLAVIE kamu sudah siap digunakan. Mengalihkan ke Dashboard...');
        window.setTimeout(() => router.push('/dashboard'), 1200);
      } catch (error) {
        setStatus(error instanceof Error ? `Verifikasi gagal: ${error.message}` : 'Verifikasi gagal. Kirim ulang email konfirmasi dari halaman login.');
      }
    }

    finishAuth();
  }, [router]);

  return <AuthConfirmedVisual status={status} ready={ready} />;
}
