import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function DlaviePageProgress() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof window.setInterval> | null = null;

    const start = () => {
      setVisible(true);
      setProgress(12);
      timer = window.setInterval(() => {
        setProgress((value) => Math.min(value + Math.random() * 18, 88));
      }, 180);
    };

    const done = () => {
      if (timer) window.clearInterval(timer);
      setProgress(100);
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 420);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);

    return () => {
      if (timer) window.clearInterval(timer);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router.events]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[110] h-1 bg-transparent" aria-hidden="true">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-[#45d5ff] via-[#dfff4f] to-[#e728ff] shadow-[0_0_28px_rgba(223,255,79,.8)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
