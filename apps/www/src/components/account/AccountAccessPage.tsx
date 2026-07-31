'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, CreditCard, LockKeyhole, ReceiptText, ShoppingBag } from 'lucide-react';
import { DlavieBrand, DlavieMark } from '../brand/DlavieBrand';
import { useDlavieLocale } from '../i18n/LocaleExperience';
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

const copy = {
  en: {
    kicker: 'One account for every transaction',
    visualTitle: 'Buy digital products and keep every order in one secure place.',
    visualCopy:
      'DLavie Commerce connects a Digiflazz-powered catalog with Midtrans payment processing and server-managed account sessions.',
    createKicker: 'Create commerce access',
    loginKicker: 'Secure commerce access',
    createTitle: 'Create your DLavie account',
    loginTitle: 'Sign in to DLavie Commerce',
    createCopy: 'Create an account to purchase products, track orders, and review transaction history.',
    loginCopy: 'Sign in to continue shopping and manage your DLavie Commerce orders.',
    name: 'Full name',
    namePlaceholder: 'Your name',
    nameHint: 'Use your real name for account recovery and transaction records.',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    emailHint: 'Order updates and account notices will be sent to this address.',
    password: 'Password',
    passwordHint: 'Use at least 12 characters with a strong combination.',
    submitCreate: 'Create account',
    submitLogin: 'Sign in',
    processing: 'Processing',
    existing: 'Already have an account?',
    newUser: 'Don’t have an account?',
    switchLogin: 'Sign in',
    switchRegister: 'Register now',
    note: 'DLavie Account uses Supabase Auth with server-managed session cookies.',
    requestError: 'Your DLavie Account request could not be processed.',
    confirmation: 'Your account was created. Confirm your email before signing in.',
    connectionError: 'The connection was interrupted. Check your network and try again.',
  },
  id: {
    kicker: 'Satu akun untuk setiap transaksi',
    visualTitle: 'Beli produk digital dan simpan seluruh pesanan dalam satu tempat yang aman.',
    visualCopy:
      'DLavie Commerce menghubungkan katalog Digiflazz, pembayaran Midtrans, dan session akun yang dikelola langsung oleh server.',
    createKicker: 'Buat akses commerce',
    loginKicker: 'Akses commerce aman',
    createTitle: 'Buat akun DLavie',
    loginTitle: 'Masuk ke DLavie Commerce',
    createCopy: 'Buat akun untuk membeli produk, melacak pesanan, dan melihat riwayat transaksi.',
    loginCopy: 'Masuk untuk melanjutkan belanja dan mengelola pesanan DLavie Commerce.',
    name: 'Nama lengkap',
    namePlaceholder: 'Nama Anda',
    nameHint: 'Gunakan nama asli untuk pemulihan akun dan catatan transaksi.',
    email: 'Email',
    emailPlaceholder: 'anda@contoh.com',
    emailHint: 'Pembaruan pesanan dan pemberitahuan akun akan dikirim ke alamat ini.',
    password: 'Kata sandi',
    passwordHint: 'Gunakan minimal 12 karakter dengan kombinasi yang kuat.',
    submitCreate: 'Buat akun',
    submitLogin: 'Masuk',
    processing: 'Memproses',
    existing: 'Sudah punya akun?',
    newUser: 'Belum punya akun?',
    switchLogin: 'Masuk',
    switchRegister: 'Daftar sekarang',
    note: 'DLavie Account memakai Supabase Auth dengan session cookie yang diatur server.',
    requestError: 'Permintaan akun DLavie belum dapat diproses.',
    confirmation: 'Akun berhasil dibuat. Konfirmasi email sebelum masuk kembali.',
    connectionError: 'Koneksi terputus. Periksa jaringan lalu coba kembali.',
  },
} as const;

export function AccountAccessPage({ mode }: AccountAccessPageProps) {
  const { locale } = useDlavieLocale();
  const labels = copy[locale];
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
          body: JSON.stringify({ name, email, interest: 'commerce', password }),
        });
        const result = (await response.json().catch(() => ({}))) as AccountApiResponse;

        if (!response.ok || !result.ok) {
          setStatus({ tone: 'error', message: result.message ?? labels.requestError });
          return;
        }
        if (result.requiresConfirmation) {
          setStatus({ tone: 'info', message: result.message ?? labels.confirmation });
          return;
        }
        window.location.assign(result.redirectTo ?? '/account/onboarding');
      } catch {
        setStatus({ tone: 'error', message: labels.connectionError });
      }
    });
  };

  return (
    <main className="account-shell">
      <section className="account-card" data-mode={mode} aria-labelledby="account-title">
        <aside className="account-visual account-visual--brand">
          <Link className="account-brand" href="/shop" aria-label="DLavie Commerce">
            <DlavieBrand product="Commerce" tone="light" compact />
          </Link>

          <div className="account-visual__brand-stage" aria-hidden="true">
            <DlavieMark className="account-visual__mark" />
            <span className="account-visual__halo" />
          </div>

          <div className="account-visual__copy">
            <p className="account-panel__kicker">{labels.kicker}</p>
            <h2>{labels.visualTitle}</h2>
            <p>{labels.visualCopy}</p>
          </div>

          <div className="account-signal" aria-label="DLavie Commerce services">
            <span><ShoppingBag size={16} aria-hidden="true" /><b>Digiflazz</b><em>Catalog</em></span>
            <span><CreditCard size={16} aria-hidden="true" /><b>Midtrans</b><em>Payment</em></span>
            <span><ReceiptText size={16} aria-hidden="true" /><b>Orders</b><em>Tracked</em></span>
            <span><LockKeyhole size={16} aria-hidden="true" /><b>Account</b><em>Protected</em></span>
          </div>
        </aside>

        <section className="account-panel">
          <p className="account-panel__kicker">{isRegister ? labels.createKicker : labels.loginKicker}</p>
          <h1 className="account-heading" id="account-title">
            {isRegister ? labels.createTitle : labels.loginTitle}
          </h1>
          <p className="account-panel__copy">{isRegister ? labels.createCopy : labels.loginCopy}</p>

          <form className="account-form" onSubmit={handleSubmit}>
            {isRegister ? (
              <NeonField label={labels.name} name="name" type="text" autoComplete="name" placeholder={labels.namePlaceholder} value={name} onChange={(event) => setName(event.target.value)} hint={labels.nameHint} required />
            ) : null}

            <NeonField label={labels.email} name="email" type="email" autoComplete="email" placeholder={labels.emailPlaceholder} value={email} onChange={(event) => setEmail(event.target.value)} hint={labels.emailHint} required />

            <NeonField label={labels.password} name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="••••••••••••" value={password} onChange={(event) => setPassword(event.target.value)} hint={labels.passwordHint} required />
            <PasswordStrengthMeter value={password} />

            {status ? <p className="account-status" data-tone={status.tone}>{status.message}</p> : null}

            <button className="account-submit" type="submit" disabled={isPending}>
              <span>{isPending ? labels.processing : isRegister ? labels.submitCreate : labels.submitLogin}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <p className="account-switch">
            {isRegister ? labels.existing : labels.newUser}{' '}
            <Link href={isRegister ? '/account/login' : '/account/register'}>
              {isRegister ? labels.switchLogin : labels.switchRegister}
            </Link>
          </p>
          <p className="account-note">{labels.note}</p>
        </section>
      </section>
    </main>
  );
}
