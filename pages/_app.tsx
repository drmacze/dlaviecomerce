import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccountShortcut } from '@/components/account-shortcut';
import { AmbientBg } from '@/components/ambient-bg';
import { AuthRouteGuard } from '@/components/auth-route-guard';
import { DlavieAlertCenter } from '@/components/dlavie-alert-center';
import { DlavieErrorBoundary } from '@/components/dlavie-error-boundary';
import { DlavieExperienceShell } from '@/components/dlavie-experience-shell';
import { DlavieProviders } from '@/components/dlavie-providers';
import '../styles/globals.css';
import '../styles/ambient.css';
import '../styles/cosmic.css';
import '../styles/dlavie-system.css';
import '../styles/dlavie-experience.css';
import '../styles/auth-motion.css';

function DlavieLoader({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#eef4ee]/78 backdrop-blur-2xl">
      <div className="dlavie-loader-card rounded-[2rem] bg-white/82 p-6 text-center shadow-[0_28px_85px_rgba(65,78,74,.18)] ring-1 ring-black/5">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-2xl font-black text-[#dfff4f] shadow-inner">D</div>
        <p className="mt-4 text-sm font-black uppercase tracking-[0.35em] text-slate-500">DLAVIE</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">Loading premium experience...</p>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);

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

  return (
    <DlavieProviders>
      <DlavieExperienceShell>
        <AmbientBg />
        <DlavieAlertCenter />
        <DlavieLoader active={loading || authChecking} />
        <AccountShortcut />
        <DlavieErrorBoundary>
          <AuthRouteGuard onCheckingChange={setAuthChecking}>
            <div className="relative z-10 transition-opacity duration-300">
              <Component {...pageProps} />
            </div>
          </AuthRouteGuard>
        </DlavieErrorBoundary>
      </DlavieExperienceShell>
    </DlavieProviders>
  );
}
