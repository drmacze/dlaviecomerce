import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type PpobProduct = {
  id: string;
  sku_code: string;
  product_name: string;
  category: string;
  brand?: string | null;
  selling_price: number;
};

type UiCategory = {
  key: string;
  label: string;
  count: number;
  icon: string;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const normalize = (value?: string | null, fallback = 'Digital') => String(value || fallback).trim() || fallback;

function categoryIcon(category: string) {
  const text = category.toLowerCase();
  if (text.includes('game') || text.includes('stream')) return '🎮';
  if (text.includes('pln') || text.includes('listrik')) return '⚡';
  if (text.includes('data') || text.includes('internet') || text.includes('aigo') || text.includes('always')) return '📶';
  if (text.includes('pulsa')) return '📱';
  if (text.includes('voucher')) return '🎟️';
  if (text.includes('wallet') || text.includes('saldo')) return '💳';
  return '✨';
}

function targetPlaceholder(product?: PpobProduct | null) {
  const category = `${product?.category || ''} ${product?.brand || ''} ${product?.product_name || ''}`.toLowerCase();
  if (category.includes('game') || category.includes('free fire') || category.includes('mobile legends')) return 'Masukkan User ID / Server ID';
  if (category.includes('pln') || category.includes('token')) return 'Masukkan nomor meter / ID pelanggan PLN';
  return 'Masukkan nomor HP tujuan';
}

function categoryTitle(category: string) {
  const value = normalize(category);
  const text = value.toLowerCase();
  if (text.includes('aigo')) return 'Aigo / Axis Data';
  if (text.includes('always')) return 'AlwaysOn TRI';
  return value;
}

export default function PpobPage() {
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [status, setStatus] = useState('Menghubungkan katalog VIPayment...');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [selected, setSelected] = useState<PpobProduct | null>(null);
  const [target, setTarget] = useState('');
  const [token, setToken] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetch('/api/ppob-products')
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json.products) ? json.products : [];
        setProducts(list);
        setStatus(list.length ? 'Katalog live dari provider siap dipilih.' : 'Belum ada produk aktif. Coba refresh beberapa saat lagi.');
      })
      .catch(() => setStatus('Gagal memuat katalog. Cek koneksi lalu refresh halaman.'));

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token || '')).catch(() => setToken(''));
  }, []);

  const categories = useMemo<UiCategory[]>(() => {
    const counts = new Map<string, number>();
    products.forEach((item) => {
      const key = categoryTitle(item.category);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const dynamic = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ key: label, label, count, icon: categoryIcon(label) }));

    return [{ key: 'all', label: 'Semua', count: products.length, icon: '🌐' }, ...dynamic];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((item) => {
      if (activeCategory !== 'all' && categoryTitle(item.category) !== activeCategory) return;
      const brand = normalize(item.brand, 'Digital');
      if (brand) set.add(brand);
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))].slice(0, 18);
  }, [products, activeCategory]);

  useEffect(() => {
    setActiveBrand('all');
  }, [activeCategory]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return products.filter((item) => {
      const itemCategory = categoryTitle(item.category);
      const itemBrand = normalize(item.brand, 'Digital');
      const haystack = `${item.product_name} ${itemBrand} ${itemCategory} ${item.sku_code}`.toLowerCase();
      if (activeCategory !== 'all' && itemCategory !== activeCategory) return false;
      if (activeBrand !== 'all' && itemBrand !== activeBrand) return false;
      if (needle && !haystack.includes(needle)) return false;
      return true;
    });
  }, [products, query, activeCategory, activeBrand]);

  const featured = filtered.slice(0, 3);
  const priceRange = useMemo(() => {
    if (!filtered.length) return 'Rp 0';
    const prices = filtered.map((item) => Number(item.selling_price || 0)).filter(Boolean);
    if (!prices.length) return 'Rp 0';
    return `${rupiah(Math.min(...prices))} - ${rupiah(Math.max(...prices))}`;
  }, [filtered]);

  function openProduct(product: PpobProduct) {
    setSelected(product);
    setTarget('');
    setOrderStatus('');
  }

  function closeProduct() {
    setSelected(null);
    setTarget('');
    setOrderStatus('');
  }

  function manualMessage() {
    if (!selected) return '';
    return encodeURIComponent(`Halo admin Dlavie, saya ingin order PPOB:\n\nProduk: ${selected.product_name}\nKode: ${selected.sku_code}\nTujuan: ${target || '-'}\nHarga: ${rupiah(selected.selling_price)}\n\nMohon dibantu prosesnya.`);
  }

  async function submitOrder() {
    if (!selected || !target.trim()) return;

    if (!token) {
      setOrderStatus('Kamu belum login. Login untuk memakai D-Balance, atau pakai order manual dulu.');
      return;
    }

    setOrdering(true);
    setOrderStatus('Membuat order otomatis...');
    try {
      const res = await fetch('/api/ppob-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: selected.id, customer_no: target.trim() })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOrderStatus(json.error || 'Order otomatis belum bisa diproses. Kamu bisa lanjut manual dulu.');
        return;
      }
      setOrderStatus(`Order berhasil dibuat. Ref: ${json.order?.ref_id || '-'}. Cek halaman Orders/Wallet untuk status.`);
    } catch {
      setOrderStatus('Koneksi order gagal. Kamu bisa lanjut manual dulu.');
    } finally {
      setOrdering(false);
    }
  }

  return (
    <main className="ppob-shell min-h-screen overflow-hidden px-4 py-5 text-slate-950 md:px-8 md:py-8">
      <style jsx global>{`
        body{background:#eef5f0}.ppob-shell{position:relative;isolation:isolate;background:radial-gradient(circle at 10% 0%,rgba(223,255,79,.55),transparent 24rem),radial-gradient(circle at 92% 10%,rgba(117,179,229,.42),transparent 25rem),linear-gradient(145deg,#f7fbf2,#eef4f7 52%,#f9f9ec)}.ppob-shell:before{content:'';position:fixed;inset:-14%;z-index:-2;background:conic-gradient(from 140deg,rgba(223,255,79,.4),rgba(117,179,229,.34),rgba(255,214,163,.28),rgba(223,255,79,.42));filter:blur(76px);opacity:.72;animation:floatMesh 18s ease-in-out infinite alternate}.ppob-shell:after{content:'';position:fixed;inset:0;z-index:-1;opacity:.32;background-image:linear-gradient(rgba(15,23,42,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,.045) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(circle at 50% 20%,black,transparent 78%)}.glass{background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.52));border:1px solid rgba(15,23,42,.08);box-shadow:0 26px 80px rgba(65,78,74,.14),inset 0 1px 0 rgba(255,255,255,.9);backdrop-filter:blur(24px) saturate(145%)}.product-card{position:relative;overflow:hidden}.product-card:before{content:'';position:absolute;inset:-80px auto auto -80px;width:140px;height:140px;border-radius:999px;background:rgba(223,255,79,.42);filter:blur(24px);opacity:0;transition:.32s}.product-card:hover:before{opacity:1;transform:translate(18px,18px)}.product-card:after{content:'';position:absolute;inset:auto -22% -42% auto;width:72%;height:72%;border-radius:999px;background:linear-gradient(135deg,rgba(117,179,229,.26),rgba(223,255,79,.28));filter:blur(30px);opacity:.45;transition:.32s}.product-card:hover:after{opacity:.85;transform:scale(1.08)}.chip-scroll{scrollbar-width:none}.chip-scroll::-webkit-scrollbar{display:none}.orb{position:absolute;border-radius:999px;filter:blur(0);animation:orb 8s ease-in-out infinite alternate}.scan-line{position:absolute;inset:0;background:linear-gradient(120deg,transparent,rgba(255,255,255,.48),transparent);transform:translateX(-120%);animation:scan 4.8s ease-in-out infinite}.drawer-in{animation:drawerIn .22s ease-out}.pop-in{animation:popIn .32s ease-out both}@keyframes floatMesh{0%{transform:translate3d(-3%,-2%,0) rotate(0deg) scale(1)}100%{transform:translate3d(4%,3%,0) rotate(18deg) scale(1.06)}}@keyframes orb{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(12px,-18px,0) scale(1.09)}}@keyframes scan{0%,55%{transform:translateX(-120%)}100%{transform:translateX(120%)}}@keyframes drawerIn{from{transform:translateY(18px);opacity:.65}to{transform:translateY(0);opacity:1}}@keyframes popIn{from{transform:translateY(10px) scale(.98);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
      `}</style>

      <section className="mx-auto max-w-7xl">
        <div className="glass relative overflow-hidden rounded-[2.4rem] p-5 md:p-8">
          <span className="orb right-10 top-10 h-24 w-24 bg-[#dfff4f]/60" />
          <span className="orb bottom-10 left-8 h-16 w-16 bg-sky-300/50" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-950 px-4 py-2 text-[11px] font-black uppercase tracking-[.22em] text-[#dfff4f]">DLAVIE PPOB</span>
                <span className="rounded-full bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[.18em] text-slate-500 ring-1 ring-black/5">VIPayment Live</span>
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[.95] tracking-[-.04em] md:text-6xl">Topup digital dengan katalog yang hidup.</h1>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">Cari produk, filter kategori, pilih brand, lalu order dengan D-Balance. UI dibuat ringan di HP tapi tetap terasa premium dan interaktif.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.6rem] bg-slate-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Produk</p><p className="mt-2 text-3xl font-black text-[#dfff4f]">{products.length}</p></div>
              <div className="rounded-[1.6rem] bg-white/70 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Kategori</p><p className="mt-2 text-3xl font-black">{Math.max(categories.length - 1, 0)}</p></div>
              <div className="rounded-[1.6rem] bg-white/70 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Harga</p><p className="mt-2 text-xs font-black leading-5 text-slate-600">{priceRange}</p></div>
            </div>
          </div>
        </div>

        <div className="sticky top-3 z-30 mt-4">
          <div className="glass rounded-[2rem] p-3 md:p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-black/5">
                <div className="scan-line" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="relative z-10 w-full bg-transparent px-5 py-4 text-sm font-black outline-none placeholder:text-slate-400" placeholder="Cari Axis, Telkomsel, ML, FF, PLN, kode produk..." />
              </div>
              <a href="/wallet" className="grid place-items-center rounded-[1.4rem] bg-slate-950 px-5 py-4 text-sm font-black text-[#dfff4f] shadow-lg shadow-slate-950/10">Buka Wallet</a>
            </div>

            <div className="chip-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} className={`shrink-0 rounded-full px-4 py-3 text-xs font-black transition ${activeCategory === category.key ? 'bg-[#dfff4f] text-slate-950 shadow-lg shadow-lime-200/60' : 'bg-white/75 text-slate-500 ring-1 ring-black/5 hover:bg-white'}`}>
                  <span className="mr-1.5">{category.icon}</span>{category.label} <span className="ml-1 text-[10px] opacity-60">{category.count}</span>
                </button>
              ))}
            </div>

            {brands.length > 2 && (
              <div className="chip-scroll mt-2 flex gap-2 overflow-x-auto pb-1">
                {brands.map((brand) => (
                  <button key={brand} type="button" onClick={() => setActiveBrand(brand)} className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-black transition ${activeBrand === brand ? 'bg-slate-950 text-[#dfff4f]' : 'bg-slate-100 text-slate-500 hover:bg-white'}`}>
                    {brand === 'all' ? 'Semua Brand' : brand}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
          <aside className="grid gap-4 self-start lg:sticky lg:top-40">
            <div className="glass rounded-[2rem] p-5">
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-slate-400">Status katalog</p>
              <p className="mt-2 text-lg font-black">{status}</p>
              <p className="mt-2 text-sm font-bold text-slate-500">Menampilkan {filtered.length} dari {products.length} produk.</p>
            </div>
            {featured.length > 0 && (
              <div className="glass rounded-[2rem] p-5">
                <p className="text-[10px] font-black uppercase tracking-[.24em] text-slate-400">Pilihan cepat</p>
                <div className="mt-4 grid gap-2">
                  {featured.map((item) => (
                    <button key={item.id} type="button" onClick={() => openProduct(item)} className="rounded-[1.4rem] bg-white/75 p-3 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white">
                      <p className="line-clamp-1 text-sm font-black">{item.product_name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{rupiah(item.selling_price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product, index) => (
              <button key={product.id} type="button" onClick={() => openProduct(product)} className="product-card pop-in group rounded-[1.8rem] bg-white/80 p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-slate-300/40 focus:outline-none focus:ring-2 focus:ring-slate-950" style={{ animationDelay: `${Math.min(index, 12) * 24}ms` }}>
                <div className="relative z-10 flex min-h-[11rem] flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600">{categoryIcon(product.category)} {categoryTitle(product.category)}</span>
                      <span className="rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-black text-[#dfff4f]">{rupiah(product.selling_price)}</span>
                    </div>
                    <h3 className="mt-4 line-clamp-2 text-lg font-black leading-tight text-slate-950">{product.product_name}</h3>
                    <p className="mt-2 line-clamp-1 text-xs font-bold text-slate-400">{product.brand || 'Digital'} · {product.sku_code}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-black/5 pt-3">
                    <span className="text-xs font-black text-slate-500">Tap detail</span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dfff4f] text-sm font-black transition group-hover:rotate-12 group-hover:scale-110">→</span>
                  </div>
                </div>
              </button>
            ))}

            {!filtered.length && (
              <div className="glass col-span-full rounded-[2rem] p-8 text-center">
                <p className="text-4xl">🔎</p>
                <h2 className="mt-3 text-2xl font-black">Produk tidak ditemukan</h2>
                <p className="mt-2 text-sm font-bold text-slate-500">Coba ganti kata pencarian, kategori, atau brand.</p>
              </div>
            )}
          </section>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-md md:items-center md:justify-center">
          <section className="drawer-in w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl md:max-w-xl">
            <div className="relative overflow-hidden bg-slate-950 p-5 text-white md:p-6">
              <span className="orb right-6 top-6 h-20 w-20 bg-[#dfff4f]/40" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#dfff4f]">Detail Produk</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight">{selected.product_name}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-400">{categoryTitle(selected.category)} · {selected.brand || 'Digital'} · {selected.sku_code}</p>
                </div>
                <button type="button" onClick={closeProduct} className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/10">Tutup</button>
              </div>
              <div className="relative z-10 mt-5 rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-xs font-bold text-slate-400">Total Bayar</p>
                <p className="mt-1 text-4xl font-black text-[#dfff4f]">{rupiah(selected.selling_price)}</p>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <label className="block text-sm font-black text-slate-700">Nomor tujuan / User ID</label>
              <input value={target} onChange={(event) => setTarget(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-4 text-base font-bold outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-950" placeholder={targetPlaceholder(selected)} />

              <div className="mt-4 rounded-2xl bg-lime-50 p-4 ring-1 ring-lime-200">
                <p className="text-xs font-black uppercase tracking-[.16em] text-lime-700">Mode order</p>
                <p className="mt-1 text-sm font-bold leading-6 text-lime-800">Order otomatis memakai D-Balance dan VIPayment. Jika belum aktif atau saldo kurang, gunakan order manual.</p>
              </div>
              {orderStatus && <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-xs font-bold leading-5 text-slate-600">{orderStatus}</p>}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={closeProduct} className="rounded-2xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-600">Pilih Produk Lain</button>
                <button type="button" onClick={submitOrder} disabled={!target.trim() || ordering} className={`rounded-2xl px-5 py-4 text-center text-sm font-black transition ${target.trim() && !ordering ? 'bg-slate-950 text-[#dfff4f] shadow-xl shadow-slate-950/15 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400'}`}>{ordering ? 'Memproses...' : 'Lanjut Order'}</button>
              </div>
              <a href={`https://wa.me/?text=${manualMessage()}`} className="mt-3 block rounded-2xl bg-white px-5 py-3 text-center text-xs font-black text-slate-500 ring-1 ring-black/10">Order Manual via WhatsApp</a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
