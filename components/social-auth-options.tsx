import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Notice = { type: 'success' | 'error' | 'info'; text: string };
type Channel = 'whatsapp' | 'telegram';

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

function normalizeBotUrl(channel: Channel, value: string) {
  const raw = value.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('t.me/') || raw.startsWith('telegram.me/')) return `https://${raw}`;
  if (raw.startsWith('@')) return channel === 'telegram' ? `https://t.me/${raw.slice(1)}` : raw;
  if (channel === 'telegram') return `https://t.me/${raw}`;
  return raw;
}

function getBotUrl(channel: Channel) {
  const configured = channel === 'whatsapp' ? process.env.NEXT_PUBLIC_WHATSAPP_AUTH_URL : process.env.NEXT_PUBLIC_TELEGRAM_AUTH_URL;
  const fallback = channel === 'telegram' ? 'https://t.me/cs_dlaviebot' : '';
  const target = configured || fallback;
  if (!target) return '';
  const url = new URL(normalizeBotUrl(channel, target));
  if (channel === 'telegram') url.searchParams.set('start', 'pairing_login');
  return url.toString();
}

function GoogleIcon() {
  return <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-black text-[#4285F4]">G</span>;
}

function TelegramIcon() {
  return <span className="grid h-7 w-7 place-items-center rounded-full bg-[#229ED9] text-sm font-black text-white">↗</span>;
}

function WhatsAppIcon() {
  return <span className="grid h-7 w-7 place-items-center rounded-full bg-[#25D366] text-sm font-black text-white">☎</span>;
}

export function SocialAuthOptions({ nextUrl, disabled, onNotice }: Props) {
  const [busy, setBusy] = useState(false);
  const [pairingChannel, setPairingChannel] = useState<Channel | null>(null);

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

  function startPairing(channel: Channel) {
    setPairingChannel(channel);
    onNotice({ type: 'info', text: channel === 'telegram' ? 'Buka bot Telegram DLAVIE, ambil kode login, lalu masukkan di web.' : 'Buka bot WhatsApp DLAVIE, ambil kode login, lalu masukkan di web.' });
  }

  const chip = 'auth-social-chip flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-black text-white transition disabled:cursor-not-allowed disabled:opacity-55';
  const botLink = pairingChannel ? getBotUrl(pairingChannel) : '';

  return (
    <div className="dlavie-social-shell mt-4 rounded-[1.45rem] p-[1px]">
      <style jsx>{`
        .dlavie-social-shell{position:relative;background:linear-gradient(115deg,rgba(223,255,79,.6),rgba(69,213,255,.38),rgba(231,40,255,.42),rgba(223,255,79,.6));background-size:260% 260%;animation:dlavieAuthGlow 7s ease-in-out infinite;box-shadow:0 18px 60px rgba(0,0,0,.22),0 0 42px rgba(223,255,79,.12)}
        .dlavie-social-shell:before{content:'';position:absolute;inset:-1px;border-radius:1.45rem;background:conic-gradient(from 180deg,rgba(223,255,79,.78),rgba(69,213,255,.55),rgba(231,40,255,.35),rgba(223,255,79,.78));filter:blur(16px);opacity:.32;z-index:-1;animation:dlavieSpin 8s linear infinite}
        .auth-social-chip{background:rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.14)}
        .auth-social-chip:hover{transform:translateY(-2px);background:rgba(255,255,255,.14)}
        @keyframes dlavieAuthGlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes dlavieSpin{to{transform:rotate(360deg)}}
      `}</style>
      <div className="rounded-[1.4rem] bg-[#111827]/92 p-3 backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">Quick Access</p>
          <span className="h-1.5 w-1.5 rounded-full bg-[#dfff4f] shadow-[0_0_16px_rgba(223,255,79,.8)]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" disabled={disabled || busy} onClick={googleLogin} className={`${chip} bg-white/10 hover:bg-white/15`}><GoogleIcon /><span>Google</span></button>
          <button type="button" disabled={disabled || busy} onClick={() => startPairing('telegram')} className={`${chip} bg-[#229ED9]/22 hover:bg-[#229ED9]/32`}><TelegramIcon /><span>Tele</span></button>
          <button type="button" disabled={disabled || busy} onClick={() => startPairing('whatsapp')} className={`${chip} bg-[#25D366]/18 hover:bg-[#25D366]/28`}><WhatsAppIcon /><span>WA</span></button>
        </div>
      </div>

      {pairingChannel && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 px-4 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-[2rem] border border-white/12 bg-[#0b1020] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Pairing Login</p><h3 className="mt-2 text-2xl font-black tracking-tight">Kode {pairingChannel === 'telegram' ? 'Telegram' : 'WhatsApp'}</h3></div>
              <button type="button" onClick={() => setPairingChannel(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 font-black text-white/65 ring-1 ring-white/10">×</button>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/55">Buka bot DLAVIE, minta kode login, lalu masukkan kode tersebut di sini.</p>
            {botLink && <a href={botLink} target="_blank" rel="noreferrer" className="mt-4 block rounded-[1.2rem] bg-[#dfff4f] px-4 py-3 text-center text-sm font-black text-slate-950">Buka Bot {pairingChannel === 'telegram' ? 'Telegram' : 'WhatsApp'}</a>}
            <input className="mt-4 w-full rounded-[1.35rem] border border-white/12 bg-white/10 px-4 py-4 text-center text-2xl font-black tracking-[0.34em] text-white outline-none transition focus:border-[#dfff4f]/70" placeholder="DLV123" autoComplete="one-time-code" />
            <button type="button" onClick={() => onNotice({ type: 'info', text: 'Pairing code backend akan aktif setelah bot mengirim kode ke API DLAVIE.' })} className="mt-3 w-full rounded-[1.25rem] bg-white px-4 py-3 text-sm font-black text-slate-950">Verify & Login</button>
          </div>
        </div>
      )}
    </div>
  );
}
