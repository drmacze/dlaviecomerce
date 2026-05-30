import { useEffect, useState } from "react";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const videos = [
  [
    "https://cdn.imageurlgenerator.com/uploads/216ff627-b7ab-4e36-a2cf-feeaba760057.mp4",
    "New Campaign",
    "Premium opening motion",
    "Pembuka home yang terasa seperti launch screen aplikasi commerce modern.",
  ],
  [
    "https://cdn.imageurlgenerator.com/uploads/a6e6e07f-ef29-48da-9215-1b3e43fc693c.mp4",
    "Brand Pulse",
    "Motion stage",
    "Mengantar user ke Produk, Wallet, dan Reward tanpa visual yang terasa seperti tempelan.",
  ],
  [
    "https://www.image2url.com/r2/default/videos/1779509286662-28aaf25c-8625-4218-a6a9-7666634cad7b.mp4",
    "Digital Pay",
    "Wallet flow",
    "Kartu motion untuk topup, PPOB, order tracking, dan reward.",
  ],
] as const;

export function DlavieBrandMotion() {
  const [active, setActive] = useState(0);
  const item = videos[active];

  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % videos.length),
      7600,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="dlv-glass-card dlv-scroll-reveal overflow-hidden rounded-[2.3rem] p-3 sm:p-4">
      <div className="grid overflow-hidden rounded-[1.9rem] bg-[#080805] lg:grid-cols-[1.2fr_.8fr]">
        <div className="relative min-h-[21rem] overflow-hidden sm:min-h-[30rem]">
          {videos.map((video, index) => (
            <video
              key={video[0]}
              className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${index === active ? "scale-100 opacity-100" : "scale-[1.035] opacity-0"}`}
              src={video[0]}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050504]/85 via-[#050504]/28 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050504] via-[#050504]/58 to-transparent" />

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#f4d675] backdrop-blur-xl sm:left-6 sm:top-6">
            <Play className="h-3.5 w-3.5" /> {item[1]}
          </div>

          <div className="absolute bottom-5 left-4 right-4 max-w-2xl sm:bottom-7 sm:left-7">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c3b49d]/58">
              DLAVIE motion stage
            </p>
            <h2 className="mt-2 text-4xl font-black leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl">
              {item[2]}
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-[#e5e4e2]/64 sm:text-base">
              {item[3]}
            </p>
          </div>
        </div>

        <aside className="relative flex flex-col justify-between gap-6 border-t border-white/10 p-5 sm:p-7 lg:border-l lg:border-t-0">
          <div>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c7a329]/18 text-[#f4d675] ring-1 ring-[#c7a329]/24">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c7a329]">
              Creative direction
            </p>
            <h3 className="mt-3 text-3xl font-black leading-[0.98] tracking-[-0.06em] text-white">
              Dark grocery feel, tapi untuk commerce digital DLAVIE.
            </h3>
            <p className="mt-4 text-sm font-semibold leading-7 text-[#c3b49d]/64">
              Layout dibuat mobile-first: hero besar, quick category, wallet
              card, product rail, dan CTA yang mudah disentuh.
            </p>
          </div>

          <div>
            <div className="mb-4 flex gap-2">
              {videos.map((video, index) => (
                <button
                  key={video[0]}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`h-2.5 rounded-full transition-all ${index === active ? "w-10 bg-[#c7a329]" : "w-2.5 bg-white/18 hover:bg-white/44"}`}
                  aria-label={`Open motion slide ${index + 1}`}
                />
              ))}
            </div>
            <a
              href="/products"
              className="dlv-gold-button dlv-magnetic inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] px-5 py-4 text-sm font-black transition hover:-translate-y-1"
            >
              Explore Produk <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
