'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { SvgIcon } from '../ui/SvgIcon';
import { NeonField } from './NeonField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
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
  const [showAdvancedForm, setShowAdvancedForm] = useState(isRegister);
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

        const redirectTo = result.redirectTo ?? '/account/dashboard';
        if (redirectTo.startsWith('/account/dashboard')) {
          window.sessionStorage.setItem('dlavie-account-transition', 'dashboard');
        }
        window.location.assign(redirectTo);
      } catch {
        setStatus({ tone: 'error', message: 'Network error. Please check your connection and try again.' });
      }
    });
  };

  return (
    <main className="account-shell account-shell--cinematic">
      <section className="account-cinematic" data-mode={mode} aria-labelledby="account-title">
        <header className="account-cinematic__topbar">
          <Link className="account-brand account-brand--icon" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
          </Link>
          <Link className="account-cinematic__dashboard" href="/account/dashboard">Dashboard</Link>
        </header>

        <div className="account-cinematic__hero">
          <VideoWordmark compact />
          <p className="account-cinematic__tagline">Access DLavie AI, DLavieOS Agent, Commerce, and automation with one connected identity.</p>
        </div>

        <div className="account-oauth-stack" aria-label="DLavie Account sign in options">
          <button type="button" className="account-oauth-button" disabled>
            <span aria-hidden="true">X</span>
            <strong>Continue with X</strong>
          </button>
          <button type="button" className="account-oauth-button" disabled>
            <span aria-hidden="true">G</span>
            <strong>Continue with Google</strong>
          </button>
          <button type="button" className="account-oauth-button account-oauth-button--primary" disabled>
            <span aria-hidden="true"></span>
            <strong>Sign in with Apple</strong>
          </button>
        </div>

        <button className="account-more-button" type="button" onClick={() => setShowAdvancedForm((value) => !value)}>
          {showAdvancedForm ? 'Hide email access' : 'Email access'}
        </button>

        <section className="account-panel account-panel--cinematic" aria-labelledby="account-title" data-open={showAdvancedForm ? 'true' : 'false'}>
          <p className="account-panel__kicker">{isRegister ? 'Create DLavie Card' : 'Secure DLavie Access'}</p>
          <h1 id="account-title" className="account-cinematic__form-title">{isRegister ? 'Create account' : 'Login'}</h1>
          <p className="account-panel__copy">
            {isRegister
              ? 'Create one DLavie Account for AI, Agent, Commerce, and future DLavie products.'
              : 'Use your DLavie Account credentials to continue into your verified workspace.'}
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
            {isRegister ? <PasswordStrengthMeter value={password} /> : null}

            {status ? <p className="account-status" data-tone={status.tone}>{status.message}</p> : null}

            <button className="account-submit" type="submit" disabled={isPending}>
              {isPending ? 'Processing' : isRegister ? 'Create DLavie Account' : 'Continue'}
            </button>
          </form>
        </section>

        <footer className="account-cinematic__footer">
          <p>
            {isRegister ? 'Already have a DLavie Account? ' : 'New to DLavie? '}
            <Link href={isRegister ? '/account/login' : '/account/register'}>{isRegister ? 'Login' : 'Create Account'}</Link>
          </p>
          <p>By continuing, you agree to DLavie Account rules and privacy policy.</p>
        </footer>
      </section>
    </main>
  );
}
