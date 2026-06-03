'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { SvgIcon } from '../ui/SvgIcon';
import { NeonField } from './NeonField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { ShinyHeading } from './ShinyHeading';
import { VideoWordmark } from './VideoWordmark';

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
  { label: 'Full DLavie Ecosystem', value: 'all' },
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

        const result = await response.json().catch(() => ({})) as AccountApiResponse;

        if (!response.ok || !result.ok) {
          setStatus({ tone: 'error', message: result.message ?? 'Unable to process your DLavie Account request.' });
          return;
        }

        if (result.requiresConfirmation) {
          setStatus({ tone: 'info', message: result.message ?? 'Account created. Please confirm your email before signing in.' });
          return;
        }

        window.location.assign(result.redirectTo ?? '/account/dashboard');
      } catch {
        setStatus({ tone: 'error', message: 'Network error. Please check your connection and try again.' });
      }
    });
  };

  return (
    <main className="account-shell">
      <section className="account-card" data-mode={mode} aria-labelledby="account-title">
        <aside className="account-visual">
          <Link className="account-brand" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
            <span>DLAVIE</span>
          </Link>

          <VideoWordmark />

          <div className="account-visual__copy">
            <p>A unified identity layer for DlavieOS, DLavie AI, commerce infrastructure, and connected automation systems.</p>
          </div>

          <div className="account-signal" aria-hidden="true">
            <span><b>AI</b><em>Ready</em></span>
            <span><b>Commerce</b><em>Secure</em></span>
            <span><b>Automation</b><em>Online</em></span>
          </div>
        </aside>

        <section className="account-panel">
          <p className="account-panel__kicker">{isRegister ? 'Create access' : 'Secure access'}</p>
          <ShinyHeading id="account-title">{isRegister ? 'Register' : 'Login'}</ShinyHeading>
          <p className="account-panel__copy">
            {isRegister
              ? 'Create your DLavie Account to activate secure access across AI, Commerce, and Automation products.'
              : 'Sign in to your DLavie Account to manage product access, workspace identity, and connected DLavie services.'}
          </p>

          <form className="account-form" onSubmit={handleSubmit}>
            {isRegister ? (
              <NeonField
                label="Full name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                hint="Use your real name for workspace identity and account recovery."
                required
              />
            ) : null}

            <NeonField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              hint="Use your primary email address for secure DLavie access."
              required
            />

            {isRegister ? (
              <NeonField
                fieldType="select"
                label="Product interest"
                name="interest"
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
                hint="Select the DLavie product path you want to activate first."
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
              hint="Use a strong password with at least 12 characters."
              required
            />
            <PasswordStrengthMeter value={password} />

            {status ? <p className="account-status" data-tone={status.tone}>{status.message}</p> : null}

            <button className="account-submit" type="submit" disabled={isPending}>
              {isPending ? 'Processing' : isRegister ? 'Create account' : 'Continue to account'}
            </button>
          </form>

          <p className="account-switch">
            {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <Link href={isRegister ? '/account/login' : '/account/register'}>
              {isRegister ? 'Login to DLavie Account' : 'Create DLavie Account'}
            </Link>
          </p>
          <p className="account-note">DLavie Account is connected to Supabase Auth with server-set session cookies.</p>
        </section>
      </section>
    </main>
  );
}
