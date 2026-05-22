import { useEffect, useState } from 'react';
import { SecretLogoGate } from '@/components/secret-logo-gate';

const services = ['Pulsa', 'Data', 'PLN', 'Game', 'Voucher', 'Wallet', 'Order', 'Reward'];
const links = ['/products?type=pulsa','/products?type=data','/products?type=pln','/products?type=game','/products?type=voucher','/wallet','/orders','/rewards'];
const slides = [
  ['Transaksi cepat', 'Pilih layanan, bayar, selesai.', 'Dlavie dibuat seperti app: layanan cepat di depan, saldo jelas, status order mudah dicek.'],
  ['Saldo aman', 'Top up otomatis atau manual dengan bukti.', 'Pembayaran otomatis dicek gateway. Manual topup wajib bukti agar tidak ada transaksi abu-abu.'],
  ['Riwayat rapi', 'Order dan reward tidak tenggelam.', 'Aktivitas wallet, order, dan reward dibuat ringkas supaya user tidak perlu menebak.']
];

export default function Home() {
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setActive(v => (v + 1) % slides.length), 6200); return () => clearInterval(t); }, []);
  const slide = slides[active];
  return <main className="min-h-screen overflow-hidden bg-[#020419] px-3 pb-24 pt-3 text-white">
    <style jsx global>{`
      body{background:#020419}.homefx:before{content:'';position:fixed;inset:0;z-index:-3;background:radial-gradient(circle at 14% 10%,rgba(42,123,255,.42),transparent 30rem),radial-gradient(circle at 84% 18%,rgba(230,46,255,.32),transparent 28rem),linear-gradient(145deg,#020419,#061849 52%,#18051f)}.homefx:after{content:'';position:fixed;left:-12vw;right:-12vw;bottom:14vh;height:18rem;z-index:-2;border-radius:100%;border-top:2px solid rgba(69,213,255,.78);box-shadow:0 -8px 34px rgba(69,213,255,.45),0 26px 70px rgba(231,40,255,.34);animation:wave 8s ease-in-out infinite alternate}.dots{position:fixed;inset:0;z-index:-1;opacity:.13;background-image:radial-gradient(circle,rgba(255,255,255,.8) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(circle at 50% 45%,black,transparent 78%)}.glass{border:1px solid rgba(255,255,255,.15);background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.055));box-shadow:0 28px 90px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(30px) saturate(155%)}.svc:hover{transform:translateY(-5px) scale(1.02);background:rgba(255,255,255,.14)}.btn{background:linear-gradient(135deg,#1473ff,#5227ff 48%,#e728ff);box-shadow:0 0 42px rgba(82,39,255,.36),0 18px 50px rgba(0,0,0,.28)}@keyframes wave{from{transform:translateX(-2rem) rotate(-4deg) scaleX(.98)}to{transform:translateX(2rem) rotate(-2deg) scaleX(1.05)}}
    `}</style>
    <div className="homefx"/><div className="dots"/>
    <nav className="glass sticky top-3 z-50 mx-auto flex max-w-7xl items-center justify-between rounded-[1.6rem] p-3">
      <div className="flex items-center gap-3"><SecretLogoGate/><div><p className="text-xl font-black">Dlavie</p><p className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-100/45">digital payment hub</p></div></div>
      <div className="hidden gap-2 md:flex"><a className="rounded-full bg-white/10 px-4 py-2 text-xs font-black" href="/products">Produk</a><a className="rounded-full bg-white/10 px-4 py-2 text-xs font-black" href="/wallet">Wallet</a><a className="rounded-full bg-white/10 px-4 py-2 text-xs font-black" href="/orders">Order</a></div>
      <a className="btn rounded-full px-4 py-2.5 text-xs font-black" href="/dashboard">Dashboard</a>
    </nav>
    <section className="mx-auto mt-4 grid max-w-7xl gap-4 lg:grid-cols-[1.05fr_.95fr]">
      <article className="glass relative min-h-[34rem] overflow-hidden rounded-[2.4rem] p-6 md:p-9">
        <div className="absolute -left-24 top-[44%] h-36 w-[44rem] rotate-[7deg] rounded-full border-t border-cyan-300/70 shadow-[0_-12px_38px_rgba(69,213,255,.32)]"/>
        <div className="absolute -right-28 top-[54%] h-36 w-[44rem] rotate-[-6deg] rounded-full border-t border-fuchsia-300/70 shadow-[0_-12px_38px_rgba(231,40,255,.28)]"/>
        <div className="relative z-10 flex min-h-[30rem] flex-col justify-between">
          <div><span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.24em] text-cyan-100">DLAVIE PAY</span><h1 className="mt-6 max-w-3xl text-5xl font-black leading-[.88] tracking-[-.07em] md:text-7xl">Bayar digital, tanpa tampilan ribet.</h1><p className="mt-5 max-w-xl text-base font-bold leading-8 text-white/58">Pulsa, paket data, token PLN, game, voucher, dan saldo dikumpulkan dalam satu tempat yang cepat dibaca.</p></div>
          <div className="rounded-[1.5rem] bg-white/[.075] p-4 ring-1 ring-white/10"><p className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-100/48">{slide[0]}</p><h2 className="mt-2 text-2xl font-black">{slide[1]}</h2><p className="mt-2 text-sm font-bold leading-6 text-white/50">{slide[2]}</p><div className="mt-4 flex items-center justify-between"><div className="flex gap-2">{slides.map((_,i)=><button key={i} onClick={()=>setActive(i)} className={`h-2.5 rounded-full ${i===active?'w-10 bg-white':'w-2.5 bg-white/30'}`}/>)}</div><a href="/products" className="btn rounded-full px-5 py-3 text-sm font-black">Mulai</a></div></div>
        </div>
      </article>
      <aside className="glass rounded-[2.3rem] p-4"><div className="rounded-[2rem] bg-white/[.055] p-4 ring-1 ring-white/10"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-white/35">Mini App</p><h2 className="mt-1 text-2xl font-black">Mau bayar apa?</h2></div><span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black text-white/55">LIVE</span></div><div className="mt-4 rounded-[1.5rem] bg-gradient-to-br from-cyan-300/15 to-fuchsia-400/10 p-4 ring-1 ring-white/10"><p className="text-[10px] font-black uppercase tracking-[.22em] text-white/35">D-Balance</p><p className="mt-2 text-4xl font-black">Rp 0</p><p className="mt-1 text-xs font-bold text-white/40">Login untuk sinkron saldo.</p></div><div className="mt-4 grid grid-cols-4 gap-2">{services.map((s,i)=><a key={s} href={links[i]} className="svc rounded-[1.15rem] bg-white/[.075] p-3 text-center ring-1 ring-white/10 transition"><span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M4 7h16M6 7v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M9 11h6"/></svg></span><b className="mt-2 block text-[11px]">{s}</b></a>)}</div></div></aside>
    </section>
  </main>;
}
