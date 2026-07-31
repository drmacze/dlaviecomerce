'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, ShoppingBag, Sparkles } from 'lucide-react';
import { DlavieBrand, DlavieMark } from '../brand/DlavieBrand';
import { NeonField } from './NeonField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

type AccountMode = 'login' | 'register';

type AccountAccessPageProps = {
  mode: AccountMode;
};

type AccountApiResponse = {
  ok: boolean;
  message?: string;
  redirectTo?: string;
  requiresConfirmation?: boolean;
};

const PRODUCT_OPTIONS = [
  { label: 'DLavie Commerce', value: 'commerce' },
  { label: 'DLavie AI', value: 'ai' },
  { label: 'Automation Ecosystem', value: 'automation' },
  { label: 'Seluruh ekosistem DLavie', value: 'all' },
];

export function AccountAccessPage({ mode }: AccountAccessPageProps) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('commerce');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ tone: 'info' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    startTransition(async () => {
      try {
        const response = await fetch(isRegister ? '/api/account/register' : '/api/account/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, interest, password }),
        });

        const result = (await response.json().catch(() => ({}))) as AccountApiResponse;

        if (!response.ok || !result.ok) {
          setStatus({
            tone: 'error',
            message: result.message ?? 'Permintaan akun DLavie belum dapat diproses.',
          });
          return;
        }

        if (result.requiresConfirmation) {
          setStatus({
            tone: 'info',
            message:
              result.message ?? 'Akun berhasil dibuat. Konfirmasi email sebelum masuk kembali.',
          });
          return;
        }

        window.location.assign(result.redirectTo ?? '/account/dashboard');
      } catch {
        setStatus({
          tone: 'error',
          message: 'Koneksi bermasalah. Periksa jaringan lalu coba kembali.',
        });
      }
    });
  };

  return (
    <main className="account-shell">
      <section className="account-card" data-mode={mode} aria-labelledby="account-title">
        <aside className="account-visual account-visual--brand">
          <Link className="account-brand" href="/" aria-label="Kembali ke beranda DLavie">
            <DlavieBrand product="Account" tone="light" compact />
          </Link>

          <div className="account-visual__brand-stage" aria-hidden="true">
            <DlavieMark className="account-visual__mark" />
            <span className="account-visual__halo" />
          </div>

          <div className="account-visual__copy">
            <p className="account-panel__kicker">Satu identitas, seluruh ekosistem</p>
            <h2>Akses commerce, AI, dan automation melalui satu akun aman.</h2>
            <p>
              Session disimpan melalui cookie HTTP-only dan kredensial tidak pernah dikirim ke
              JavaScript browser.
            </p>
          </div>

          <div className="account-signal" aria-label="Layanan yang tersedia">
            <span>
              <ShoppingBag size={16} aria-hidden="true" />
              <b>Commerce</b>
              <em>Ready</em>
            </span>
            <span>
              <Sparkles size={16} aria-hidden="true" />
              <b>AI</b>
              <em>Connected</em>
            </span>
            <span>
              <LockKeyhole size={16} aria-hidden="true" />
              <b>Security</b>
              <em>Protected</em>
            </span>
          </div>
        </aside>

        <section className="account-panel">
          <p className="account-panel__kicker">{isRegister ? 'Buat akses baru' : 'Akses aman'}</p>
          <h1 className="account-heading" id="account-title">
            {isRegister ? 'Buat akun DLavie' : 'Masuk ke DLavie'}
          </h1>
          <p className="account-panel__copy">
            {isRegister
              ? 'Daftarkan identitas yang akan digunakan untuk belanja, mengelola layanan, dan mengakses produk DLavie.'
              : 'Masuk untuk melihat dashboard, melanjutkan aktivitas commerce, dan mengelola akses produk.'}
          </p>

          <form className="account-form" onSubmit={handleSubmit}>
            {isRegister ? (
              <NeonField
                label="Nama lengkap"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nama Anda"
                value={name}
                onChange={(event) => setName(event.target.value)}
                hint="Gunakan nama asli untuk identitas workspace dan pemulihan akun."
                required
              />
            ) : null}

            <NeonField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="anda@perusahaan.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              hint="Gunakan alamat email utama untuk akses DLavie."
              required
            />

            {isRegister ? (
              <NeonField
                fieldType="select"
                label="Produk yang diminati"
                name="interest"
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
                hint="Pilih jalur produk yang ingin diaktifkan terlebih dahulu."
                options={PRODUCT_OPTIONS}
              />
            ) : null}

            <NeonField
              label="Password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint="Gunakan minimal 12 karakter dengan kombinasi yang kuat."
              required
            />
            <PasswordStrengthMeter value={password} />

            {status ? (
              <p className="account-status" data-tone={status.tone}>
                {status.message}
              </p>
            ) : null}

            <button className="account-submit" type="submit" disabled={isPending}>
              <span>
                {isPending ? 'Memproses' : isRegister ? 'Buat akun' : 'Masuk ke akun'}
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <p className="account-switch">
            {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <Link href={isRegister ? '/account/login' : '/account/register'}>
              {isRegister ? 'Masuk' : 'Daftar sekarang'}
            </Link>
          </p>
          <p className="account-note">
            DLavie Account memakai Supabase Auth dan session cookie yang diatur server.
          </p>
        </section>
      </section>
    </main>
  );
}
