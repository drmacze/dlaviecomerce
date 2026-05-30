import { useMemo, useState } from 'react';

const amounts = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 500000, 750000, 1000000];
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const short = (value: number) => value >= 1000000 ? '1JT' : value >= 1000 ? `${value / 1000}K` : String(value);

type Props = {
  selected: number;
  custom: string;
  onPick: (amount: number) => void;
  onCustom: (value: string) => void;
};

export function NeonAmountSelector({ selected, custom, onPick, onCustom }: Props) {
  const [pulse, setPulse] = useState(0);
  const active = Number(custom || selected || 0);
  const activeIndex = Math.max(0, amounts.findIndex((value) => value === selected));
  const visible = useMemo(() => amounts.map((amount, index) => ({ amount, index, distance: index - activeIndex })).filter((item) => Math.abs(item.distance) <= 3), [activeIndex]);

  function pick(amount: number) {
    setPulse(amount);
    onPick(amount);
    window.setTimeout(() => setPulse(0), 360);
  }

  function step(direction: number) {
    const next = Math.min(amounts.length - 1, Math.max(0, activeIndex + direction));
    pick(amounts[next]);
  }

  return (
    <div className="relative mt-4 rounded-[1.8rem] bg-slate-950 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_18px_50px_rgba(0,0,0,.28)] ring-1 ring-[#dfff4f]/25">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Amount Dial</p>
          <p className="mt-1 text-3xl font-black leading-none text-white">{rupiah(active)}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => step(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-white text-xl font-black text-slate-950 shadow-[0_10px_28px_rgba(0,0,0,.22)] transition active:scale-95">‹</button>
          <button type="button" onClick={() => step(1)} className="grid h-11 w-11 place-items-center rounded-full bg-[#dfff4f] text-xl font-black text-slate-950 shadow-[0_0_28px_rgba(223,255,79,.35)] transition active:scale-95">›</button>
        </div>
      </div>

      <div className="relative mt-4 h-36 overflow-hidden rounded-[1.45rem] bg-[#071018] ring-1 ring-white/10">
        <div className="absolute inset-x-8 top-1/2 h-16 -translate-y-1/2 rounded-full bg-[#dfff4f]/15 blur-2xl" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dfff4f]/35 bg-white/[.05] shadow-[0_0_44px_rgba(223,255,79,.14)]" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dfff4f] shadow-[0_0_22px_rgba(223,255,79,.85)]" />
        {visible.map(({ amount, distance }) => {
          const isActive = !custom && selected === amount;
          const abs = Math.abs(distance);
          const x = distance * 4.25;
          const rotate = distance * -16;
          const scale = isActive ? 1.08 : Math.max(0.72, 1 - abs * 0.12);
          const opacity = isActive ? 1 : Math.max(0.36, 0.8 - abs * 0.14);
          return <button key={amount} type="button" onClick={() => pick(amount)} className={`absolute left-1/2 top-1/2 z-10 h-12 w-[5.4rem] -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-black transition duration-300 active:scale-95 ${pulse === amount ? 'animate-pulse' : ''} ${isActive ? 'bg-[#dfff4f] text-slate-950 shadow-[0_0_30px_rgba(223,255,79,.48)]' : 'bg-white text-slate-950 shadow-[0_12px_28px_rgba(0,0,0,.22)] hover:bg-[#dfff4f]'}`} style={{ transform: `translate(-50%, -50%) translateX(${x}rem) rotate(${rotate}deg) scale(${scale})`, opacity }}>{short(amount)}</button>;
        })}
        <div className="absolute inset-x-6 bottom-3 rounded-full bg-white/10 p-2 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/65 ring-1 ring-white/10">tap number or use arrows</div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-[#dfff4f]/20">
        <input value={custom} onChange={(event) => onCustom(event.target.value.replace(/[^0-9]/g, ''))} className="min-w-0 rounded-full bg-transparent px-3 py-2.5 text-sm font-black text-slate-950 outline-none placeholder:text-slate-400" placeholder="Custom min 10000" inputMode="numeric" />
        <button type="button" onClick={() => onCustom('')} className="rounded-full bg-slate-950 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#dfff4f] transition active:scale-95">Clear</button>
      </div>
    </div>
  );
}
