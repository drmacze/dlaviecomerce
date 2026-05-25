import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccountShortcut } from '@/components/account-shortcut';
import { AmbientBg } from '@/components/ambient-bg';
import { DlavieAlertCenter } from '@/components/dlavie-alert-center';
import { DlavieCookieConsent } from '@/components/dlavie-cookie-consent';
import { DlavieErrorBoundary } from '@/components/dlavie-error-boundary';
import { DlavieProviders } from '@/components/dlavie-providers';
import '../styles/globals.css';
import '../styles/ambient.css';
import '../styles/cosmic.css';
import '../styles/dlavie-system.css';
import '../styles/dlavie-motion.css';
import '../styles/auth-motion.css';

const THEME_KEY = 'dlavie_theme_mode_v1';
type ThemeMode = 'light' | 'dark';

function applyDlavieTheme(theme: ThemeMode) {
  document.documentElement.dataset.dlavieTheme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  window.localStorage.setItem(THEME_KEY, theme);
}

function DlavieThemeSwitch() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    const initial = saved === 'dark' || saved === 'light' ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyDlavieTheme(initial);
    setTheme(initial);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    const layer = document.createElement('span');
    layer.className = 'dlavie-theme-reveal-layer';
    document.body.appendChild(layer);
    window.setTimeout(() => {
      applyDlavieTheme(next);
      setTheme(next);
    }, 180);
    window.setTimeout(() => layer.remove(), 920);
  }

  return (
    <button type="button" onClick={toggle} className="dlavie-theme-toggle fixed bottom-[5.35rem] left-3 z-[85] flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black shadow-[0_22px_70px_rgba(0,0,0,.24)] transition hover:-translate-y-1 md:bottom-5 md:left-5" aria-label="Ganti tema DLAVIE">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dfff4f] text-slate-950 shadow-[0_0_24px_rgba(223,255,79,.28)]">{theme === 'dark' ? '☀' : '☾'}</span>
      <span className="hidden sm:block">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      <span className="relative h-6 w-10 rounded-full bg-black/15 p-1 ring-1 ring-black/5"><span className={`block h-4 w-4 rounded-full bg-white transition-transform duration-500 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} /></span>
    </button>
  );
}

function DlavieLoader({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#eef4ee]/85 backdrop-blur-xl"><div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-[0_28px_85px_rgba(65,78,74,.18)] ring-1 ring-black/5"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-2xl font-black text-[#dfff4f] shadow-inner">D</div><p className="mt-4 text-sm font-black uppercase tracking-[0.35em] text-slate-500">DLAVIE</p><p className="mt-1 text-sm font-semibold text-slate-500">Loading smooth experience...</p></div></div>;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const done = () => setLoading(false);
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router.events]);

  return <DlavieProviders><AmbientBg /><DlavieAlertCenter /><DlavieCookieConsent /><DlavieThemeSwitch /><DlavieLoader active={loading} /><AccountShortcut /><DlavieErrorBoundary><div className="relative z-10 transition-opacity duration-300"><Component {...pageProps} /></div></DlavieErrorBoundary></DlavieProviders>;
}
