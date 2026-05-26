import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';

function useDlavieSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let destroyed = false;
    let instance: { raf: (time: number) => void; destroy: () => void } | null = null;

    import('lenis').then(({ default: Lenis }) => {
      if (destroyed) return;
      instance = new Lenis({
        duration: 1.08,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.12,
        wheelMultiplier: 0.92
      });

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 45,
            gcTime: 1000 * 60 * 8,
            refetchOnWindowFocus: false,
            retry: 1
          },
          mutations: {
            retry: 0
          }
        }
      })
  );

  useDlavieSmoothScroll();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          richColors
          closeButton
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '1.25rem',
              fontWeight: 800,
              backdropFilter: 'blur(18px)'
            }
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
