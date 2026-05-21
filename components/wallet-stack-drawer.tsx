import { ReactNode, useState } from 'react';

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
  const active = items.find((item) => item.id === openId) || items[0];

  return (
    <section className="relative mt-4">
      <div className="relative h-24">
        {items.map((item, index) => {
          const activeItem = item.id === openId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              className={`absolute left-0 right-0 h-20 rounded-t-[1.5rem] px-4 text-left shadow-[0_-10px_35px_rgba(0,0,0,.18)] ring-1 ring-white/10 transition duration-500 ${activeItem ? 'z-30 translate-y-4 bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white hover:-translate-y-1'}`}
              style={{ top: index * 18, transform: `${activeItem ? 'translateY(1rem)' : `translateY(${index * 0.15}rem)`} rotate(${(index - 1) * 1.2}deg)` }}
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] opacity-60">{item.label}</span>
              <span className="mt-1 block text-sm font-black">{item.title}</span>
            </button>
          );
        })}
      </div>
      <div className="relative z-40 -mt-1 rounded-[1.8rem] bg-slate-950/90 p-4 text-white shadow-[0_26px_70px_rgba(0,0,0,.26)] ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">Opened Card</p>
            <h3 className="mt-1 text-xl font-black">{active?.title}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#dfff4f] shadow-[0_0_28px_rgba(223,255,79,.35)]" />
        </div>
        <div className="transition-all duration-500">{active?.content}</div>
      </div>
    </section>
  );
}
