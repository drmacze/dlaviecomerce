'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DlavieAiMark } from '../../../../src/components/ai/DlavieAiMark';

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/ai';
  return value;
}

function readHashParams() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash);
}

export default function AccountOAuthCallbackPage() {
  const [message, setMessage] = useState('Mengamankan sesi DLavie Account…');

  useEffect(() => {
    async function completeOAuth() {
      const url = new URL(window.location.href);
      const params = readHashParams();
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresIn = params.get('expires_in');
      const next = safeNext(url.searchParams.get('next'));

      if (!accessToken || !refreshToken) {
        window.location.replace(`/account/login?auth_error=github`);
        return;
      }

      const response = await fetch('/api/account/oauth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn }),
      });

      if (!response.ok) {
        window.location.replace(`/account/login?auth_error=github`);
        return;
      }

      window.history.replaceState({}, '', window.location.pathname);
      window.location.replace(next);
    }

    completeOAuth().catch(() => {
      setMessage('GitHub login gagal. Silakan coba lagi.');
      window.location.replace('/account/login?auth_error=github');
    });
  }, []);

  return (
    <main className="account-ai-shell">
      <section className="account-ai-card is-callback" aria-live="polite">
        <Link className="account-ai-brand" href="/ai" aria-label="Back to DLavie AI">
          <span><DlavieAiMark /></span>
          <strong>DLavie AI</strong>
        </Link>
        <div className="account-ai-heading">
          <p>GitHub OAuth</p>
          <h1>Masuk</h1>
          <small>{message}</small>
        </div>
      </section>
    </main>
  );
}
