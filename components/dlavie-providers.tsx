import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';

function useDlavieSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    let destroyed = false;
    let instance: { raf: (time: number) => void; destroy: () => void } | null = null;

    import('lenis').then(({ default: Lenis }) => {
      if (destroyed) return;
      instance = new Lenis({ duration: 1.08, smoothWheel: true, touchMultiplier: 1.15 });
      function raf(time: number) {
        instance?.raf(time);
        frame = requestAnimationFrame(raf);
      }
      frame = requestAnimationFrame(raf);
    });

    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      instance?.destroy();
    };
  }, []);
}

export function DlavieProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 30, refetchOnWindowFocus: false, retry: 1 } } }));
  useDlavieSmoothScroll();

  return <QueryClientProvider client={queryClient}>{children}<Toaster richColors position="top-center" toastOptions={{ style: { borderRadius: '1.25rem', fontWeight: 800 } }} /></QueryClientProvider>;
}
