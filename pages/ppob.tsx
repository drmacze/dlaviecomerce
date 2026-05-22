import { useEffect, useMemo, useState, type CSSProperties } from 'react';
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
  color: string;
  dark: string;
};

type Theme = {
  color: string;
  dark: string;
  soft: string;
  icon: string;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const normalize = (value?: string | null, fallback = 'Digital') => String(value || fallback).trim() || fallback;

function themeFor(category: string): Theme {
  const text = category.toLowerCase();
  if (text.includes('game') || text.includes('stream')) return { color: '#ff7a18', dark: '#311707', soft: '#ffe1c7', icon: '🎮' };
  if (text.includes('pln') || text.includes('listrik')) return { color: '#ffd400', dark: '#332500', soft: '#fff4a8', icon: '⚡' };
  if (text.includes('data') || text.includes('internet') || text.includes('aigo') || text.includes('always')) return { color: '#30d5ff', dark: '#062432', soft: '#c5f5ff', icon: '📶' };
  if (text.includes('pulsa')) return { color: '#dfff4f', dark: '#253307', soft: '#f1ffb5', icon: '📱' };
  if (text.includes('voucher')) return { color: '#b58cff', dark: '#261345', soft: '#e8dbff', icon: '🎟️' };
  if (text.includes('wallet') || text.includes('saldo')) return { color: '#37f29b', dark: '#06331f', soft: '#cbffe4', icon: '💳' };
  return { color: '#f35cff', dark: '#331033', soft: '#ffd4ff', icon: '✨' };
}

function categoryTitle(category: string) {
  const value = normalize(category);
  const text = value.toLowerCase();
  if (text.includes('aigo')) return 'Aigo / Axis Data';
  if (text.includes('always')) return 'AlwaysOn TRI';
  return value;
}

function targetPlaceholder(product?: PpobProduct | null) {
  const text = `${product?.category || ''} ${product?.brand || ''} ${product?.product_name || ''}`.toLowerCase();
  if (text.includes('game') || text.includes('free fire') || text.includes('mobile legends')) return 'User ID / Server ID';
  if (text.includes('pln') || text.includes('token')) return 'Nomor meter / ID pelanggan PLN';
  return 'Nomor HP tujuan';
}

function customStyle(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

export default function PpobPage() {
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [status, setStatus] = useState('Membuka mesin katalog...');
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
        setStatus(list.length ? 'VIPayment cartridge loaded.' : 'Belum ada cartridge aktif. Refresh beberapa saat lagi.');
      })
      .catch(() => setStatus('Katalog gagal dimuat. Cek koneksi lalu refresh.'));

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token || '')).catch(() => setToken(''));
  }, []);

  const categories = useMemo<UiCategory[]>(() => {
    const counts = new Map<string, number>();
    products.forEach((item) => {
      const label = categoryTitle(item.category);
      counts.set(label, (counts.get(label) || 0) + 1);
    });

    const dynamic = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => {
        const theme = themeFor(label);
        return { key: label, label, count, icon: theme.icon, color: theme.color, dark: theme.dark };
      });

    return [{ key: 'all', label: 'Semua', count: products.length, icon: '🕹️', color: '#dfff4f', dark: '#151c05' }, ...dynamic];
  }, [products]);

  const activeCategoryData = categories.find((item) => item.key === activeCategory) || categories[0];
  const orbitCategories = categories.slice(0, 8);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((item) => {
      if (activeCategory !== 'all' && categoryTitle(item.category) !== activeCategory) return;
      set.add(normalize(item.brand, 'Digital'));
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))].slice(0, 16);
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

  const featured = filtered.slice(0, 4);
  const cheapest = useMemo(() => filtered.reduce<PpobProduct | null>((best, item) => (!best || item.selling_price < best.selling_price ? item : best), null), [filtered]);

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
    setOrderStatus('Memasukkan cartridge order ke mesin...');
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
      setOrderStatus(`Order berhasil dibuat. Ref: ${json.order?.ref_id || '-'}. Cek Orders/Wallet untuk status.`);
    } catch {
      setOrderStatus('Koneksi order gagal. Kamu bisa lanjut manual dulu.');
    } finally {
      setOrdering(false);
    }
  }

  return (
    <main className="arcade min-h-screen overflow-hidden px-4 py-5 text-white md:px-8 md:py-8">
      <style jsx global>{`
        body{background:#080a10}.arcade{position:relative;isolation:isolate;background:#080a10}.arcade:before{content:'';position:fixed;inset:0;z-index:-4;background:radial-gradient(circle at 18% 8%,#243bff55,transparent 30rem),radial-gradient(circle at 88% 10%,#dfff4f42,transparent 26rem),radial-gradient(circle at 50% 95%,#ff7a1840,transparent 33rem),linear-gradient(135deg,#080a10,#111624 48%,#090b12)}.arcade:after{content:'';position:fixed;inset:0;z-index:-3;opacity:.42;background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(circle at 50% 20%,black,transparent 80%)}.noise{position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:.22;background:repeating-linear-gradient(0deg,transparent 0 7px,#ffffff08 8px),linear-gradient(120deg,#dfff4f10,#30d5ff10,#ff7a1810);animation:noiseMove 7s linear infinite}.machine{background:linear-gradient(180deg,#191f30,#0c101a);border:2px solid #2b344d;box-shadow:0 34px 90px #0009,inset 0 1px 0 #ffffff1e,inset 0 -18px 30px #0007}.arcade-panel{background:#101522;border:2px solid #2b344d;box-shadow:inset 0 0 0 1px #ffffff0d,0 22px 70px #0007}.banner-box{background:linear-gradient(135deg,#dfff4f,#f9ffb7 46%,#30d5ff);color:#080a10;box-shadow:0 24px 0 #101522,0 38px 70px #0008;transform:skewY(-1.5deg)}.orbit{background:radial-gradient(circle,#171f31 0 34%,#0d111d 35% 64%,#242e45 65% 66%,transparent 67%);box-shadow:inset 0 0 60px #000,0 0 55px #30d5ff22}.orbit-btn{position:absolute;left:50%;top:50%;transform:rotate(var(--angle)) translate(8.3rem) rotate(calc(-1 * var(--angle)));box-shadow:0 12px 30px #0008,0 0 22px var(--tone)}.orbit-btn.active{box-shadow:0 0 0 4px #080a10,0 0 0 8px var(--tone),0 18px 50px #0009}.slot-card{background:linear-gradient(180deg,#20283b,#0e1320);border:2px solid #303a54;box-shadow:0 20px 0 #080b12,0 28px 55px #0008,inset 0 1px 0 #ffffff22;animation:dropIn .42s ease both}.slot-card:before{content:'';position:absolute;left:1rem;right:1rem;top:.8rem;height:.45rem;border-radius:999px;background:linear-gradient(90deg,transparent,var(--tone),transparent);opacity:.65;animation:pulseRail 2.7s ease-in-out infinite}.slot-card:after{content:'';position:absolute;right:-2.2rem;bottom:-2.2rem;width:8rem;height:8rem;border-radius:2rem;background:var(--tone);opacity:.18;filter:blur(12px);transform:rotate(18deg);transition:.3s}.slot-card:hover{transform:translateY(-9px) rotate(-.7deg);border-color:var(--tone);box-shadow:0 22px 0 #080b12,0 42px 80px #000b,0 0 42px color-mix(in srgb,var(--tone),transparent 62%)}.slot-card:hover:after{opacity:.34;transform:rotate(32deg) scale(1.12)}.crate{background:linear-gradient(180deg,#1b2234,#0b0f19);border:2px solid #2d3852;box-shadow:inset 0 16px 0 #ffffff08,inset 0 -20px 0 #0006,0 30px 80px #0007}.crate-lid{background:repeating-linear-gradient(90deg,#2d3852 0 18px,#20283b 18px 36px);border:2px solid #3b4866;box-shadow:0 12px 0 #0b0f19}.solid-input{background:#080b12;border:2px solid #2d3852;color:white;box-shadow:inset 0 4px 14px #0008}.solid-input:focus{border-color:#dfff4f;box-shadow:0 0 0 4px #dfff4f22,inset 0 4px 14px #0008}.brand-pill{background:#141a28;border:1px solid #2d3852}.brand-pill.active{background:#dfff4f;color:#080a10;border-color:#dfff4f}.drawer{animation:drawer .24s ease-out}.chip-row{scrollbar-width:none}.chip-row::-webkit-scrollbar{display:none}@keyframes noiseMove{to{background-position:0 80px,120px 0}}@keyframes dropIn{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes pulseRail{0%,100%{opacity:.35;transform:scaleX(.72)}50%{opacity:1;transform:scaleX(1)}}@keyframes drawer{from{opacity:.7;transform:translateY(22px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>
      <div className="noise" />

      <section className="mx-auto max-w-7xl">
        <div className="machine rounded-[2.4rem] p-4 md:p-6">
          <div className="banner-box relative overflow-hidden rounded-[1.8rem] p-5 md:p-8">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/40 blur-2xl" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div>
                <p className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-black uppercase tracking-[.22em] text-[#dfff4f]">DLAVIE PPOB ARCADE</p>
                <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[.84] tracking-[-.055em] md:text-7xl">Pilih produk seperti main arcade.</h1>
                <p className="mt-5 max-w-2xl text-sm font-black leading-7 text-slate-800 md:text-base">Kategori diputar lewat orbit, produk tampil sebagai cartridge, dan order masuk lewat panel mesin D-Balance.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[1.25rem] bg-black p-4 text-[#dfff4f]"><p className="text-[10px] font-black uppercase tracking-[.2em] text-white/45">Produk</p><p className="mt-2 text-3xl font-black">{products.length}</p></div>
                <div className="rounded-[1.25rem] bg-white p-4 text-black"><p className="text-[10px] font-black uppercase tracking-[.2em] text-black/40">Kategori</p><p className="mt-2 text-3xl font-black">{Math.max(categories.length - 1, 0)}</p></div>
                <div className="rounded-[1.25rem] bg-[#30d5ff] p-4 text-black"><p className="text-[10px] font-black uppercase tracking-[.2em] text-black/45">Mode</p><p className="mt-2 text-lg font-black">LIVE</p></div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[25rem_1fr]">
            <aside className="space-y-5">
              <div className="arcade-panel rounded-[2rem] p-4">
                <div className="orbit relative mx-auto hidden h-[22rem] w-[22rem] rounded-full md:block">
                  <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#dfff4f] bg-black text-center shadow-[0_0_50px_#dfff4f44]">
                    <div>
                      <p className="text-3xl">{activeCategoryData?.icon || '🕹️'}</p>
                      <p className="mt-1 px-3 text-xs font-black leading-4 text-[#dfff4f]">{activeCategoryData?.label || 'Semua'}</p>
                    </div>
                  </div>
                  {orbitCategories.map((category, index) => {
                    const angle = `${index * (360 / Math.max(orbitCategories.length, 1))}deg`;
                    return (
                      <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} className={`orbit-btn ${activeCategory === category.key ? 'active' : ''} grid h-16 w-16 place-items-center rounded-2xl border-2 border-white/10 bg-[#101522] text-2xl transition hover:scale-110`} style={customStyle({ '--angle': angle, '--tone': category.color })} aria-label={category.label}>
                        {category.icon}
                      </button>
                    );
                  })}
                </div>

                <div className="chip-row flex gap-2 overflow-x-auto pb-2 md:hidden">
                  {categories.map((category) => (
                    <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} className={`shrink-0 rounded-2xl border-2 px-4 py-3 text-left transition ${activeCategory === category.key ? 'border-[#dfff4f] bg-[#dfff4f] text-black' : 'border-[#2d3852] bg-[#111827] text-white'}`}>
                      <span className="text-xl">{category.icon}</span>
                      <span className="ml-2 text-xs font-black">{category.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.5rem] bg-[#080b12] p-4 ring-1 ring-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[.22em] text-slate-500">Status mesin</p>
                  <p className="mt-2 text-sm font-black leading-6 text-white">{status}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{filtered.length} cartridge tampil dari {products.length} produk.</p>
                </div>
              </div>

              <div className="crate rounded-[2rem] p-4">
                <div className="crate-lid rounded-[1.2rem] px-4 py-3 text-xs font-black uppercase tracking-[.18em] text-[#dfff4f]">Control Panel</div>
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="solid-input mt-4 w-full rounded-[1.25rem] px-4 py-4 text-sm font-black outline-none" placeholder="Cari AXIS, TRI, ML, kode produk..." />
                {brands.length > 2 && (
                  <div className="chip-row mt-3 flex gap-2 overflow-x-auto pb-1">
                    {brands.map((brand) => (
                      <button key={brand} type="button" onClick={() => setActiveBrand(brand)} className={`brand-pill ${activeBrand === brand ? 'active' : ''} shrink-0 rounded-full px-3 py-2 text-[11px] font-black transition`}>
                        {brand === 'all' ? 'Semua Brand' : brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <section className="space-y-5">
              {featured.length > 0 && (
                <div className="grid gap-3 md:grid-cols-4">
                  {featured.map((item) => {
                    const theme = themeFor(item.category);
                    return (
                      <button key={item.id} type="button" onClick={() => openProduct(item)} className="rounded-[1.4rem] border-2 border-[#2d3852] bg-[#111827] p-4 text-left transition hover:-translate-y-1" style={customStyle({ boxShadow: `0 0 32px ${theme.color}22` })}>
                        <p className="text-2xl">{theme.icon}</p>
                        <p className="mt-2 line-clamp-1 text-sm font-black">{item.product_name}</p>
                        <p className="mt-2 text-xs font-black" style={{ color: theme.color }}>{rupiah(item.selling_price)}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product, index) => {
                  const theme = themeFor(product.category);
                  return (
                    <button key={product.id} type="button" onClick={() => openProduct(product)} className="slot-card relative rounded-[1.7rem] p-4 text-left transition duration-300" style={customStyle({ '--tone': theme.color, animationDelay: `${Math.min(index, 16) * 28}ms` })}>
                      <div className="relative z-10 flex min-h-[12rem] flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 pt-2">
                            <span className="rounded-full px-3 py-1.5 text-[11px] font-black text-black" style={{ backgroundColor: theme.color }}>{theme.icon} {categoryTitle(product.category)}</span>
                            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-black" style={{ color: theme.color }}>{rupiah(product.selling_price)}</span>
                          </div>
                          <h3 className="mt-5 line-clamp-2 text-xl font-black leading-tight">{product.product_name}</h3>
                          <p className="mt-2 line-clamp-1 text-xs font-bold text-slate-400">{product.brand || 'Digital'} · {product.sku_code}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                          <span className="text-[11px] font-black uppercase tracking-[.18em] text-slate-500">Insert card</span>
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-black transition group-hover:rotate-6">↗</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!filtered.length && (
                <div className="rounded-[2rem] border-2 border-[#2d3852] bg-[#111827] p-10 text-center">
                  <p className="text-5xl">🧃</p>
                  <h2 className="mt-4 text-3xl font-black">Cartridge kosong</h2>
                  <p className="mt-2 text-sm font-bold text-slate-400">Ganti kategori, brand, atau kata pencarian.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/75 p-3 backdrop-blur-md md:items-center md:justify-center">
          <section className="drawer w-full overflow-hidden rounded-[2rem] border-2 border-[#2d3852] bg-[#0d1220] text-white shadow-2xl md:max-w-xl">
            <div className="relative p-5 md:p-6" style={customStyle({ background: `linear-gradient(135deg,${themeFor(selected.category).dark},#080a10 62%)` })}>
              <div className="absolute right-5 top-5 h-24 w-24 rounded-full blur-xl" style={{ backgroundColor: themeFor(selected.category).color, opacity: 0.28 }} />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: themeFor(selected.category).color }}>Order Cartridge</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight">{selected.product_name}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-400">{categoryTitle(selected.category)} · {selected.brand || 'Digital'} · {selected.sku_code}</p>
                </div>
                <button type="button" onClick={closeProduct} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">Tutup</button>
              </div>
              <div className="relative z-10 mt-5 rounded-[1.5rem] border-2 border-white/10 bg-black p-4">
                <p className="text-xs font-bold text-slate-400">Total Bayar</p>
                <p className="mt-1 text-4xl font-black" style={{ color: themeFor(selected.category).color }}>{rupiah(selected.selling_price)}</p>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <label className="block text-sm font-black text-slate-300">Nomor tujuan / User ID</label>
              <input value={target} onChange={(event) => setTarget(event.target.value)} className="solid-input mt-2 w-full rounded-2xl px-4 py-4 text-base font-bold outline-none" placeholder={targetPlaceholder(selected)} />
              <div className="mt-4 rounded-2xl border-2 border-[#2d3852] bg-[#111827] p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#dfff4f]">D-Balance Machine</p>
                <p className="mt-1 text-sm font-bold leading-6 text-slate-300">Order otomatis memakai D-Balance dan VIPayment. Kalau belum login atau saldo kurang, gunakan order manual.</p>
              </div>
              {orderStatus && <p className="mt-3 rounded-2xl bg-white p-3 text-xs font-black leading-5 text-black">{orderStatus}</p>}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={closeProduct} className="rounded-2xl border-2 border-[#2d3852] bg-[#111827] px-5 py-4 text-sm font-black text-slate-300">Pilih Lain</button>
                <button type="button" onClick={submitOrder} disabled={!target.trim() || ordering} className={`rounded-2xl px-5 py-4 text-center text-sm font-black transition ${target.trim() && !ordering ? 'bg-[#dfff4f] text-black shadow-xl shadow-lime-500/20 hover:-translate-y-0.5' : 'bg-slate-700 text-slate-400'}`}>{ordering ? 'Memproses...' : 'Lanjut Order'}</button>
              </div>
              <a href={`https://wa.me/?text=${manualMessage()}`} className="mt-3 block rounded-2xl border-2 border-[#2d3852] bg-black px-5 py-3 text-center text-xs font-black text-slate-300">Order Manual via WhatsApp</a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
