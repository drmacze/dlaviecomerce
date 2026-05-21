import { useMemo, useState } from 'react';

const amounts = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 500000, 750000, 1000000];
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

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
  const rotation = activeIndex * -32;
  const visible = useMemo(() => amounts.map((amount, index) => ({ amount, index, angle: (index - activeIndex) * 32 })), [activeIndex]);

  function pick(amount: number) {
    setPulse(amount);
    onPick(amount);
    window.setTimeout(() => setPulse(0), 420);
  }

  function step(direction: number) {
    const next = Math.min(amounts.length - 1, Math.max(0, activeIndex + direction));
    pick(amounts[next]);
  }

  return (
    <div className="relative mt-4 overflow-hidden rounded-[1.8rem] bg-white/[.07] p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Rotary Amount</p>
          <p className="mt-1 text-3xl font-black leading-none text-white">{rupiah(active)}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-lg font-black text-white ring-1 ring-white/10 transition hover:bg-[#dfff4f] hover:text-slate-950">‹</button>
          <button type="button" onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-lg font-black text-white ring-1 ring-white/10 transition hover:bg-[#dfff4f] hover:text-slate-950">›</button>
        </div>
      </div>

      <div className="relative mx-auto mt-4 h-44 max-w-sm select-none overflow-hidden rounded-[1.6rem] bg-slate-950/65 ring-1 ring-white/10">
        <div className="absolute left-1/2 top-[7.7rem] h-28 w-28 -translate-x-1/2 rounded-full bg-[#dfff4f]/20 blur-2xl" />
        <div className="absolute left-1/2 top-[5.7rem] h-20 w-20 -translate-x-1/2 rounded-full border border-[#dfff4f]/35 bg-white/[.06] shadow-[0_0_40px_rgba(223,255,79,.12)]" />
        <div className="absolute left-1/2 top-[6.6rem] h-2 w-2 -translate-x-1/2 rounded-full bg-[#dfff4f] shadow-[0_0_24px_rgba(223,255,79,.85)]" />
        <div className="absolute left-1/2 top-[7rem] h-56 w-56 -translate-x-1/2 rounded-full border border-white/10 transition-transform duration-500 ease-out" style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}>
          {visible.map(({ amount, index, angle }) => {
            const isActive = !custom && selected === amount;
            const transform = `rotate(${angle}deg) translateY(-6.8rem) rotate(${-angle - rotation}deg)`;
            return <button key={amount} type="button" onClick={() => pick(amount)} className={`absolute left-1/2 top-1/2 -ml-12 -mt-5 h-10 w-24 rounded-full text-xs font-black transition duration-300 active:scale-95 ${pulse === amount ? 'animate-pulse' : ''} ${isActive ? 'bg-[#dfff4f] text-slate-950 shadow-[0_0_28px_rgba(223,255,79,.45)]' : 'bg-white/10 text-white/60 ring-1 ring-white/10 hover:bg-white/20 hover:text-white'}`} style={{ transform }}>{amount >= 1000000 ? '1JT' : amount >= 1000 ? `${amount / 1000}K` : amount}</button>;
          })}
        </div>
        <div className="absolute inset-x-10 bottom-3 rounded-full bg-white/10 p-2 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/45 ring-1 ring-white/10">tap / rotate selector</div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2 rounded-full bg-slate-950/60 p-1.5 ring-1 ring-white/10">
        <input value={custom} onChange={(event) => onCustom(event.target.value.replace(/[^0-9]/g, ''))} className="min-w-0 rounded-full bg-transparent px-3 py-2.5 text-sm font-black text-white outline-none placeholder:text-white/25" placeholder="Custom min 10000" inputMode="numeric" />
        <button type="button" onClick={() => onCustom('')} className="rounded-full bg-white/10 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:bg-[#dfff4f] hover:text-slate-950">Clear</button>
      </div>
    </div>
  );
}
