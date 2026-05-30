import { useEffect, useState } from 'react';

const videos = [
  ['https://cdn.imageurlgenerator.com/uploads/216ff627-b7ab-4e36-a2cf-feeaba760057.mp4', 'New Campaign', 'DLAVIE tampil lebih hidup.', 'Banner baru ini menjadi opening motion utama di Home: lebih premium, lebih cepat terasa, dan cocok untuk first impression.'],
  ['https://cdn.imageurlgenerator.com/uploads/a6e6e07f-ef29-48da-9215-1b3e43fc693c.mp4', 'Brand Pulse', 'Visual branding yang mengarahkan aksi.', 'Dipakai untuk mendorong user masuk ke Produk, Wallet, dan Reward tanpa membuat halaman terasa seperti iklan tempelan.'],
  ['https://www.image2url.com/r2/default/videos/1779509106851-6f4db364-ba40-4dd7-bc92-0dfd2915ade7.mov', 'Brand Motion', 'DLAVIE dalam gerakan.', 'Motion lama tetap dipakai sebagai variasi brand agar carousel terasa kaya dan tidak monoton.'],
  ['https://www.image2url.com/r2/default/videos/1779509286662-28aaf25c-8625-4218-a6a9-7666634cad7b.mp4', 'Digital Pay', 'Transaksi lebih mudah dibaca.', 'Motion card ini menjadi pusat visual untuk topup, produk digital, wallet, dan reward.'],
  ['https://www.image2url.com/r2/default/videos/1779509317283-97ddb2ba-e2c3-42fa-869f-55d3c98ea3c3.mp4', 'Reward Flow', 'Promo dan benefit terlihat jelas.', 'Cocok untuk highlight VIP, D-Points, referral, dan fitur baru tanpa membuat halaman terasa ramai.']
] as const;

export function DlavieBrandMotion() {
  const [active, setActive] = useState(0);
  const item = videos[active];

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % videos.length), 8200);
    return () => window.clearInterval(timer);
  }, []);

  return <section className="relative my-5 overflow-hidden rounded-[2.35rem] border border-white/70 bg-white/48 p-3 shadow-[0_30px_90px_rgba(65,78,74,.16)] backdrop-blur-2xl md:p-4">
    <style dangerouslySetInnerHTML={{__html: `.brand-motion-shell:before{content:'';position:absolute;inset:-2px;border-radius:inherit;padding:2px;background:conic-gradient(from 0deg,transparent,rgba(69,213,255,.62),rgba(82,39,255,.65),rgba(223,255,79,.95),rgba(231,40,255,.55),transparent 52%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:brandSpin 14s linear infinite;pointer-events:none}.brand-orb{animation:brandOrb 9s ease-in-out infinite alternate}.brand-progress span{animation:brandProgress 8.2s linear infinite}.motion-chip{box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 18px 45px rgba(0,0,0,.24)}@keyframes brandSpin{to{transform:rotate(360deg)}}@keyframes brandOrb{from{transform:translate3d(-18px,-6px,0) scale(.95)}to{transform:translate3d(24px,14px,0) scale(1.08)}}@keyframes brandProgress{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}} />
    <div className="brand-motion-shell relative overflow-hidden rounded-[2rem] bg-slate-950 text-white">
      <div className="brand-orb absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#45d5ff]/35 blur-3xl" />
      <div className="brand-orb absolute right-10 top-20 h-52 w-52 rounded-full bg-[#5227ff]/26 blur-3xl" />
      <div className="brand-orb absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#dfff4f]/22 blur-3xl" />
      <div className="grid gap-0 lg:grid-cols-[1.22fr_.78fr]">
        <div className="relative min-h-[20rem] overflow-hidden md:min-h-[27rem]">
          {videos.map((video, index) => <video key={video[0]} className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${index === active ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.035]'}`} src={video[0]} autoPlay muted loop playsInline preload="metadata" />)}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/76 via-slate-950/18 to-slate-950/5" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/44 to-transparent" />
          <div className="motion-chip absolute left-4 top-4 rounded-full bg-white/14 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f] ring-1 ring-white/15 backdrop-blur-xl">{item[1]}</div>
          <div className="absolute bottom-4 left-4 right-4 max-w-2xl md:bottom-6 md:left-6"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">DLAVIE Motion Stage</p><h2 className="mt-2 text-3xl font-black leading-[.95] tracking-tight md:text-6xl">{item[2]}</h2><p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/62 md:text-base">{item[3]}</p></div>
        </div>
        <aside className="relative flex flex-col justify-between gap-5 border-t border-white/10 p-4 md:p-6 lg:border-l lg:border-t-0">
          <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Creative placement</p><h3 className="mt-2 text-2xl font-black leading-tight tracking-tight">Banner baru jadi pembuka Home, bukan sekadar tempelan.</h3><p className="mt-3 text-sm font-semibold leading-6 text-white/50">Dua video terbaru diprioritaskan sebagai slide awal, lalu disambung banner lama untuk menjaga ritme visual DLAVIE tetap kaya.</p></div>
          <div className="grid gap-2"><a href="/products" className="rounded-full bg-[#dfff4f] px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:-translate-y-1">Buka Produk</a><a href="/wallet" className="rounded-full bg-white/12 px-4 py-3 text-center text-sm font-black ring-1 ring-white/10 transition hover:-translate-y-1">Isi Wallet</a><a href="/rewards" className="rounded-full bg-white/12 px-4 py-3 text-center text-sm font-black ring-1 ring-white/10 transition hover:-translate-y-1">Reward</a></div>
          <div className="rounded-[1.35rem] bg-white/10 p-3 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Motion playlist</p><div className="flex gap-1.5">{videos.map((_, index) => <button key={index} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition-all ${index === active ? 'w-8 bg-[#dfff4f]' : 'w-2.5 bg-white/25 hover:bg-white/55'}`} aria-label={`Open brand banner ${index + 1}`} />)}</div></div><div className="brand-progress mt-3 h-1 overflow-hidden rounded-full bg-white/10"><span key={active} className="block h-full w-full rounded-full bg-[#dfff4f]" /></div></div>
        </aside>
      </div>
    </div>
  </section>;
}
