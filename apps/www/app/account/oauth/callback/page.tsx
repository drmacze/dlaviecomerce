'use client';

import { useEffect } from 'react';

export default function OAuthCallbackPage() {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token') || query.get('access_token');
    const refreshToken = hash.get('refresh_token') || query.get('refresh_token');
    const expiresIn = Number(hash.get('expires_in') || query.get('expires_in') || 3600);
    const next = query.get('next');
    const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/ai';
    if (!accessToken || !refreshToken) {
      window.location.replace('/account/login?auth_error=social');
      return;
    }
    fetch('/api/account/oauth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ accessToken, refreshToken, expiresIn }),
    }).then((response) => {
      window.location.replace(response.ok ? safeNext : '/account/login?auth_error=social');
    }).catch(() => window.location.replace('/account/login?auth_error=social'));
  }, []);
  return <main><p>Completing secure sign-in…</p></main>;
}
