import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type PpobProduct = { code: string; name: string; category: string; brand?: string; price: number; status: 'available' | 'offline'; source: 'database' | 'vipayment' | 'demo' };
type OrderResult = { orderNumber?: string; message?: string } | null;

const services = [
  { key: 'pulsa', label: 'Pulsa', note: 'Isi ulang nomor HP', href: '/products?type=pulsa' },
  { key: 'data', label: 'Paket Data', note: 'Internet harian/bulanan', href: '/products?type=data' },
  { key: 'pln', label: 'Token PLN', note: 'Listrik prabayar', href: '/products?type=pln' },
  { key: 'game', label: 'Game', note: 'Top up ID game', href: '/products?type=game' },
  { key: 'voucher', label: 'Voucher', note: 'Kode digital', href: '/products?type=voucher' },
  { key: 'wallet', label: 'E-Wallet', note: 'Saldo digital', href: '/products?type=wallet' }
];

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function targetLabel(type: string) {
  if (type === 'pln') return 'Nomor meter / ID pelanggan';
  if (type === 'game') return 'User ID / server game';
  if (type === 'wallet') return 'Nomor e-wallet';
  return 'Nomor HP tujuan';
}

function targetPlaceholder(type: string) {
  if (type === 'pln') return 'Contoh: 12345678901';
  if (type === 'game') return 'Contoh: 12345678(1234)';
  return 'Contoh: 081234567890';
}

function normalizeTarget(type: string, value: string) {
  const compact = value.replace(/\s+/g, '');
  if (type === 'game') return compact.replace(/[^0-9()]/g, '').slice(0, 32);
  return compact.replace(/\D/g, '').slice(0, type === 'pln' ? 13 : 15);
}

function targetError(type: string, value: string) {
  if (!value) return `${targetLabel(type)} wajib diisi.`;
  if (type === 'game') return /^[0-9]{4,18}(\([0-9]{2,8}\))?$/.test(value) ? '' : 'Format ID game belum valid. Contoh: 12345678(1234).';
  if (type === 'pln') return /^[0-9]{11,13}$/.test(value) ? '' : 'Nomor PLN harus 11-13 digit angka.';
  return /^08[0-9]{8,13}$/.test(value) ? '' : 'Nomor tujuan harus diawali 08 dan berisi 10-15 digit.';
}

function statusText(selectedType: string, loading: boolean, source: string) {
  if (!selectedType) return 'Pilih kategori';
  if (loading) return 'Memuat produk';
  if (source === 'database') return 'Database aktif';
  if (source === 'vipayment') return 'VIPayment aktif';
  if (source === 'demo') return 'Demo fallback';
  return 'Belum tersedia';
}

export function DlavieProductsRedesign() {
  const router = useRouter();
  const selectedType = typeof router.query.type === 'string' ? router.query.type : '';
  const selectedService = services.find((service) => service.key === selectedType);
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('menu');
  const [selectedProduct, setSelectedProduct] = useState<PpobProduct | null>(null);
  const [target, setTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult>(null);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!selectedType) {
        setProducts([]);
        setSource('menu');
        return;
      }
      setLoading(true);
      setSelectedProduct(null);
      setTarget('');
      setOrderResult(null);
      setOrderError('');
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

  async function submitOrder() {
    if (!selectedProduct) return;
    setOrderResult(null);
    setOrderError('');
    const cleanTarget = normalizeTarget(selectedType, target);
    const validationError = targetError(selectedType, cleanTarget);
    if (validationError) {
      setTarget(cleanTarget);
      setOrderError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) {
        setOrderError('Login diperlukan sebelum membuat order. Buka Dashboard atau Login ulang.');
        return;
      }
      const response = await fetch('/api/bot/ppob/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: selectedType || selectedProduct.category, productCode: selectedProduct.code, productName: selectedProduct.name, price: selectedProduct.price, target: cleanTarget })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setOrderError(json.error || 'Order gagal dibuat. Coba ulangi beberapa saat lagi.');
        return;
      }
      setOrderResult({ orderNumber: json.orderNumber || json.order?.order_number || json.order?.ref_id, message: json.message || 'Order berhasil dibuat.' });
    } catch {
      setOrderError('Koneksi gagal saat membuat order. Coba ulangi.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalAvailable = useMemo(() => products.filter((product) => product.status === 'available').length, [products]);
  const title = selectedService ? selectedService.label : 'Pilih layanan digital';
  const subtitle = selectedService ? `Pilih nominal/produk ${selectedService.label.toLowerCase()}, isi tujuan, lalu buat order.` : 'Mulai dari kategori layanan. DLAVIE akan menampilkan produk yang tersedia dan memandu langkah pembelian.';

  return (
    <main className="dlavie-system-page min-h-screen px-3 pb-36 pt-4 text-white md:px-6 md:pt-6">
      <div className="dlavie-mesh" />
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="dlv-reveal rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,.34)] backdrop-blur-2xl md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/36">DLAVIE PRODUCTS</p>
              <h1 className="mt-2 text-3xl font-semibold leading-none tracking-[-.06em] md:text-5xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/48">{subtitle}</p>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-950">{statusText(selectedType, loading, source)}</span>
          </div>
        </header>

        <section className="dlv-reveal grid grid-cols-3 gap-2">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">Kategori</p><p className="mt-2 text-xl font-semibold text-white">{selectedType ? '1' : services.length}</p><p className="mt-1 text-xs text-white/36">{selectedType ? selectedService?.label : 'Tersedia'}</p></div>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">Produk</p><p className="mt-2 text-xl font-semibold text-white">{products.length}</p><p className="mt-1 text-xs text-white/36">Loaded</p></div>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">Ready</p><p className="mt-2 text-xl font-semibold text-white">{totalAvailable}</p><p className="mt-1 text-xs text-white/36">Available</p></div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="dlv-reveal rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-2xl md:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">Kategori layanan</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {services.map((service) => (
                <a key={service.key} href={service.href} className={`rounded-[1.15rem] p-4 text-sm font-semibold transition hover:-translate-y-1 ${selectedType === service.key ? 'bg-[#bcff6a] text-slate-950' : 'border border-white/10 bg-white/[0.045] text-white/72 hover:bg-white/[0.08]'}`}>
                  {service.label}<span className="mt-1 block text-[11px] font-medium opacity-60">{service.note}</span>
                </a>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href="/wallet" className="rounded-[1.1rem] bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950">Isi Wallet</a>
              <a href="/orders" className="rounded-[1.1rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-sm font-semibold text-white/72">Cek Orders</a>
            </div>
          </aside>

          <section className="dlv-reveal rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-2xl md:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">{selectedType ? 'Daftar produk' : 'Mulai dari kategori'}</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.04em] text-white">{selectedService ? selectedService.label : 'Pilih layanan'}</h2></div>
              {selectedType && <a href="/products" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70">Reset</a>}
            </div>

            {!selectedType ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm font-medium leading-6 text-white/50">Pilih kategori di sebelah kiri. Setelah kategori dipilih, produk yang tersedia akan tampil di sini.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-[1.35rem] bg-white/[0.055]" />) : products.map((product) => (
                  <article key={product.code} className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-950">{product.status}</span><p className="text-right text-sm font-semibold text-white">{rupiah(product.price)}</p></div>
                    <p className="mt-4 line-clamp-2 text-base font-semibold leading-tight text-white">{product.name}</p>
                    <p className="mt-2 truncate text-xs font-medium text-white/38">{product.brand || product.category} · {product.code}</p>
                    <button onClick={() => { setSelectedProduct(product); setTarget(''); setOrderResult(null); setOrderError(''); }} disabled={product.status !== 'available'} className="mt-4 w-full rounded-[1.05rem] bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30">Pilih Produk</button>
                  </article>
                ))}
                {!loading && !products.length && <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm font-medium leading-6 text-white/48 sm:col-span-2 xl:col-span-3">Produk belum tersedia untuk kategori ini.</div>}
              </div>
            )}
          </section>
        </section>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-black/62 p-3 backdrop-blur-xl md:place-items-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#111214] p-4 shadow-[0_34px_120px_rgba(0,0,0,.62)] md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">Konfirmasi produk</p><h3 className="mt-1 text-2xl font-semibold tracking-[-.04em] text-white">{selectedProduct.name}</h3><p className="mt-1 text-sm font-medium text-white/42">{selectedProduct.brand || selectedProduct.category} · {selectedProduct.code}</p></div>
              <button onClick={() => setSelectedProduct(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-lg font-semibold text-white/60">×</button>
            </div>
            <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-black/30 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">Total bayar</p><p className="mt-1 text-3xl font-semibold tracking-[-.05em] text-white">{rupiah(selectedProduct.price)}</p><p className="mt-1 text-xs font-medium text-white/38">Order PPOB akan diproses setelah data tujuan valid.</p></div>
            <label className="mt-4 block"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">{targetLabel(selectedType)}</span><input value={target} onChange={(event) => { setTarget(normalizeTarget(selectedType, event.target.value)); setOrderError(''); }} inputMode={selectedType === 'game' ? 'text' : 'numeric'} autoComplete="off" maxLength={selectedType === 'game' ? 32 : selectedType === 'pln' ? 13 : 15} placeholder={targetPlaceholder(selectedType)} className="mt-2 w-full rounded-[1.15rem] border border-white/10 bg-white/[0.055] px-4 py-4 text-base font-semibold text-white outline-none placeholder:text-white/28 focus:border-white/25" /></label>
            {orderError && <div className="mt-3 rounded-[1.15rem] border border-red-400/20 bg-red-500/12 px-4 py-3 text-sm font-semibold text-red-100">{orderError}</div>}
            {orderResult && <div className="mt-3 rounded-[1.15rem] bg-[#bcff6a] px-4 py-3 text-sm font-semibold text-slate-950"><p>Order dibuat: {orderResult.orderNumber}</p><p className="mt-1 text-xs text-slate-700">{orderResult.message}</p></div>}
            <div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={submitOrder} disabled={submitting} className="rounded-[1.15rem] bg-white px-5 py-4 text-sm font-semibold text-slate-950 disabled:opacity-60">{submitting ? 'Memproses...' : 'Buat Order'}</button><a href="/orders" className="rounded-[1.15rem] border border-white/10 bg-white/[0.055] px-5 py-4 text-center text-sm font-semibold text-white/72">Lihat Orders</a></div>
          </div>
        </div>
      )}
    </main>
  );
}
