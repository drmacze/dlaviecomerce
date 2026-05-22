import { ReactNode, useMemo, useState } from 'react';

type StackItem = {
  id: string;
  title: string;
  label: string;
  accent?: string;
  content: ReactNode;
};

type Props = { items: StackItem[] };

export function WalletStackDrawer({ items }: Props) {
  const [openId, setOpenId] = useState(items[0]?.id || '');
  const [pulling, setPulling] = useState('');
  const active = useMemo(() => items.find((item) => item.id === openId) || items[0], [items, openId]);

  return (
    <section className="relative mt-4">
      <div className="relative h-[7.4rem] overflow-visible">
        {items.map((item, index) => {
          const activeItem = item.id === openId;
          const offset = index * 1.05;
          const rotate = (index - 1) * 1.4;
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
              className={`absolute left-0 right-0 h-[5.25rem] overflow-hidden rounded-t-[1.55rem] px-4 pt-3 text-left ring-1 ring-white/10 transition duration-500 ease-out active:scale-[.985] ${activeItem ? 'z-30 bg-[#dfff4f] text-slate-950 shadow-[0_-12px_40px_rgba(223,255,79,.20)]' : 'bg-white/[.105] text-white shadow-[0_-10px_35px_rgba(0,0,0,.18)] hover:bg-white/[.15]'}`}
              style={{ top: `${index * 1.05}rem`, transform: `translateY(${activeItem ? '1.05rem' : `${offset * 0.1}rem`}) rotate(${rotate}deg) ${pulling === item.id ? 'translateY(-.25rem)' : ''}` }}
            >
              <span className="pointer-events-none absolute right-3 top-3 h-8 w-14 rounded-full bg-white/20 blur-md" />
              <span className={`absolute right-4 top-3 grid h-9 w-9 place-items-center rounded-full text-xs font-black transition ${activeItem ? 'bg-slate-950 text-[#dfff4f]' : 'bg-white/10 text-white/55'}`}>↗</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] opacity-60">{item.label}</span>
              <span className="mt-1 block pr-12 text-sm font-black">{item.title}</span>
              <span className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${activeItem ? 'w-full bg-slate-950/25' : 'w-1/3 bg-[#dfff4f]/35'}`} />
            </button>
          );
        })}
      </div>

      <div className="relative z-40 -mt-2 overflow-hidden rounded-[1.85rem] bg-slate-950/92 p-4 text-white shadow-[0_30px_76px_rgba(0,0,0,.30)] ring-1 ring-white/10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#dfff4f]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-8 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">Pulled From Stack</p>
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
