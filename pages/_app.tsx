import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { DlavieProviders } from '@/components/dlavie-providers';
import '../styles/globals.css';

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

  return <DlavieProviders><DlavieLoader active={loading} /><div className="transition-opacity duration-300"><Component {...pageProps} /></div><Analytics /></DlavieProviders>;
}
