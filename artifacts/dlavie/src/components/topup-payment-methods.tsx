import { ChangeEvent, useMemo, useState } from 'react';

const methods = [
  { id: 'bri', name: 'BRI', number: '219701005840539', hint: 'Bank transfer', theme: 'from-blue-700 to-blue-500', glow: 'bg-blue-400/25' },
  { id: 'dana', name: 'DANA', number: '088215689772', hint: 'E-wallet', theme: 'from-sky-500 to-blue-500', glow: 'bg-sky-400/25' },
  { id: 'gopay', name: 'GoPay', number: '0882007437216', hint: 'E-wallet', theme: 'from-cyan-500 to-emerald-400', glow: 'bg-cyan-300/25' },
  { id: 'qris', name: 'QRIS', number: 'TOKOBOT · ID1025431784608', hint: 'Scan all apps', theme: 'from-slate-950 to-slate-700', glow: 'bg-[#dfff4f]/25' }
];

const qrCells = [0,1,2,3,4,6,7,8,9,10,12,15,18,20,22,24,27,29,30,33,35,36,38,40,42,44,45,48,50,54,56,58,59,60,63,64,66,69,72,74,77,80,82,84,86,88,90,91,94,96,99,102,104,106,108,110,112,114,117,119,120,121,124,126,128,130,132,135,138,140,143];

type ManualProof = { provider: string; sender_name: string; proof_note: string; proof_image_data: string; proof_image_name: string };
type Props = { selectedAmount: number; status: string; onCreateTopup: (proof: ManualProof) => void };

function BrandBadge({ id, name }: { id: string; name: string }) {
  if (id === 'dana') return <span className="rounded-md bg-white px-2 py-1 text-sm font-black text-sky-600">DANA</span>;
  if (id === 'bri') return <span className="rounded-md bg-white px-2 py-1 text-sm font-black text-blue-700">BRI</span>;
  if (id === 'gopay') return <span className="rounded-md bg-white px-2 py-1 text-sm font-black text-cyan-600">gopay</span>;
  return <span className="rounded-md bg-white px-2 py-1 text-sm font-black text-slate-950">QRIS</span>;
}

export function TopupPaymentMethods({ selectedAmount, status, onCreateTopup }: Props) {
  const [activeId, setActiveId] = useState(methods[0].id);
  const [copied, setCopied] = useState('');
  const [senderName, setSenderName] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [proofImageName, setProofImageName] = useState('');
  const active = useMemo(() => methods.find((item) => item.id === activeId) || methods[0], [activeId]);
  const proofReady = senderName.trim().length >= 3 && proofNote.trim().length >= 6 && Boolean(proofImage);

  async function copy(value: string, label: string) {
    await navigator.clipboard?.writeText(value).catch(() => null);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1400);
  }

  function uploadProof(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setProofNote('File bukti harus berupa gambar dari galeri.');
    if (file.size > 900_000) return setProofNote('Ukuran gambar terlalu besar. Kompres/screenshot ulang di bawah 900KB.');
    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(String(reader.result || ''));
      setProofImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="mt-3 rounded-[1.55rem] bg-white/[.07] p-3 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Manual Pay</p><p className="mt-1 text-sm font-bold text-white/55">Transfer, upload bukti, lalu request topup.</p></div>
        <div className="rounded-full bg-[#dfff4f] px-3 py-2 text-[11px] font-black text-slate-950">Rp {Number(selectedAmount || 0).toLocaleString('id-ID')}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {methods.map((method) => {
          const selected = active.id === method.id;
          return <button key={method.id} type="button" onClick={() => setActiveId(method.id)} className={`relative overflow-hidden rounded-[1.1rem] bg-gradient-to-br ${method.theme} p-3 text-left text-white shadow-[0_12px_26px_rgba(0,0,0,.18)] ring-2 transition active:scale-95 ${selected ? 'ring-[#dfff4f]' : 'ring-white/10 opacity-78'}`}><div className="flex items-center justify-between gap-2"><BrandBadge id={method.id} name={method.name} /><span className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest">{selected ? 'Active' : 'Tap'}</span></div><p className="mt-3 text-xs font-bold text-white/75">{method.hint}</p></button>;
        })}
      </div>

      <article className="relative mt-3 overflow-hidden rounded-[1.45rem] bg-slate-950 p-4 ring-1 ring-[#dfff4f]/25">
        <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${active.glow} blur-2xl`} />
        <div className="relative flex items-center gap-3"><div className={`grid h-12 w-16 shrink-0 place-items-center rounded-[1rem] bg-gradient-to-br ${active.theme}`}><BrandBadge id={active.id} name={active.name} /></div><div className="min-w-0 flex-1"><p className="font-black text-white">{active.name}</p><p className="truncate text-sm font-semibold text-white/55">{active.hint}</p></div>{active.id !== 'qris' && <button onClick={() => copy(active.number, active.name)} className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#dfff4f] ring-1 ring-white/10">{copied === active.name ? 'OK' : 'Copy'}</button>}</div>

        {active.id === 'qris' ? <div className="mt-4 grid grid-cols-[7.5rem_1fr] gap-3"><div className="relative rounded-[1.1rem] bg-white p-2 shadow-[0_0_32px_rgba(223,255,79,.16)]"><div className="grid grid-cols-12 gap-[2px] rounded-lg bg-white p-1">{Array.from({ length: 144 }).map((_, index) => <span key={index} className={`aspect-square rounded-[1px] ${qrCells.includes(index) ? 'bg-slate-950' : 'bg-transparent'}`} />)}</div><p className="mt-1 text-center text-[9px] font-black text-slate-950">QRIS</p></div><div className="rounded-[1.1rem] bg-white/10 p-3 ring-1 ring-white/10"><p className="text-xs font-black text-[#dfff4f]">TOKOBOT</p><p className="mt-1 text-xs font-semibold leading-5 text-white/55">Scan QRIS, isi nominal sama persis, lalu upload bukti dari galeri.</p></div></div> : <div className="mt-4 rounded-[1.1rem] bg-white/10 p-3 ring-1 ring-white/10"><p className="text-[10px] font-black uppercase tracking-widest text-white/35">Nomor tujuan</p><p className="mt-1 break-all text-lg font-black text-[#dfff4f]">{active.number}</p></div>}

        <div className="mt-4 grid gap-2"><input value={senderName} onChange={(event) => setSenderName(event.target.value)} className="w-full rounded-full bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none placeholder:text-slate-400" placeholder="Nama pengirim / nama akun pembayaran" /><textarea value={proofNote} onChange={(event) => setProofNote(event.target.value)} className="min-h-[5rem] w-full rounded-[1.2rem] bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" placeholder="Catatan bukti: jam transfer, 4 digit akhir, nama bank/e-wallet" /><label className="grid cursor-pointer place-items-center rounded-[1.2rem] border border-dashed border-[#dfff4f]/60 bg-white/10 p-4 text-center text-sm font-black text-[#dfff4f]"><input type="file" accept="image/*" className="hidden" onChange={uploadProof} />{proofImage ? `Bukti dipilih: ${proofImageName || 'gambar'}` : 'Upload Bukti dari Galeri'}</label>{proofImage && <img src={proofImage} alt="Preview bukti pembayaran" className="max-h-36 rounded-[1.1rem] object-cover ring-1 ring-white/10" />}</div>

        <button disabled={!proofReady} onClick={() => onCreateTopup({ provider: active.id, sender_name: senderName.trim(), proof_note: proofNote.trim(), proof_image_data: proofImage, proof_image_name: proofImageName })} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-3.5 text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(223,255,79,.18)] transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45">Request topup</button>
        <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-white/45">{status}</p>
      </article>
    </section>
  );
}
