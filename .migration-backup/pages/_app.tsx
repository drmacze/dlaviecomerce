import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AccountShortcut } from '@/components/account-shortcut';
import { AmbientBg } from '@/components/ambient-bg';
import { AuthRouteGuard } from '@/components/auth-route-guard';
import { DlavieAlertCenter } from '@/components/dlavie-alert-center';
import { DlavieAssetBoot } from '@/components/dlavie-asset-boot';
import { DlavieErrorBoundary } from '@/components/dlavie-error-boundary';
import { DlavieExperienceShell } from '@/components/dlavie-experience-shell';
import { DlavieProviders } from '@/components/dlavie-providers';
import { RuntimeControlBanner } from '@/components/runtime-control-banner';
import '../styles/globals.css';
import '../styles/ambient.css';
import '../styles/cosmic.css';
import '../styles/dlavie-system.css';
import '../styles/dlavie-experience.css';
import '../styles/dlavie-premium-v2.css';
import '../styles/auth-motion.css';

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
        <RuntimeControlBanner />
        <DlavieAssetBoot routeLoading={loading} authChecking={authChecking} />
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
