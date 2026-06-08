'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, Github, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';
import { DlavieAiMark } from '../ai/DlavieAiMark';
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
  { label: 'DLavie AI', value: 'ai' },
  { label: 'DLavie Store', value: 'commerce' },
  { label: 'Full DLavie Ecosystem', value: 'all' },
];

export function AccountAccessPage({ mode }: AccountAccessPageProps) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('ai');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ tone: 'info' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    if (authError) {
      setStatus({ tone: 'error', message: 'GitHub login could not be completed. Please try again.' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
          setStatus({ tone: 'error', message: result.message ?? 'Unable to process your DLavie Account request.' });
          return;
        }

        if (result.requiresConfirmation) {
          setStatus({ tone: 'info', message: result.message ?? 'Account created. Please confirm your email before signing in.' });
          return;
        }

        window.location.assign(result.redirectTo ?? '/ai');
      } catch {
        setStatus({ tone: 'error', message: 'Network error. Please check your connection and try again.' });
      }
    });
  };

  return (
    <main className="account-ai-shell">
      <section className="account-ai-card" aria-labelledby="account-title">
        <Link className="account-ai-brand" href="/ai" aria-label="Back to DLavie AI">
          <span><DlavieAiMark /></span>
          <strong>DLavie AI</strong>
        </Link>

        <div className="account-ai-heading">
          <p>{isRegister ? 'Create account' : 'Secure sign in'}</p>
          <h1 id="account-title">{isRegister ? 'Daftar' : 'Login'}</h1>
          <small>Satu akun untuk DLavie AI dan DLavie Store.</small>
        </div>

        <a className="account-oauth-button" href="/api/account/oauth/github">
          <Github size={19} aria-hidden="true" />
          Continue with GitHub
        </a>

        <div className="account-divider"><span>atau</span></div>

        <form className="account-ai-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="account-ai-field">
              <span>Nama</span>
              <div>
                <User size={18} aria-hidden="true" />
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={80}
                  required
                />
              </div>
            </label>
          ) : null}

          <label className="account-ai-field">
            <span>Email</span>
            <div>
              <Mail size={18} aria-hidden="true" />
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </div>
          </label>

          {isRegister ? (
            <label className="account-ai-field">
              <span>Produk</span>
              <div>
                <ShieldCheck size={18} aria-hidden="true" />
                <select name="interest" value={interest} onChange={(event) => setInterest(event.target.value)}>
                  {PRODUCT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </label>
          ) : null}

          <label className="account-ai-field">
            <span>Password</span>
            <div>
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                name="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isRegister ? 12 : 1}
                maxLength={1024}
                required
              />
            </div>
          </label>

          {isRegister ? <PasswordStrengthMeter value={password} /> : null}

          {status ? <p className="account-status" data-tone={status.tone}>{status.message}</p> : null}

          <button className="account-ai-submit" type="submit" disabled={isPending}>
            {isPending ? 'Memproses…' : isRegister ? 'Buat DLavie Account' : 'Masuk'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <p className="account-ai-switch">
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <Link href={isRegister ? '/account/login' : '/account/register'}>
            {isRegister ? 'Login' : 'Daftar'}
          </Link>
        </p>
      </section>
    </main>
  );
}
