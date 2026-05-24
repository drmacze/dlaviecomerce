import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

type PpobProduct = {
  code: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  status: 'available' | 'offline';
  source: 'vipayment' | 'demo';
};

const services = [
  { key: 'pulsa', label: 'Pulsa', note: 'Isi nomor HP', href: '/products?type=pulsa', tone: '#dfff4f', path: 'M7 4h10v16H7z M10 7h4 M11 17h2' },
  { key: 'data', label: 'Paket Data', note: 'Internet harian', href: '/products?type=data', tone: '#45d5ff', path: 'M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16z M4 12h16 M12 4c2 2 3 5 3 8s-1 6-3 8 M12 4c-2 2-3 5-3 8s1 6 3 8' },
  { key: 'pln', label: 'Token PLN', note: 'Listrik prabayar', href: '/products?type=pln', tone: '#f8ffbd', path: 'M13 2 4 14h7l-1 8 10-13h-7z' },
  { key: 'game', label: 'Game', note: 'Top up game', href: '/products?type=game', tone: '#b497cf', path: 'M7 13h3 M8.5 11.5v3 M15 12h.01 M17 14h.01 M6 8h12a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3l-2-2H8l-2 2a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z' },
  { key: 'voucher', label: 'Voucher', note: 'Kode digital', href: '/products?type=voucher', tone: '#e728ff', path: 'M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z M9 9v6 M15 9v6' },
  { key: 'wallet', label: 'E-Wallet', note: 'Saldo digital', href: '/products?type=wallet', tone: '#7cff67', path: 'M4 7h16v12H4z M16 12h4 M7 7V5h10v2' }
];

const flow = [
  ['1', 'Pilih produk', 'Buka kategori layanan yang kamu butuhkan.'],
  ['2', 'Isi data', 'Nomor HP, ID game, meter PLN, atau detail lain.'],
  ['3', 'Bayar', 'Gunakan D-Balance agar proses lebih cepat.'],
  ['4', 'Cek status', 'Order tersimpan dan bisa dipantau dari halaman Orders.']
] as const;

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function ProductIcon({ path }: { path: string }) {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
}

export default function ProductsPage() {
  const router = useRouter();
  const selectedType = typeof router.query.type === 'string' ? router.query.type : '';
  const selectedService = services.find((service) => service.key === selectedType);
  const [stepIndex, setStepIndex] = useState(0);
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('menu');

  useEffect(() => {
    const timer = window.setInterval(() => setStepIndex((value) => (value + 1) % flow.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!selectedType) {
        setProducts([]);
        setSource('menu');
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/bot/ppob/products?type=${encodeURIComponent(selectedType)}`);
        const json = await response.json();
        if (!alive) return;
        setProducts(Array.isArray(json.products) ? json.products : []);
        setSource(json.source || 'demo');
      } catch {
        if (!alive) return;
        setProducts([]);
        setSource('error');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [selectedType]);

  const currentStep = flow[stepIndex];
  const title = selectedService ? `${selectedService.label} DLAVIE` : 'Satu menu untuk semua layanan digital.';
  const subtitle = selectedService ? `Pilih produk ${selectedService.label.toLowerCase()} yang ingin kamu beli. Daftar ini akan mengambil data PPOB/VIPayment jika kredensial tersedia.` : 'Produk di DLAVIE berarti semua kebutuhan digital: pulsa, data, PLN, game, voucher, wallet, order, dan reward. Tidak dipisah-pisah agar user tidak bingung.';
  const categoryTone = selectedService?.tone || '#dfff4f';
  const statusText = useMemo(() => {
    if (!selectedType) return 'Menu produk';
    if (loading) return 'Memuat produk...';
    if (source === 'vipayment') return 'Data VIPayment';
    if (source === 'demo') return 'Demo fallback';
    return 'Belum tersedia';
  }, [selectedType, loading, source]);

  return <main className="dlavie-system-page px-4 py-6 md:px-8">
    <div className="dlavie-mesh" />
    <section className="dlavie-mica dlavie-ring mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-5 md:p-8">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
        <article className="dlavie-wave-card relative overflow-hidden rounded-[2.1rem] bg-white/62 p-5 ring-1 ring-black/5 md:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#5227ff]/20 blur-3xl dlavie-float-orb" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-[#45d5ff]/24 blur-3xl" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">DLAVIE PRODUK</p>
          <h1 className="relative mt-3 max-w-3xl text-4xl font-black leading-[.95] tracking-[-.045em] md:text-6xl">{title}</h1>
          <p className="relative mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">{subtitle}</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            {selectedType && <a className="dlavie-lime-btn rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-1" href="/products">← Semua produk</a>}
            <a className="dlavie-primary-btn rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-1" href="/wallet">Isi D-Balance</a>
            <a className="rounded-full bg-white/70 px-5 py-3 text-sm font-black text-slate-950 ring-1 ring-black/5 backdrop-blur transition hover:-translate-y-1" href="/orders">Cek Orders</a>
          </div>
        </article>

        <aside className="dlavie-mica relative overflow-hidden rounded-[2.1rem] p-4">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#e728ff]/18 blur-3xl dlavie-float-orb" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Cara transaksi</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">{currentStep[1]}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{currentStep[2]}</p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-950 text-lg font-black text-[#dfff4f]">{currentStep[0]}</span>
          </div>
          <div className="mt-5 flex gap-2">
            {flow.map((_, index) => <button key={index} onClick={() => setStepIndex(index)} className={`h-2.5 rounded-full transition-all ${index === stepIndex ? 'w-10 bg-slate-950' : 'w-2.5 bg-slate-300'}`} aria-label={`Step ${index + 1}`} />)}
          </div>
          <div className="dlavie-progress-line mt-4 h-1 overflow-hidden rounded-full bg-slate-200"><span key={stepIndex} className="block h-full w-full rounded-full bg-[#5227ff]" /></div>
        </aside>
      </div>

      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{selectedType ? 'Daftar produk' : 'Menu layanan'}</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">{selectedService ? selectedService.label : 'Pilih produk digital'}</h2>
          </div>
          <div className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm ring-1 ring-black/5">{statusText}</div>
        </div>

        {!selectedType ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => <a key={service.label} href={service.href} style={{ '--tone': service.tone } as React.CSSProperties} className="dlavie-service-glow dlavie-lift group rounded-[1.55rem] bg-white/68 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[1.15rem] bg-white shadow-sm ring-1 ring-black/5 transition group-hover:-translate-y-1"><ProductIcon path={service.path} /></span>
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">Open</span>
            </div>
            <p className="mt-5 text-xl font-black">{service.label}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{service.note}</p>
          </a>)}
        </div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-[1.55rem] bg-white/55 ring-1 ring-black/5" />) : products.map((product) => <article key={product.code} style={{ '--tone': categoryTone } as React.CSSProperties} className="dlavie-service-glow dlavie-lift rounded-[1.55rem] bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[1.15rem] bg-white shadow-sm ring-1 ring-black/5"><ProductIcon path={selectedService?.path || services[0].path} /></div>
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${product.status === 'available' ? 'bg-slate-950 text-white' : 'bg-red-100 text-red-700'}`}>{product.status}</span>
            </div>
            <p className="mt-5 text-lg font-black leading-tight">{product.name}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{product.brand || product.category} · {product.code}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xl font-black">{rupiah(product.price)}</p>
              <button className="rounded-full bg-[#dfff4f] px-4 py-2 text-xs font-black text-slate-950 shadow-sm transition hover:-translate-y-1">Pilih</button>
            </div>
          </article>)}
          {!loading && !products.length && <div className="dlavie-mica rounded-[1.55rem] p-6 font-bold text-slate-500 sm:col-span-2 lg:col-span-3"><p className="text-2xl font-black text-slate-950">Produk belum tersedia.</p><p className="mt-2">Kategori ini belum mengembalikan data. Cek kredensial VIPayment atau kategori layanan.</p></div>}
        </div>}
      </section>
    </section>
  </main>;
}
