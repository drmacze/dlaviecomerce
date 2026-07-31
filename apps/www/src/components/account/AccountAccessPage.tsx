'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, ShoppingBag, Sparkles } from 'lucide-react';
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
    ecosystem: 'One identity, the entire ecosystem',
    visualTitle: 'Access commerce, AI, and automation through one secure account.',
    visualCopy: 'Sessions are protected with server-set HTTP-only cookies and credentials are never exposed to browser JavaScript.',
    createKicker: 'Create new access',
    loginKicker: 'Secure access',
    createTitle: 'Create a DLavie account',
    loginTitle: 'Sign in to DLavie',
    createCopy: 'Create the identity you will use for shopping, product access, and connected DLavie services.',
    loginCopy: 'Sign in to continue your commerce activity and manage access to DLavie products.',
    name: 'Full name',
    namePlaceholder: 'Your name',
    nameHint: 'Use your real name for workspace identity and account recovery.',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    emailHint: 'Use your primary email address for DLavie access.',
    interest: 'Product interest',
    interestHint: 'Choose the product path you would like to explore first.',
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
    ecosystem: 'Satu identitas, seluruh ekosistem',
    visualTitle: 'Akses commerce, AI, dan automation melalui satu akun aman.',
    visualCopy: 'Session dilindungi cookie HTTP-only yang diatur server dan kredensial tidak pernah diekspos ke JavaScript browser.',
    createKicker: 'Buat akses baru',
    loginKicker: 'Akses aman',
    createTitle: 'Buat akun DLavie',
    loginTitle: 'Masuk ke DLavie',
    createCopy: 'Buat identitas yang akan digunakan untuk belanja, akses produk, dan layanan DLavie yang terhubung.',
    loginCopy: 'Masuk untuk melanjutkan aktivitas commerce dan mengelola akses ke produk DLavie.',
    name: 'Nama lengkap',
    namePlaceholder: 'Nama Anda',
    nameHint: 'Gunakan nama asli untuk identitas workspace dan pemulihan akun.',
    email: 'Email',
    emailPlaceholder: 'anda@perusahaan.com',
    emailHint: 'Gunakan alamat email utama untuk akses DLavie.',
    interest: 'Produk yang diminati',
    interestHint: 'Pilih jalur produk yang ingin dijelajahi terlebih dahulu.',
    password: 'Kata sandi',
    passwordHint: 'Gunakan minimal 12 karakter dengan kombinasi yang kuat.',
    submitCreate: 'Buat akun',
    submitLogin: 'Masuk ke akun',
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

const productOptions = {
  en: [
    { label: 'DLavie Commerce', value: 'commerce' },
    { label: 'DLavie AI', value: 'ai' },
    { label: 'Automation ecosystem', value: 'automation' },
    { label: 'The full DLavie ecosystem', value: 'all' },
  ],
  id: [
    { label: 'DLavie Commerce', value: 'commerce' },
    { label: 'DLavie AI', value: 'ai' },
    { label: 'Ekosistem automation', value: 'automation' },
    { label: 'Seluruh ekosistem DLavie', value: 'all' },
  ],
} as const;

export function AccountAccessPage({ mode }: AccountAccessPageProps) {
  const { locale } = useDlavieLocale();
  const labels = copy[locale];
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
          <Link className="account-brand" href="/" aria-label="DLavie home">
            <DlavieBrand product="Account" tone="light" compact />
          </Link>

          <div className="account-visual__brand-stage" aria-hidden="true">
            <DlavieMark className="account-visual__mark" />
            <span className="account-visual__halo" />
          </div>

          <div className="account-visual__copy">
            <p className="account-panel__kicker">{labels.ecosystem}</p>
            <h2>{labels.visualTitle}</h2>
            <p>{labels.visualCopy}</p>
          </div>

          <div className="account-signal" aria-label="DLavie services">
            <span><ShoppingBag size={16} aria-hidden="true" /><b>Commerce</b><em>Ready</em></span>
            <span><Sparkles size={16} aria-hidden="true" /><b>AI</b><em>Connected</em></span>
            <span><LockKeyhole size={16} aria-hidden="true" /><b>Security</b><em>Protected</em></span>
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

            {isRegister ? (
              <NeonField fieldType="select" label={labels.interest} name="interest" value={interest} onChange={(event) => setInterest(event.target.value)} hint={labels.interestHint} options={[...productOptions[locale]]} />
            ) : null}

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
