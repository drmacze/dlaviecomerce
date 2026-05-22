import { useMemo, useState } from 'react';

const methods = [
  { id: 'bri', name: 'BRI', number: '219701005840539', icon: 'BRI', hint: 'Bank transfer', glow: 'bg-blue-400/25' },
  { id: 'dana', name: 'Dana', number: '088215689772', icon: 'D', hint: 'E-wallet', glow: 'bg-sky-400/25' },
  { id: 'gopay', name: 'Gopay', number: '0882007437216', icon: 'G', hint: 'E-wallet', glow: 'bg-cyan-300/25' },
  { id: 'qris', name: 'QRIS', number: 'TOKOBOT · ID1025431784608', icon: 'QR', hint: 'Scan all apps', glow: 'bg-[#dfff4f]/25' }
];

const qrCells = [0,1,2,3,4,6,7,8,9,10,12,15,18,20,22,24,27,29,30,33,35,36,38,40,42,44,45,48,50,54,56,58,59,60,63,64,66,69,72,74,77,80,82,84,86,88,90,91,94,96,99,102,104,106,108,110,112,114,117,119,120,121,124,126,128,130,132,135,138,140,143];

type ManualProof = { provider: string; sender_name: string; proof_note: string };
type Props = { selectedAmount: number; status: string; onCreateTopup: (proof: ManualProof) => void };

export function TopupPaymentMethods({ selectedAmount, status, onCreateTopup }: Props) {
  const [activeId, setActiveId] = useState(methods[0].id);
  const [copied, setCopied] = useState('');
  const [senderName, setSenderName] = useState('');
  const [proofNote, setProofNote] = useState('');
  const active = useMemo(() => methods.find((item) => item.id === activeId) || methods[0], [activeId]);
  const proofReady = senderName.trim().length >= 3 && proofNote.trim().length >= 6;

  async function copy(value: string, label: string) {
    await navigator.clipboard?.writeText(value).catch(() => null);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1400);
  }

  return (
    <section className="mt-3 rounded-[1.55rem] bg-white/[.07] p-3 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Manual Pay</p>
          <p className="mt-1 text-sm font-bold text-white/55">Transfer, isi bukti, lalu submit pending.</p>
        </div>
        <div className="rounded-full bg-[#dfff4f] px-3 py-2 text-[11px] font-black text-slate-950">Rp {Number(selectedAmount || 0).toLocaleString('id-ID')}</div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {methods.map((method) => {
          const selected = active.id === method.id;
          return <button key={method.id} type="button" onClick={() => setActiveId(method.id)} className={`relative min-w-[5.7rem] rounded-full px-3 py-2.5 text-xs font-black transition active:scale-95 ${selected ? 'bg-[#dfff4f] text-slate-950 shadow-[0_0_25px_rgba(223,255,79,.28)]' : 'bg-white/10 text-white/60 ring-1 ring-white/10 hover:text-white'}`}>{method.name}</button>;
        })}
      </div>

      <article className="relative mt-2 overflow-hidden rounded-[1.45rem] bg-slate-950/90 p-4 ring-1 ring-[#dfff4f]/20">
        <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${active.glow} blur-2xl`} />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-slate-950 shadow-[0_0_32px_rgba(223,255,79,.12)]">{active.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-white">{active.name}</p>
            <p className="truncate text-sm font-semibold text-white/55">{active.hint}</p>
          </div>
          {active.id !== 'qris' && <button onClick={() => copy(active.number, active.name)} className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#dfff4f] ring-1 ring-white/10 transition hover:bg-[#dfff4f] hover:text-slate-950">{copied === active.name ? 'OK' : 'Copy'}</button>}
        </div>

        {active.id === 'qris' ? (
          <div className="mt-4 grid grid-cols-[7.5rem_1fr] gap-3">
            <div className="relative rounded-[1.1rem] bg-white p-2 shadow-[0_0_32px_rgba(223,255,79,.16)]"><div className="grid grid-cols-12 gap-[2px] rounded-lg bg-white p-1">{Array.from({ length: 144 }).map((_, index) => <span key={index} className={`aspect-square rounded-[1px] ${qrCells.includes(index) ? 'bg-slate-950' : 'bg-transparent'}`} />)}</div><p className="mt-1 text-center text-[9px] font-black text-slate-950">QRIS</p></div>
            <div className="rounded-[1.1rem] bg-white/10 p-3 ring-1 ring-white/10"><p className="text-xs font-black text-[#dfff4f]">TOKOBOT</p><p className="mt-1 text-xs font-semibold leading-5 text-white/55">Scan QRIS, isi nominal sama persis, lalu isi bukti di bawah.</p></div>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.1rem] bg-white/10 p-3 ring-1 ring-white/10"><p className="text-[10px] font-black uppercase tracking-widest text-white/35">Nomor tujuan</p><p className="mt-1 break-all text-lg font-black text-[#dfff4f]">{active.number}</p></div>
        )}

        <div className="mt-4 grid gap-2">
          <input value={senderName} onChange={(event) => setSenderName(event.target.value)} className="w-full rounded-full bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none placeholder:text-slate-400" placeholder="Nama pengirim / nama akun pembayaran" />
          <textarea value={proofNote} onChange={(event) => setProofNote(event.target.value)} className="min-h-[5.5rem] w-full rounded-[1.2rem] bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" placeholder="Catatan bukti: jam transfer, 4 digit akhir, nama bank/e-wallet, atau link screenshot bukti pembayaran" />
        </div>

        <button disabled={!proofReady} onClick={() => onCreateTopup({ provider: active.id, sender_name: senderName.trim(), proof_note: proofNote.trim() })} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-3.5 text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(223,255,79,.18)] transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45">{proofReady ? 'Submit Manual Topup' : 'Lengkapi Bukti Pembayaran'}</button>
        <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-white/45">{status}</p>
      </article>
    </section>
  );
}
