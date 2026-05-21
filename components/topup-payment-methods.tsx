import { useState } from 'react';

const qrisPath = 'M4 4h7v1H4zM12 4h1v1H12zM14 4h5v1H14zM20 4h2v1H20zM23 4h1v1H23zM25 4h1v1H25zM28 4h1v1H28zM34 4h2v1H34zM37 4h1v1H37zM40 4h1v1H40zM44 4h1v1H44zM46 4h7v1H46zM4 5h1v1H4zM10 5h1v1H10zM12 5h1v1H12zM14 5h1v1H14zM16 5h1v1H16zM18 5h2v1H18zM21 5h3v1H21zM27 5h1v1H27zM29 5h2v1H29zM36 5h1v1H36zM40 5h5v1H40zM46 5h1v1H46zM52 5h1v1H52zM4 6h1v1H4zM6 6h3v1H6zM10 6h1v1H10zM13 6h1v1H13zM17 6h1v1H17zM20 6h3v1H20zM26 6h2v1H26zM32 6h1v1H32zM34 6h1v1H34zM37 6h3v1H37zM43 6h2v1H43zM46 6h1v1H46zM48 6h3v1H48zM52 6h1v1H52zM4 7h1v1H4zM6 7h3v1H6zM10 7h1v1H10zM12 7h3v1H12zM16 7h3v1H16zM21 7h1v1H21zM23 7h1v1H23zM25 7h1v1H25zM28 7h1v1H28zM30 7h3v1H30zM34 7h3v1H34zM38 7h3v1H38zM43 7h1v1H43zM46 7h1v1H46zM48 7h3v1H48zM52 7h1v1H52zM4 8h1v1H4zM6 8h3v1H6zM10 8h1v1H10zM13 8h1v1H13zM15 8h2v1H15zM18 8h1v1H18zM20 8h3v1H20zM24 8h1v1H24zM26 8h6v1H26zM35 8h1v1H35zM40 8h2v1H40zM46 8h1v1H46zM48 8h3v1H48zM52 8h1v1H52zM4 9h1v1H4zM10 9h1v1H10zM13 9h2v1H13zM17 9h1v1H17zM21 9h1v1H21zM26 9h1v1H26zM30 9h2v1H30zM35 9h1v1H35zM39 9h1v1H39zM41 9h2v1H41zM46 9h1v1H46zM52 9h1v1H52zM4 10h7v1H4zM12 10h1v1H12zM14 10h1v1H14zM16 10h1v1H16zM18 10h1v1H18zM20 10h1v1H20zM22 10h1v1H22zM24 10h1v1H24zM26 10h1v1H26zM28 10h1v1H28zM30 10h1v1H30zM32 10h1v1H32zM34 10h1v1H34zM36 10h1v1H36zM38 10h1v1H38zM40 10h1v1H40zM42 10h1v1H42zM44 10h1v1H44zM46 10h7v1H46zM12 11h1v1H12zM15 11h1v1H15zM17 11h2v1H17zM21 11h2v1H21zM24 11h1v1H24zM26 11h1v1H26zM30 11h2v1H30zM33 11h7v1H33zM43 11h1v1H43zM4 12h1v1H4zM6 12h2v1H6zM9 12h3v1H9zM15 12h3v1H15zM19 12h1v1H19zM21 12h1v1H21zM26 12h9v1H26zM37 12h3v1H37zM41 12h1v1H41zM44 12h1v1H44zM46 12h1v1H46zM49 12h1v1H49zM51 12h2v1H51zM6 13h1v1H6zM8 13h2v1H8zM12 13h1v1H12zM14 13h2v1H14zM17 13h1v1H17zM20 13h1v1H20zM23 13h2v1H23zM26 13h7v1H26zM34 13h1v1H34zM37 13h1v1H37zM41 13h2v1H41zM44 13h2v1H44zM49 13h1v1H49zM51 13h2v1H51zM5 14h2v1H5zM10 14h1v1H10zM14 14h1v1H14zM20 14h3v1H20zM24 14h2v1H24zM27 14h1v1H27zM30 14h3v1H30zM36 14h2v1H36zM40 14h1v1H40zM42 14h1v1H42zM48 14h1v1H48zM51 14h2v1H51zM8 15h1v1H8zM13 15h1v1H13zM15 15h1v1H15zM17 15h1v1H17zM20 15h1v1H20zM23 15h2v1H23zM28 15h2v1H28zM35 15h1v1H35zM38 15h1v1H38zM40 15h1v1H40zM43 15h1v1H43zM51 15h2v1H51zM6 16h5v1H6zM12 16h1v1H12zM15 16h4v1H15zM22 16h1v1H22zM26 16h1v1H26zM28 16h2v1H28zM31 16h1v1H31zM33 16h2v1H33zM36 16h2v1H36zM41 16h3v1H41zM46 16h1v1H46zM48 16h1v1H48zM50 16h3v1H50zM4 17h1v1H4zM8 17h2v1H8zM11 17h2v1H11zM16 17h1v1H16zM18 17h3v1H18zM22 17h2v1H22zM25 17h2v1H25zM30 17h3v1H30zM34 17h2v1H34zM39 17h1v1H39zM42 17h1v1H42zM44 17h5v1H44zM51 17h1v1H51zM5 18h3v1H5zM10 18h3v1H10zM16 18h1v1H16zM23 18h2v1H23zM31 18h6v1H31zM38 18h1v1H38zM41 18h1v1H41zM44 18h2v1H44zM47 18h2v1H47zM50 18h1v1H50zM5 19h1v1H5zM7 19h1v1H7zM9 19h1v1H9zM11 19h5v1H11zM17 19h1v1H17zM21 19h1v1H21zM23 19h2v1H23zM26 19h4v1H26zM31 19h1v1H31zM33 19h1v1H33zM38 19h1v1H38zM40 19h1v1H40zM43 19h2v1H43zM46 19h3v1H46zM50 19h1v1H50zM52 19h1v1H52zM4 20h2v1H4zM7 20h2v1H7zM10 20h1v1H10zM12 20h3v1H12zM16 20h2v1H16zM19 20h1v1H19zM21 20h1v1H21zM23 20h1v1H23zM28 20h8v1H28zM38 20h2v1H38zM42 20h1v1H42zM45 20h1v1H45zM47 20h1v1H47zM49 20h1v1H49zM51 20h1v1H51zM4 21h1v1H4zM6 21h2v1H6zM9 21h1v1H9zM12 21h3v1H12zM16 21h3v1H16zM20 21h2v1H20zM23 21h5v1H23zM29 21h2v1H29zM33 21h5v1H33zM39 21h1v1H39zM42 21h1v1H42zM44 21h2v1H44zM47 21h2v1H47zM50 21h1v1H50zM5 22h1v1H5zM10 22h6v1H10zM20 22h1v1H20zM23 22h1v1H23zM25 22h1v1H25zM27 22h2v1H27zM32 22h1v1H32zM34 22h4v1H34zM39 22h3v1H39zM43 22h1v1H43zM50 22h2v1H50zM4 23h2v1H4zM12 23h1v1H12zM14 23h1v1H14zM16 23h1v1H16zM18 23h1v1H18zM21 23h4v1H21zM27 23h1v1H27zM29 23h1v1H29zM32 23h1v1H32zM34 23h1v1H34zM36 23h1v1H36zM39 23h1v1H39zM41 23h2v1H41zM45 23h4v1H45zM51 23h1v1H51zM5 24h1v1H5zM8 24h1v1H8zM10 24h1v1H10zM12 24h2v1H12zM16 24h3v1H16zM20 24h6v1H20zM27 24h6v1H27zM34 24h2v1H34zM38 24h4v1H38zM44 24h1v1H44zM46 24h1v1H46zM48 24h1v1H48zM51 24h1v1H51zM4 25h1v1H4zM6 25h4v1H6zM12 25h3v1H12zM18 25h3v1H18zM22 25h1v1H22zM24 25h4v1H24zM29 25h3v1H29zM34 25h2v1H34zM37 25h4v1H37zM42 25h2v1H42zM46 25h1v1H46zM49 25h1v1H49zM51 25h1v1H51zM4 26h1v1H4zM8 26h5v1H8zM14 26h1v1H14zM16 26h1v1H16zM18 26h2v1H18zM22 26h1v1H22zM26 26h5v1H26zM33 26h1v1H33zM36 26h2v1H36zM40 26h1v1H40zM44 26h6v1H44zM52 26h1v1H52zM6 27h3v1H6zM12 27h2v1H12zM16 27h1v1H16zM19 27h1v1H19zM24 27h1v1H24zM26 27h1v1H26zM30 27h1v1H30zM32 27h4v1H32zM39 27h2v1H39zM43 27h2v1H43zM48 27h3v1H48zM52 27h1v1H52zM6 28h3v1H6zM10 28h1v1H10zM12 28h1v1H12zM15 28h2v1H15zM18 28h3v1H18zM24 28h3v1H24zM28 28h1v1H28zM30 28h2v1H30zM37 28h2v1H37zM42 28h3v1H42zM46 28h1v1H46zM48 28h3v1H48zM52 28h1v1H52zM5 29h1v1H5zM8 29h1v1H8zM12 29h1v1H12zM14 29h2v1H14zM19 29h2v1H19zM23 29h2v1H23zM26 29h1v1H26zM30 29h2v1H30zM35 29h2v1H35zM40 29h5v1H40zM48 29h2v1H48zM5 30h10v1H5zM17 30h2v1H17zM20 30h5v1H20zM26 30h5v1H26zM32 30h1v1H32zM34 30h1v1H34zM36 30h1v1H36zM41 30h1v1H41zM44 30h5v1H44zM50 30h1v1H50zM52 30h1v1H52zM4 31h3v1H4zM11 31h2v1H11zM15 31h3v1H15zM19 31h3v1H19zM25 31h1v1H25zM27 31h2v1H27zM31 31h1v1H31zM34 31h1v1H34zM36 31h1v1H36zM41 31h7v1H41zM49 31h1v1H49zM52 31h1v1H52zM6 32h6v1H6zM14 32h1v1H14zM17 32h1v1H17zM19 32h1v1H19zM23 32h2v1H23zM27 32h1v1H27zM29 32h5v1H29zM37 32h3v1H37zM43 32h1v1H43zM47 32h2v1H47zM50 32h2v1H50zM4 33h3v1H4zM9 33h1v1H9zM11 33h2v1H11zM15 33h1v1H15zM17 33h1v1H17zM20 33h1v1H20zM23 33h1v1H23zM25 33h1v1H25zM27 33h2v1H27zM30 33h1v1H30zM36 33h1v1H36zM40 33h3v1H40zM44 33h1v1H44zM48 33h3v1H48zM4 34h2v1H4zM7 34h4v1H7zM15 34h1v1H15zM17 34h2v1H17zM20 34h1v1H20zM23 34h1v1H23zM25 34h1v1H25zM30 34h2v1H30zM34 34h1v1H34zM36 34h3v1H36zM40 34h2v1H40zM45 34h1v1H45zM49 34h1v1H49zM52 34h1v1H52zM4 35h2v1H4zM11 35h3v1H11zM16 35h4v1H16zM21 35h2v1H21zM24 35h1v1H24zM28 35h4v1H28zM33 35h1v1H33zM35 35h2v1H35zM39 35h2v1H39zM42 35h2v1H42zM47 35h1v1H47zM49 35h2v1H49zM6 36h1v1H6zM9 36h2v1H9zM14 36h4v1H14zM19 36h1v1H19zM21 36h2v1H21zM26 36h1v1H26zM29 36h1v1H29zM32 36h2v1H32zM35 36h1v1H35zM37 36h5v1H37zM44 36h1v1H44zM46 36h6v1H46zM6 37h1v1H6zM8 37h2v1H8zM11 37h2v1H11zM16 37h1v1H16zM18 37h1v1H18zM21 37h1v1H21zM24 37h3v1H24zM34 37h2v1H34zM37 37h1v1H37zM40 37h3v1H40zM47 37h2v1H47zM52 37h1v1H52zM4 38h1v1H4zM7 38h1v1H7zM10 38h2v1H10zM13 38h1v1H13zM15 38h1v1H15zM18 38h7v1H18zM27 38h1v1H27zM29 38h2v1H29zM36 38h2v1H36zM41 38h2v1H41zM46 38h3v1H46zM52 38h1v1H52zM6 39h3v1H6zM11 39h1v1H11zM13 39h3v1H13zM17 39h2v1H17zM20 39h1v1H20zM22 39h2v1H22zM28 39h1v1H28zM31 39h3v1H31zM36 39h3v1H36zM41 39h1v1H41zM44 39h3v1H44zM50 39h1v1H50zM4 40h1v1H4zM7 40h1v1H7zM9 40h4v1H9zM14 40h3v1H14zM18 40h1v1H18zM25 40h1v1H25zM28 40h1v1H28zM30 40h1v1H30zM33 40h3v1H33zM38 40h2v1H38zM42 40h3v1H42zM46 40h4v1H46zM4 41h3v1H4zM8 41h1v1H8zM11 41h1v1H11zM13 41h2v1H13zM17 41h4v1H17zM24 41h3v1H24zM28 41h1v1H28zM30 41h1v1H30zM34 41h1v1H34zM39 41h1v1H39zM42 41h1v1H42zM44 41h3v1H44zM48 41h1v1H48zM52 41h1v1H52zM5 42h1v1H5zM9 42h3v1H9zM15 42h4v1H15zM23 42h1v1H23zM25 42h1v1H25zM29 42h2v1H29zM32 42h1v1H32zM34 42h1v1H34zM36 42h1v1H36zM39 42h1v1H39zM43 42h1v1H43zM47 42h2v1H47zM5 43h3v1H5zM13 43h1v1H13zM15 43h2v1H15zM19 43h3v1H19zM25 43h2v1H25zM28 43h4v1H28zM36 43h1v1H36zM38 43h7v1H38zM47 43h4v1H47zM4 44h3v1H4zM10 44h1v1H10zM13 44h4v1H13zM18 44h1v1H18zM20 44h3v1H20zM26 44h5v1H26zM36 44h2v1H36zM40 44h1v1H40zM44 44h5v1H44zM50 44h1v1H50zM52 44h1v1H52zM12 45h1v1H12zM16 45h1v1H16zM18 45h7v1H18zM26 45h1v1H26zM30 45h1v1H30zM32 45h1v1H32zM35 45h1v1H35zM37 45h2v1H37zM44 45h1v1H44zM48 45h2v1H48zM4 46h7v1H4zM12 46h2v1H12zM15 46h1v1H15zM19 46h2v1H19zM22 46h5v1H22zM28 46h1v1H28zM30 46h3v1H30zM38 46h1v1H38zM42 46h3v1H42zM46 46h1v1H46zM48 46h3v1H48zM52 46h1v1H52zM4 47h1v1H4zM10 47h1v1H10zM12 47h1v1H12zM14 47h2v1H14zM21 47h1v1H21zM24 47h1v1H24zM26 47h1v1H26zM30 47h4v1H30zM37 47h1v1H37zM39 47h2v1H39zM42 47h1v1H42zM44 47h1v1H44zM48 47h2v1H48zM51 47h1v1H51zM4 48h1v1H4zM6 48h3v1H6zM10 48h1v1H10zM13 48h2v1H13zM16 48h1v1H16zM18 48h1v1H18zM20 48h1v1H20zM23 48h1v1H23zM25 48h6v1H25zM34 48h3v1H34zM41 48h1v1H41zM44 48h5v1H44zM50 48h1v1H50zM4 49h1v1H4zM6 49h3v1H6zM10 49h1v1H10zM12 49h3v1H12zM17 49h1v1H17zM19 49h1v1H19zM21 49h8v1H21zM32 49h1v1H32zM34 49h4v1H34zM39 49h1v1H39zM46 49h3v1H46zM52 49h1v1H52zM4 50h1v1H4zM6 50h3v1H6zM10 50h1v1H10zM12 50h1v1H12zM14 50h1v1H14zM16 50h1v1H16zM22 50h1v1H22zM25 50h1v1H25zM29 50h4v1H29zM38 50h1v1H38zM42 50h4v1H42zM48 50h1v1H48zM51 50h1v1H51zM4 51h1v1H4zM10 51h1v1H10zM18 51h1v1H18zM22 51h1v1H22zM24 51h6v1H24zM32 51h4v1H32zM37 51h1v1H37zM39 51h1v1H39zM44 51h6v1H44zM51 51h1v1H51zM4 52h7v1H4zM12 52h4v1H12zM17 52h1v1H17zM20 52h1v1H20zM23 52h1v1H23zM26 52h2v1H26zM29 52h1v1H29zM32 52h1v1H32zM35 52h5v1H35zM43 52h1v1H43zM48 52h1v1H48zM52 52h1v1H52z';

const methods = [
  { name: 'BRI', number: '219701005840539', tone: 'from-blue-500/30 to-white/5', icon: 'BRI' },
  { name: 'Dana', number: '088215689772', tone: 'from-sky-500/30 to-white/5', icon: 'D' },
  { name: 'Gopay', number: '0882007437216', tone: 'from-cyan-400/30 to-white/5', icon: 'G' }
];

type Props = { selectedAmount: number; status: string; onCreateTopup: () => void };

export function TopupPaymentMethods({ selectedAmount, status, onCreateTopup }: Props) {
  const [copied, setCopied] = useState('');

  async function copy(value: string, label: string) {
    await navigator.clipboard?.writeText(value).catch(() => null);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1600);
  }

  return (
    <section className="mt-5 rounded-[2rem] border border-[#dfff4f]/20 bg-white/[.07] p-4 ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Metode Pembayaran</p>
          <p className="mt-1 text-sm font-semibold text-white/55">Transfer sesuai nominal topup lalu tunggu approve admin.</p>
        </div>
        <div className="rounded-full bg-[#dfff4f] px-4 py-2 text-sm font-black text-slate-950">{selectedAmount.toLocaleString('id-ID')}</div>
      </div>

      <div className="mt-4 grid gap-3">
        {methods.map((method) => (
          <article key={method.name} className={`group rounded-[1.45rem] border border-white/10 bg-gradient-to-r ${method.tone} p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#dfff4f]/40`}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(223,255,79,.12)]">{method.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white">{method.name}</p>
                <p className="break-all text-sm font-semibold text-white/65">{method.number}</p>
                <p className="mt-1 text-xs font-black text-[#dfff4f]">● Instan · Manual approval</p>
              </div>
              <button onClick={() => copy(method.number, method.name)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-[#dfff4f] ring-1 ring-white/10 transition group-hover:bg-[#dfff4f] group-hover:text-slate-950">{copied === method.name ? 'Tersalin' : 'Salin'}</button>
            </div>
          </article>
        ))}
      </div>

      <article className="mt-4 overflow-hidden rounded-[1.8rem] border border-[#dfff4f]/45 bg-slate-950 p-4 shadow-[0_0_55px_rgba(223,255,79,.12)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#dfff4f]">QRIS TOKOBOT</p>
            <h3 className="mt-1 text-2xl font-black text-white">Scan semua bank & e-wallet</h3>
          </div>
          <span className="rounded-full bg-[#dfff4f] px-3 py-2 text-xs font-black text-slate-950">Disarankan</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[.85fr_1.15fr]">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
            <p className="text-lg font-black text-[#dfff4f]">Cara bayar</p>
            <ol className="mt-3 space-y-2 text-sm font-semibold leading-6 text-white/65">
              <li>1. Buka mobile banking / e-wallet.</li>
              <li>2. Pilih scan QRIS.</li>
              <li>3. Masukkan nominal sesuai topup.</li>
              <li>4. Buat topup pending lalu tunggu approve admin.</li>
            </ol>
          </div>
          <div className="relative rounded-[1.6rem] bg-white p-4 shadow-[0_0_40px_rgba(223,255,79,.18)]">
            <div className="absolute -inset-1 rounded-[1.75rem] border border-[#dfff4f]/60" />
            <div className="relative text-center">
              <p className="text-sm font-black text-slate-950">TOKOBOT</p>
              <p className="text-xs font-bold text-slate-500">NMID: ID1025431784608 · A01</p>
              <svg viewBox="0 0 57 57" className="mx-auto mt-3 h-56 w-56 max-w-full rounded-[1rem] bg-white p-2" shapeRendering="crispEdges" aria-label="QRIS TOKOBOT">
                <path d={qrisPath} fill="#000" />
              </svg>
              <p className="mt-2 text-xs font-black text-slate-950">SATU QRIS UNTUK SEMUA</p>
            </div>
          </div>
        </div>
        <button onClick={onCreateTopup} className="mt-5 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-sm transition hover:-translate-y-1">Buat Topup Pending</button>
        <p className="mt-3 text-sm font-semibold leading-6 text-white/55">{status}</p>
      </article>
    </section>
  );
}
