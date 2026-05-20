import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Lenis from 'lenis';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';

function useDlavieSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = new Lenis({ duration: 1.08, smoothWheel: true, touchMultiplier: 1.15 });
    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}

export function DlavieProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 30, refetchOnWindowFocus: false, retry: 1 } } }));
  useDlavieSmoothScroll();

  return <QueryClientProvider client={queryClient}>{children}<Toaster richColors position="top-center" toastOptions={{ style: { borderRadius: '1.25rem', fontWeight: 800 } }} /></QueryClientProvider>;
}
