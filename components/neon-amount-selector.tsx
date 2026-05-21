import { useState } from 'react';

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

  function pick(amount: number) {
    setPulse(amount);
    onPick(amount);
    window.setTimeout(() => setPulse(0), 520);
  }

  return (
    <div className="relative mt-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {amounts.map((amount) => {
          const active = !custom && selected === amount;
          return (
            <button key={amount} onClick={() => pick(amount)} className={`group relative rounded-[1.45rem] p-[1px] transition duration-300 active:scale-95 ${pulse === amount ? 'animate-pulse' : ''}`}>
              <span className={`absolute inset-x-4 -bottom-1 h-5 rounded-full blur-xl transition duration-300 ${active ? 'bg-[#dfff4f]/80 opacity-100' : 'bg-cyan-300/25 opacity-40 group-hover:opacity-80'}`} />
              <span className={`relative block rounded-[1.4rem] px-4 py-5 text-left font-black shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_18px_35px_rgba(0,0,0,.28)] ring-1 transition duration-300 group-hover:-translate-y-1 ${active ? 'bg-[#dfff4f] text-slate-950 ring-[#dfff4f]/80' : 'bg-white/[.09] text-white ring-white/10 group-hover:bg-white/[.14] group-hover:ring-[#dfff4f]/35'}`}>
                <span className="block text-lg">{rupiah(amount)}</span>
                <span className={`mt-1 block text-[11px] font-black uppercase tracking-widest ${active ? 'text-slate-600' : 'text-white/35'}`}>{active ? 'Selected' : 'Auto / manual'}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-[1.5rem] bg-white/[.08] p-4 ring-1 ring-white/10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#dfff4f]">Custom Nominal</p>
        <input value={custom} onChange={(event) => onCustom(event.target.value.replace(/[^0-9]/g, ''))} className="mt-3 w-full rounded-full border border-white/10 bg-slate-950/60 p-4 font-black text-white outline-none transition placeholder:text-white/25 focus:ring-4 focus:ring-[#dfff4f]/20" placeholder="Isi nominal custom, min 10000" inputMode="numeric" />
      </div>
    </div>
  );
}
