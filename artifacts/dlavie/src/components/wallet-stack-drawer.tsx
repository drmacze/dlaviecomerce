import { ReactNode, useMemo, useState } from 'react';

type StackItem = {
  id: string;
  title: string;
  label: string;
  accent?: string;
  content: ReactNode;
};

type Props = { items: StackItem[] };

const cardStyles = [
  { shell: 'from-[#dfff4f] to-[#9eff6a]', text: 'text-slate-950', badge: 'bg-slate-950 text-[#dfff4f]', glow: 'bg-[#dfff4f]' },
  { shell: 'from-[#38bdf8] to-[#2563eb]', text: 'text-white', badge: 'bg-white text-blue-700', glow: 'bg-sky-300' },
  { shell: 'from-[#f97316] to-[#ef4444]', text: 'text-white', badge: 'bg-white text-orange-700', glow: 'bg-orange-300' },
  { shell: 'from-[#a78bfa] to-[#6366f1]', text: 'text-white', badge: 'bg-white text-indigo-700', glow: 'bg-violet-300' }
];

export function WalletStackDrawer({ items }: Props) {
  const [openId, setOpenId] = useState(items[0]?.id || '');
  const [pulling, setPulling] = useState('');
  const active = useMemo(() => items.find((item) => item.id === openId) || items[0], [items, openId]);

  return (
    <section className="relative mt-4">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Tap one card to switch</p>
        <p className="rounded-full bg-[#dfff4f] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-[0_0_22px_rgba(223,255,79,.24)]">Auto / Manual / Logs</p>
      </div>
      <div className="relative h-[8.35rem] overflow-visible">
        {items.map((item, index) => {
          const activeItem = item.id === openId;
          const offset = index * 1.1;
          const rotate = (index - 1) * 1.45;
          const style = cardStyles[index % cardStyles.length];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              onMouseDown={() => setPulling(item.id)}
              onMouseUp={() => setPulling('')}
              onMouseLeave={() => setPulling('')}
              onTouchStart={() => setPulling(item.id)}
              onTouchEnd={() => setPulling('')}
              className={`group absolute left-0 right-0 h-[5.55rem] overflow-hidden rounded-t-[1.55rem] border px-4 pt-3 text-left shadow-[0_-14px_36px_rgba(0,0,0,.28)] transition duration-500 ease-out active:scale-[.985] bg-gradient-to-br ${style.shell} ${style.text} ${activeItem ? 'z-30 border-white/60 shadow-[0_-16px_46px_rgba(223,255,79,.24)]' : 'border-white/30 hover:-translate-y-1 hover:border-white/80'}`}
              style={{ top: `${index * 1.18}rem`, transform: `translateY(${activeItem ? '1.1rem' : `${offset * 0.08}rem`}) rotate(${rotate}deg) ${pulling === item.id ? 'translateY(-.38rem)' : ''}` }}
            >
              <span className={`pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full ${style.glow} opacity-30 blur-2xl transition group-hover:opacity-60`} />
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/55" />
              {!activeItem && <span className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-1/3 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,.55)] transition-all duration-700 group-hover:w-full" />}
              <span className={`absolute right-4 top-3 grid h-10 min-w-14 place-items-center rounded-full px-2 text-[10px] font-black uppercase tracking-widest transition ${style.badge} ${activeItem ? '' : 'animate-pulse shadow-[0_0_22px_rgba(255,255,255,.25)]'}`}>{activeItem ? 'OPEN' : 'TAP'}</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] opacity-75">{item.label}</span>
              <span className="mt-1 block pr-16 text-base font-black">{item.title}</span>
              <span className="mt-1 block text-[10px] font-bold opacity-70">{activeItem ? 'Currently opened' : 'Tap to switch method'}</span>
            </button>
          );
        })}
      </div>

      <div className="relative z-40 -mt-2 overflow-hidden rounded-[1.85rem] bg-[#071018] p-4 text-white shadow-[0_30px_76px_rgba(0,0,0,.34)] ring-1 ring-[#dfff4f]/20">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#dfff4f]/16 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-8 h-32 w-32 rounded-full bg-cyan-300/14 blur-3xl" />
        <div className="relative mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">Opened Card</p>
            <h3 className="mt-1 text-xl font-black leading-tight">{active?.title}</h3>
          </div>
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dfff4f] text-slate-950 shadow-[0_0_30px_rgba(223,255,79,.35)]">
            <span className="text-lg font-black">D</span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white" />
          </div>
        </div>
        <div key={active?.id} className="relative animate-[fadeIn_.28s_ease-out] transition-all duration-500">{active?.content}</div>
      </div>
    </section>
  );
}
