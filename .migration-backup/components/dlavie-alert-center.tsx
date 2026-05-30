import { useEffect, useState } from 'react';

type AlertTone = 'success' | 'error' | 'warning' | 'info';
type AlertItem = { id: number; tone: AlertTone; title: string; message: string };

declare global {
  interface Window {
    dlavieAlert?: (alert: Partial<Omit<AlertItem, 'id'>>) => void;
  }
}

const toneStyle: Record<AlertTone, { shell: string; dot: string; label: string }> = {
  success: { shell: 'border-emerald-300/60 bg-emerald-50 text-emerald-950', dot: 'bg-emerald-500', label: 'Success' },
  error: { shell: 'border-red-300/60 bg-red-50 text-red-950', dot: 'bg-red-500', label: 'Error' },
  warning: { shell: 'border-amber-300/70 bg-amber-50 text-amber-950', dot: 'bg-amber-500', label: 'Warning' },
  info: { shell: 'border-sky-300/60 bg-sky-50 text-sky-950', dot: 'bg-sky-500', label: 'Info' }
};

export function notifyDlavie(alert: Partial<Omit<AlertItem, 'id'>>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('dlavie-alert', { detail: alert }));
}

export function DlavieAlertCenter() {
  const [items, setItems] = useState<AlertItem[]>([]);

  useEffect(() => {
    function push(event: Event) {
      const detail = (event as CustomEvent).detail || {};
      const item: AlertItem = {
        id: Date.now() + Math.random(),
        tone: detail.tone || 'info',
        title: detail.title || toneStyle[detail.tone as AlertTone]?.label || 'Info',
        message: detail.message || 'Aksi diproses.'
      };
      setItems((current) => [item, ...current].slice(0, 4));
      window.setTimeout(() => setItems((current) => current.filter((entry) => entry.id !== item.id)), detail.duration || 5200);
    }
    window.dlavieAlert = (alert) => window.dispatchEvent(new CustomEvent('dlavie-alert', { detail: alert }));
    window.addEventListener('dlavie-alert', push);
    return () => window.removeEventListener('dlavie-alert', push);
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed left-3 right-3 top-3 z-[80] grid gap-2 md:left-auto md:right-5 md:top-5 md:w-[25rem]">
      {items.map((item) => {
        const style = toneStyle[item.tone] || toneStyle.info;
        return (
          <article key={item.id} className={`relative overflow-hidden rounded-[1.35rem] border p-4 shadow-[0_18px_55px_rgba(15,23,42,.16)] backdrop-blur-xl ${style.shell}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-1 h-3 w-3 shrink-0 rounded-full shadow-[0_0_18px_rgba(15,23,42,.16)] ${style.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-60">{style.label}</p>
                <h3 className="mt-1 text-sm font-black leading-5">{item.title}</h3>
                <p className="mt-1 text-xs font-bold leading-5 opacity-75">{item.message}</p>
              </div>
              <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/5 text-xs font-black">×</button>
            </div>
            <span className="absolute inset-x-0 bottom-0 h-1 bg-black/10" />
          </article>
        );
      })}
    </div>
  );
}
