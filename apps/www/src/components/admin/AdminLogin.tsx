'use client';

import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { AdminClientError, getSession, signIn } from '../../admin/client';

function safeNext(value: string | null): string {
  return value && value.startsWith('/admin') && !value.startsWith('/admin/login')
    ? value
    : '/admin';
}

export function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'unavailable'
      ? 'Layanan autentikasi admin belum tersedia. Periksa konfigurasi server.'
      : null,
  );

  useEffect(() => {
    let active = true;
    void getSession()
      .then(() => {
        if (active) router.replace(safeNext(searchParams.get('next')));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [router, searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace(safeNext(searchParams.get('next')));
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Sesi admin belum dapat dibuat.',
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-card__brand">
          <span className="admin-brand__mark">D</span>
          <div>
            <strong>DLavie Commerce</strong>
            <span>Operator Console</span>
          </div>
        </div>
        <div className="admin-login-card__heading">
          <LockKeyhole size={28} aria-hidden="true" />
          <div>
            <p className="admin-eyebrow">Akses terbatas</p>
            <h1>Masuk sebagai admin</h1>
          </div>
        </div>
        <p className="admin-login-card__intro">
          Gunakan akun Supabase yang memiliki <code>profiles.role = 'admin'</code>. Kredensial
          operator tidak disimpan di browser.
        </p>

        {error ? (
          <p className="admin-alert admin-alert--error" role="alert">
            {error}
          </p>
        ) : null}

        <form onSubmit={submit} className="admin-form">
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="username" maxLength={254} required />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              maxLength={512}
              required
            />
          </label>
          <button className="admin-button admin-button--primary" type="submit" disabled={submitting}>
            {submitting ? 'Memverifikasi…' : 'Masuk ke dashboard'}
          </button>
        </form>

        <div className="admin-login-card__security">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>
            Sesi disimpan dalam cookie terenkripsi, HttpOnly, SameSite Strict, dan Secure di
            production.
          </p>
        </div>
      </section>
    </main>
  );
}
