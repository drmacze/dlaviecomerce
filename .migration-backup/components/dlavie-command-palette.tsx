import { Command } from 'cmdk';
import { Search, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { dlavieRoutes } from '@/lib/dlavie-experience';

export function DlavieCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const commandKey = isMac ? event.metaKey : event.ctrlKey;
      if (commandKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [router.asPath]);

  const routes = useMemo(() => dlavieRoutes, []);

  function goTo(href: string) {
    setOpen(false);
    void router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="dlavie-command-trigger fixed bottom-[5.4rem] right-4 z-[72] hidden items-center gap-2 rounded-full border border-white/60 bg-white/72 px-4 py-3 text-xs font-black text-slate-700 shadow-[0_22px_70px_rgba(15,23,42,.14)] backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white md:flex"
        aria-label="Open DLAVIE command palette"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
        <kbd className="rounded-full bg-slate-950 px-2 py-1 text-[10px] text-[#dfff4f]">Ctrl K</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[95] grid place-items-start bg-slate-950/38 px-3 py-16 backdrop-blur-xl md:place-items-center md:py-0" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" aria-label="Close command palette" onClick={() => setOpen(false)} />
          <Command className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 shadow-[0_32px_120px_rgba(15,23,42,.28)] ring-1 ring-black/5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200/70 px-4 py-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-[#dfff4f] shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
              <Command.Input
                value={query}
                onValueChange={setQuery}
                autoFocus
                placeholder="Cari halaman, produk, wallet, orders, dashboard..."
                className="min-w-0 flex-1 bg-transparent text-base font-black text-slate-950 outline-none placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-950 hover:text-white" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Command.List className="max-h-[24rem] overflow-y-auto p-3">
              <Command.Empty className="rounded-[1.25rem] bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">Tidak ada hasil untuk “{query}”.</Command.Empty>
              <Command.Group heading="DLAVIE Navigation" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
                {routes.map((route) => (
                  <Command.Item
                    key={route.href}
                    value={`${route.label} ${route.description}`}
                    onSelect={() => goTo(route.href)}
                    className="group grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-[1.25rem] px-3 py-3 text-left outline-none transition data-[selected=true]:bg-slate-950 data-[selected=true]:text-white"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dfff4f] text-xs font-black text-slate-950 shadow-sm">{route.label.slice(0, 1)}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black">{route.label}</span>
                      <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500 group-data-[selected=true]:text-white/60">{route.description}</span>
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}
