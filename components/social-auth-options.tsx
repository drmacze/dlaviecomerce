import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Notice = { type: 'success' | 'error' | 'info'; text: string };

type Props = {
  nextUrl: string;
  disabled?: boolean;
  onNotice: (notice: Notice) => void;
};

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const runtimeUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
  return (configuredUrl || runtimeUrl || 'http://localhost:3000').replace(/\/$/, '');
}

function callbackUrl(nextUrl: string) {
  return `${getSiteUrl()}/auth/confirmed?next=${encodeURIComponent(nextUrl || '/dashboard')}`;
}

function openBotBridge(channel: 'whatsapp' | 'telegram', nextUrl: string, onNotice: Props['onNotice']) {
  const envUrl = channel === 'whatsapp' ? process.env.NEXT_PUBLIC_WHATSAPP_AUTH_URL : process.env.NEXT_PUBLIC_TELEGRAM_AUTH_URL;
  if (!envUrl) {
    onNotice({
      type: 'info',
      text: channel === 'whatsapp'
        ? 'Login WhatsApp siap untuk Bot WA DLAVIE. Isi NEXT_PUBLIC_WHATSAPP_AUTH_URL saat bot selesai.'
        : 'Login Telegram siap untuk Bot Telegram DLAVIE. Isi NEXT_PUBLIC_TELEGRAM_AUTH_URL saat bot selesai.'
    });
    return;
  }

  const url = new URL(envUrl);
  url.searchParams.set('next', nextUrl || '/dashboard');
  url.searchParams.set('callback', callbackUrl(nextUrl));
  window.location.href = url.toString();
}

export function SocialAuthOptions({ nextUrl, disabled, onNotice }: Props) {
  const [busy, setBusy] = useState(false);

  async function googleLogin() {
    setBusy(true);
    onNotice({ type: 'info', text: 'Mengalihkan ke Google Login...' });
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl(nextUrl),
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (result.error) {
      setBusy(false);
      onNotice({ type: 'error', text: result.error.message });
    }
  }

  const className = 'rounded-[1.15rem] bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55';

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
        <span className="h-px flex-1 bg-white/10" />
        Social Login
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" disabled={disabled || busy} onClick={googleLogin} className={className}>Google</button>
        <button type="button" disabled={disabled} onClick={() => openBotBridge('whatsapp', nextUrl, onNotice)} className={className}>WhatsApp</button>
        <button type="button" disabled={disabled} onClick={() => openBotBridge('telegram', nextUrl, onNotice)} className={className}>Telegram</button>
      </div>
    </div>
  );
}
