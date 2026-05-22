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
  color: string;
  dark: string;
  kind: string;
};

type Theme = {
  color: string;
  dark: string;
  soft: string;
  kind: string;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const normalize = (value?: string | null, fallback = 'Digital') => String(value || fallback).trim() || fallback;

function brandKey(value?: string | null) {
  return normalize(value, 'Digital').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function brandTheme(brand?: string | null) {
  const key = brandKey(brand);
  if (key.includes('smartfren')) return { a: '#ff163f', b: '#ffd7df', c: '#3a0611', name: 'SMARTFREN' };
  if (key.includes('telkomsel') || key.includes('tsel')) return { a: '#ff1645', b: '#ffb703', c: '#390711', name: 'TELKOMSEL' };
  if (key.includes('axis')) return { a: '#7b2cff', b: '#ffea00', c: '#170a34', name: 'AXIS' };
  if (key.includes('xl')) return { a: '#123cff', b: '#30d5ff', c: '#071342', name: 'XL' };
  if (key.includes('tri') || key.includes('three')) return { a: '#101010', b: '#ff5b00', c: '#070707', name: 'TRI' };
  if (key.includes('indosat') || key.includes('isat')) return { a: '#ffd400', b: '#e51b23', c: '#312400', name: 'INDOSAT' };
  if (key.includes('pln')) return { a: '#00a8ff', b: '#ffd400', c: '#062235', name: 'PLN' };
  if (key.includes('freefire')) return { a: '#ff7a18', b: '#ffe100', c: '#331404', name: 'FREE FIRE' };
  if (key.includes('mobile') || key.includes('legend')) return { a: '#2f6bff', b: '#c59bff', c: '#071a40', name: 'MLBB' };
  return { a: '#dfff4f', b: '#30d5ff', c: '#101522', name: normalize(brand, 'DLAVIE').toUpperCase().slice(0, 12) };
}

function themeFor(category: string): Theme {
  const text = category.toLowerCase();
  if (text.includes('game') || text.includes('stream')) return { color: '#ff7a18', dark: '#331707', soft: '#ffe1c7', kind: 'game' };
  if (text.includes('pln') || text.includes('listrik')) return { color: '#ffd400', dark: '#332500', soft: '#fff4a8', kind: 'pln' };
  if (text.includes('data') || text.includes('internet') || text.includes('aigo') || text.includes('always')) return { color: '#30d5ff', dark: '#062432', soft: '#c5f5ff', kind: 'data' };
  if (text.includes('pulsa')) return { color: '#dfff4f', dark: '#253307', soft: '#f1ffb5', kind: 'phone' };
  if (text.includes('voucher')) return { color: '#b58cff', dark: '#261345', soft: '#e8dbff', kind: 'voucher' };
  if (text.includes('wallet') || text.includes('saldo')) return { color: '#37f29b', dark: '#06331f', soft: '#cbffe4', kind: 'wallet' };
  return { color: '#f35cff', dark: '#331033', soft: '#ffd4ff', kind: 'spark' };
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

function css(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

export default function PpobPage() {
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [status, setStatus] = useState('Membuka katalog produk...');
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
        setStatus(list.length ? 'Produk VIPayment siap dipilih.' : 'Belum ada produk aktif. Refresh beberapa saat lagi.');
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
        return { key: label, label, count, color: theme.color, dark: theme.dark, kind: theme.kind };
      });

    return [{ key: 'all', label: 'Semua', count: products.length, color: '#dfff4f', dark: '#151c05', kind: 'all' }, ...dynamic];
  }, [products]);

  const activeCategoryData = categories.find((item) => item.key === activeCategory) || categories[0];
  const orbitCategories = categories.slice(0, 7);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((item) => {
      if (activeCategory !== 'all' && categoryTitle(item.category) !== activeCategory) return;
      set.add(normalize(item.brand, 'Digital'));
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))].slice(0, 18);
  }, [products, activeCategory]);

  useEffect(() => setActiveBrand('all'), [activeCategory]);

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

  const featured = filtered.slice(0, 5);

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
      setOrderStatus(`Order berhasil dibuat. Ref: ${json.order?.ref_id || '-'}. Cek Orders/Wallet untuk status.`);
    } catch {
      setOrderStatus('Koneksi order gagal. Kamu bisa lanjut manual dulu.');
    } finally {
      setOrdering(false);
    }
  }

  return (
    <main className="ppob-lab min-h-screen overflow-x-hidden px-3 py-4 text-white md:px-8 md:py-8">
      <style jsx global>{`
        body{background:#070911}.ppob-lab{position:relative;isolation:isolate;background:#070911}.ppob-lab:before{content:'';position:fixed;inset:0;z-index:-4;background:radial-gradient(circle at 16% 6%,#263bff70,transparent 28rem),radial-gradient(circle at 88% 8%,#dfff4f5c,transparent 24rem),radial-gradient(circle at 50% 100%,#ff4d1840,transparent 34rem),linear-gradient(135deg,#070911,#111827 52%,#070911)}.ppob-lab:after{content:'';position:fixed;inset:0;z-index:-3;background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);background-size:32px 32px;mask-image:radial-gradient(circle at 50% 20%,black,transparent 78%)}.lab-noise{position:fixed;inset:0;z-index:-2;opacity:.18;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 8px,#fff 9px),linear-gradient(115deg,#30d5ff22,#dfff4f22,#ff7a1820);mix-blend-mode:overlay;animation:scanNoise 6s linear infinite}.lab-shell{background:linear-gradient(180deg,#192238,#0c111e);border:2px solid #33405f;box-shadow:0 32px 90px #000a,inset 0 1px 0 #ffffff1e,inset 0 -18px 36px #0008}.hero-ribbon{background:linear-gradient(135deg,#dfff4f 0%,#fff7ac 42%,#30d5ff 100%);color:#070911;box-shadow:0 18px 0 #111827,0 34px 70px #0008}.hero-visual{background:radial-gradient(circle at 25% 20%,#fff9,transparent 22%),linear-gradient(135deg,#101522,#263452);border:2px solid #33405f;box-shadow:inset 0 0 0 1px #ffffff14,0 22px 60px #0008}.orbit-dock{background:linear-gradient(180deg,#121a2b,#090d17);border:2px solid #33405f;box-shadow:inset 0 18px 0 #ffffff08,0 24px 70px #0008}.orbit-ring{background:radial-gradient(circle,#0b0f19 0 29%,#1a2338 30% 42%,#0b0f19 43% 62%,#354263 63% 64%,transparent 65%);box-shadow:inset 0 0 50px #000,0 0 42px #30d5ff22}.orbit-action{position:absolute;left:50%;top:50%;transform:rotate(var(--angle)) translate(6.85rem) rotate(calc(-1 * var(--angle)));background:#101827;border:2px solid #33405f;box-shadow:0 12px 32px #000a,0 0 22px #000}.orbit-action.active{border-color:var(--tone);box-shadow:0 0 0 5px #070911,0 0 0 9px var(--tone),0 20px 44px #000b}.brand-strip{scrollbar-width:none}.brand-strip::-webkit-scrollbar{display:none}.control-box{background:linear-gradient(180deg,#1b253a,#0a0f1a);border:2px solid #33405f;box-shadow:inset 0 12px 0 #ffffff08,inset 0 -18px 0 #0007,0 24px 70px #0008}.control-lid{background:repeating-linear-gradient(90deg,#33405f 0 16px,#202b42 16px 32px);border:2px solid #46577d;box-shadow:0 10px 0 #080b12}.solid-input{background:#080b12;border:2px solid #33405f;color:white;box-shadow:inset 0 5px 16px #0009}.solid-input:focus{border-color:#dfff4f;box-shadow:0 0 0 4px #dfff4f24,inset 0 5px 16px #0009}.brand-pill{background:#111827;border:1px solid #33405f;color:#cbd5e1}.brand-pill.active{background:#dfff4f;color:#070911;border-color:#dfff4f}.product-pack{position:relative;background:linear-gradient(180deg,#202b42,#0f1523);border:2px solid #33405f;box-shadow:0 15px 0 #070911,0 27px 58px #0009,inset 0 1px 0 #ffffff22;animation:packIn .42s ease both;transform-style:preserve-3d}.product-pack:before{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(120deg,transparent 0 28%,#ffffff15 34%,transparent 42%);transform:translateX(-120%);animation:shine 4.8s ease-in-out infinite}.product-pack:after{content:'';position:absolute;right:-1.2rem;bottom:-1.2rem;width:7rem;height:7rem;border-radius:1.5rem;background:var(--brandA);opacity:.22;filter:blur(16px);transform:rotate(16deg);transition:.28s}.product-pack:hover{transform:translateY(-10px) rotateX(3deg) rotateZ(-.4deg);border-color:var(--brandA);box-shadow:0 18px 0 #070911,0 42px 90px #000c,0 0 48px #000}.product-pack:hover:after{opacity:.42;transform:rotate(28deg) scale(1.12)}.product-window{background:linear-gradient(135deg,var(--brandA),var(--brandB));box-shadow:inset 0 1px 0 #fff8,0 12px 32px #0006}.pack-tabs span{background:#ffffff24}.drawer{animation:drawer .24s ease-out}.svg-icon{display:block}.visual-phone{filter:drop-shadow(0 15px 18px #0008)}@keyframes scanNoise{to{background-position:0 90px,120px 0}}@keyframes packIn{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes shine{0%,54%{transform:translateX(-120%)}100%{transform:translateX(120%)}}@keyframes drawer{from{opacity:.65;transform:translateY(24px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>
      <div className="lab-noise" />

      <section className="mx-auto max-w-7xl">
        <div className="lab-shell rounded-[2rem] p-3 md:rounded-[2.6rem] md:p-6">
          <div className="hero-ribbon relative overflow-hidden rounded-[1.6rem] p-5 md:p-8">
            <div className="absolute right-3 top-3 hidden h-40 w-40 rounded-[2rem] bg-white/35 blur-2xl md:block" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div>
                <p className="inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-black uppercase tracking-[.22em] text-[#dfff4f]">DLAVIE PPOB LAB</p>
                <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[.86] tracking-[-.055em] md:text-7xl">Pilih paket dari product box.</h1>
                <p className="mt-5 max-w-2xl text-sm font-black leading-7 text-slate-800 md:text-base">Kategori dipilih dari orbit, produk tampil sebagai pack visual dengan banner brand, dan order masuk lewat D-Balance.</p>
              </div>
              <div className="hero-visual relative min-h-[15rem] overflow-hidden rounded-[1.6rem] p-4">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#dfff4f]/45 blur-xl" />
                <div className="absolute -bottom-8 left-8 h-28 w-28 rounded-full bg-[#30d5ff]/35 blur-xl" />
                <ProductVisual product={featured[0] || products[0]} large />
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-black/70 p-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/40">Produk</p><p className="mt-1 text-xl font-black text-[#dfff4f]">{products.length}</p></div>
                  <div className="rounded-2xl bg-black/70 p-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/40">Kategori</p><p className="mt-1 text-xl font-black text-white">{Math.max(categories.length - 1, 0)}</p></div>
                  <div className="rounded-2xl bg-black/70 p-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/40">Provider</p><p className="mt-1 text-xl font-black text-[#30d5ff]">VIP</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[21rem_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-5">
              <div className="orbit-dock rounded-[2rem] p-4">
                <div className="orbit-ring relative mx-auto hidden h-[18.25rem] w-[18.25rem] rounded-full md:block">
                  <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#dfff4f] bg-black text-center shadow-[0_0_42px_#dfff4f44]">
                    <div className="grid justify-items-center gap-1 px-3">
                      <CategoryIcon kind={activeCategoryData?.kind || 'all'} color={activeCategoryData?.color || '#dfff4f'} />
                      <p className="text-[11px] font-black leading-4 text-[#dfff4f]">{activeCategoryData?.label || 'Semua'}</p>
                    </div>
                  </div>
                  {orbitCategories.map((category, index) => {
                    const angle = `${index * (360 / Math.max(orbitCategories.length, 1))}deg`;
                    return (
                      <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} className={`orbit-action ${activeCategory === category.key ? 'active' : ''} grid h-14 w-14 place-items-center rounded-2xl transition hover:scale-110`} style={css({ '--angle': angle, '--tone': category.color })} aria-label={category.label}>
                        <CategoryIcon kind={category.kind} color={category.color} small />
                      </button>
                    );
                  })}
                </div>

                <div className="brand-strip flex gap-2 overflow-x-auto pb-2 md:hidden">
                  {categories.map((category) => (
                    <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 px-3 py-3 transition ${activeCategory === category.key ? 'border-[#dfff4f] bg-[#dfff4f] text-black' : 'border-[#33405f] bg-[#111827] text-white'}`}>
                      <CategoryIcon kind={category.kind} color={activeCategory === category.key ? '#070911' : category.color} small />
                      <span className="text-xs font-black">{category.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.4rem] bg-[#080b12] p-4 ring-1 ring-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[.22em] text-slate-500">Status</p>
                  <p className="mt-2 text-sm font-black leading-6 text-white">{status}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{filtered.length} produk dari {products.length} total.</p>
                </div>
              </div>

              <div className="control-box rounded-[2rem] p-4">
                <div className="control-lid rounded-[1.2rem] px-4 py-3 text-xs font-black uppercase tracking-[.18em] text-[#dfff4f]">Control Deck</div>
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="solid-input mt-4 w-full rounded-[1.25rem] px-4 py-4 text-sm font-black outline-none" placeholder="Cari Smartfren, AXIS, TRI, kode produk..." />
                {brands.length > 2 && (
                  <div className="brand-strip mt-3 flex gap-2 overflow-x-auto pb-1">
                    {brands.map((brand) => (
                      <button key={brand} type="button" onClick={() => setActiveBrand(brand)} className={`brand-pill ${activeBrand === brand ? 'active' : ''} shrink-0 rounded-full px-3 py-2 text-[11px] font-black transition`}>
                        {brand === 'all' ? 'Semua Brand' : brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <section className="min-w-0 space-y-5">
              {featured.length > 0 && (
                <div className="brand-strip flex gap-3 overflow-x-auto pb-3">
                  {featured.map((item) => {
                    const brand = brandTheme(item.brand);
                    return (
                      <button key={item.id} type="button" onClick={() => openProduct(item)} className="min-w-[13rem] rounded-[1.4rem] border-2 border-[#33405f] bg-[#111827] p-3 text-left transition hover:-translate-y-1" style={css({ boxShadow: `0 0 36px ${brand.a}22` })}>
                        <div className="h-20 overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg,${brand.a},${brand.b})` }}>
                          <ProductVisual product={item} mini />
                        </div>
                        <p className="mt-3 line-clamp-1 text-sm font-black">{item.product_name}</p>
                        <p className="mt-1 text-xs font-black" style={{ color: brand.b }}>{rupiah(item.selling_price)}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product, index) => {
                  const category = themeFor(product.category);
                  const brand = brandTheme(product.brand);
                  return (
                    <button key={product.id} type="button" onClick={() => openProduct(product)} className="product-pack group min-w-0 rounded-[1.75rem] p-3 text-left transition duration-300" style={css({ '--brandA': brand.a, '--brandB': brand.b, animationDelay: `${Math.min(index, 16) * 26}ms` })}>
                      <div className="product-window relative h-36 overflow-hidden rounded-[1.35rem] p-3 text-black">
                        <ProductVisual product={product} />
                        <div className="pack-tabs absolute left-3 top-3 flex gap-1.5"><span className="h-2 w-8 rounded-full" /><span className="h-2 w-4 rounded-full" /><span className="h-2 w-6 rounded-full" /></div>
                        <div className="absolute bottom-3 right-3 rounded-full bg-black px-3 py-1.5 text-[11px] font-black" style={{ color: brand.b }}>{rupiah(product.selling_price)}</div>
                      </div>
                      <div className="relative z-10 px-1 pb-1 pt-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-black px-2.5 py-1.5 text-[10px] font-black" style={{ color: category.color }}>
                            <CategoryIcon kind={category.kind} color={category.color} micro />
                            <span className="truncate">{categoryTitle(product.category)}</span>
                          </span>
                          <span className="rounded-full border border-white/10 px-2.5 py-1.5 text-[10px] font-black text-slate-400">{product.sku_code}</span>
                        </div>
                        <h3 className="mt-3 line-clamp-2 text-lg font-black leading-tight text-white">{product.product_name}</h3>
                        <p className="mt-2 line-clamp-1 text-xs font-bold text-slate-400">{brand.name} product pack</p>
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                          <span className="text-[11px] font-black uppercase tracking-[.18em] text-slate-500">Open box</span>
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-black transition group-hover:rotate-6 group-hover:scale-110">↗</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!filtered.length && (
                <div className="rounded-[2rem] border-2 border-[#33405f] bg-[#111827] p-10 text-center">
                  <CategoryIcon kind="spark" color="#dfff4f" />
                  <h2 className="mt-4 text-3xl font-black">Product box kosong</h2>
                  <p className="mt-2 text-sm font-bold text-slate-400">Ganti kategori, brand, atau kata pencarian.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/75 p-3 backdrop-blur-md md:items-center md:justify-center">
          <OrderDrawer selected={selected} target={target} setTarget={setTarget} closeProduct={closeProduct} submitOrder={submitOrder} ordering={ordering} orderStatus={orderStatus} manualMessage={manualMessage} />
        </div>
      )}
    </main>
  );
}

function CategoryIcon({ kind, color, small, micro }: { kind: string; color: string; small?: boolean; micro?: boolean }) {
  const size = micro ? 14 : small ? 25 : 38;
  const common = { width: size, height: size, viewBox: '0 0 48 48', fill: 'none', className: 'svg-icon' };
  if (kind === 'data') return <svg {...common}><path d="M8 31c8.8-8.7 23.2-8.7 32 0" stroke={color} strokeWidth="4" strokeLinecap="round"/><path d="M15 38c5-4.8 13-4.8 18 0" stroke={color} strokeWidth="4" strokeLinecap="round"/><circle cx="24" cy="42" r="3" fill={color}/><path d="M4 23c11-11 29-11 40 0" stroke={color} strokeWidth="4" strokeLinecap="round" opacity=".45"/></svg>;
  if (kind === 'game') return <svg {...common}><rect x="6" y="15" width="36" height="22" rx="10" stroke={color} strokeWidth="4"/><path d="M16 26h8M20 22v8" stroke={color} strokeWidth="3" strokeLinecap="round"/><circle cx="31" cy="25" r="2.5" fill={color}/><circle cx="36" cy="29" r="2.5" fill={color}/></svg>;
  if (kind === 'pln') return <svg {...common}><path d="M28 4 11 27h12l-3 17 18-24H26l2-16Z" fill={color}/></svg>;
  if (kind === 'phone') return <svg {...common}><rect x="14" y="5" width="20" height="38" rx="6" stroke={color} strokeWidth="4"/><path d="M21 10h6M22 36h4" stroke={color} strokeWidth="3" strokeLinecap="round"/></svg>;
  if (kind === 'voucher') return <svg {...common}><path d="M8 16a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v5a4 4 0 0 0 0 6v5a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-5a4 4 0 0 0 0-6v-5Z" stroke={color} strokeWidth="4"/><path d="M24 13v22" stroke={color} strokeWidth="3" strokeDasharray="3 4"/></svg>;
  if (kind === 'wallet') return <svg {...common}><rect x="7" y="13" width="34" height="25" rx="7" stroke={color} strokeWidth="4"/><path d="M31 23h10v8H31a4 4 0 0 1 0-8Z" fill={color}/><path d="M10 17 31 9" stroke={color} strokeWidth="4" strokeLinecap="round" opacity=".45"/></svg>;
  return <svg {...common}><path d="M24 5v38M5 24h38M10 10l28 28M38 10 10 38" stroke={color} strokeWidth="4" strokeLinecap="round"/><circle cx="24" cy="24" r="7" fill={color}/></svg>;
}

function ProductVisual({ product, large, mini }: { product?: PpobProduct; large?: boolean; mini?: boolean }) {
  const brand = brandTheme(product?.brand);
  const category = themeFor(product?.category || 'Digital');
  const h = large ? 210 : mini ? 84 : 144;
  return (
    <svg viewBox="0 0 360 180" className="h-full w-full" preserveAspectRatio="xMidYMid slice" style={{ minHeight: h }}>
      <rect width="360" height="180" rx="28" fill={brand.c} />
      <circle cx="305" cy="36" r="82" fill={brand.a} opacity="0.72" />
      <circle cx="65" cy="160" r="92" fill={brand.b} opacity="0.42" />
      <path d="M0 132 C74 78 126 192 210 118 C274 62 312 82 360 48 V180 H0Z" fill="rgba(255,255,255,.22)" />
      <g className="visual-phone">
        <rect x="32" y="34" width="96" height="126" rx="20" fill="#070911" opacity=".93" />
        <rect x="43" y="47" width="74" height="90" rx="14" fill="rgba(255,255,255,.12)" />
        <rect x="54" y="58" width="52" height="10" rx="5" fill={brand.a} />
        <rect x="54" y="76" width="38" height="8" rx="4" fill={brand.b} />
        <circle cx="80" cy="148" r="5" fill="#fff" opacity=".72" />
      </g>
      <g transform="translate(206 36)">
        <rect x="0" y="0" width="112" height="92" rx="18" fill="rgba(255,255,255,.88)" />
        <rect x="12" y="14" width="52" height="12" rx="6" fill={brand.a} />
        <rect x="12" y="36" width="88" height="10" rx="5" fill="#070911" opacity=".18" />
        <rect x="12" y="55" width="66" height="10" rx="5" fill="#070911" opacity=".16" />
        <path d="M86 16h14v20H86z" fill={brand.b} />
      </g>
      <g transform="translate(150 98)">
        <circle cx="22" cy="22" r="22" fill="#070911" opacity=".9" />
        <CategoryIconSvg kind={category.kind} color={brand.b} />
      </g>
      <text x="150" y="64" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="1.5">{brand.name}</text>
      <text x="150" y="88" fill="rgba(255,255,255,.72)" fontSize="12" fontWeight="800" fontFamily="Arial, sans-serif">{categoryTitle(product?.category || 'Digital').toUpperCase()}</text>
    </svg>
  );
}

function CategoryIconSvg({ kind, color }: { kind: string; color: string }) {
  if (kind === 'data') return <g transform="translate(8 8)"><path d="M0 16c8-8 20-8 28 0" stroke={color} strokeWidth="4" strokeLinecap="round"/><path d="M7 23c4-4 10-4 14 0" stroke={color} strokeWidth="4" strokeLinecap="round"/></g>;
  if (kind === 'pln') return <path d="M25 6 10 27h11l-3 17 18-24H25l0-14Z" fill={color}/>;
  if (kind === 'game') return <g><rect x="7" y="15" width="34" height="20" rx="9" stroke={color} strokeWidth="4"/><path d="M16 25h8M20 21v8" stroke={color} strokeWidth="3" strokeLinecap="round"/><circle cx="32" cy="24" r="2.5" fill={color}/></g>;
  return <rect x="15" y="7" width="18" height="34" rx="6" stroke={color} strokeWidth="4"/>;
}

function OrderDrawer({ selected, target, setTarget, closeProduct, submitOrder, ordering, orderStatus, manualMessage }: { selected: PpobProduct; target: string; setTarget: (value: string) => void; closeProduct: () => void; submitOrder: () => void; ordering: boolean; orderStatus: string; manualMessage: () => string }) {
  const brand = brandTheme(selected.brand);
  return (
    <section className="drawer w-full overflow-hidden rounded-[2rem] border-2 border-[#33405f] bg-[#0d1220] text-white shadow-2xl md:max-w-xl">
      <div className="relative overflow-hidden p-5 md:p-6" style={{ background: `linear-gradient(135deg,${brand.c},#080a10 66%)` }}>
        <div className="absolute right-0 top-0 h-40 w-44 opacity-80"><ProductVisual product={selected} mini /></div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="max-w-[70%]">
            <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: brand.b }}>Open Product Box</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">{selected.product_name}</h2>
            <p className="mt-2 text-sm font-bold text-slate-400">{categoryTitle(selected.category)} · {selected.brand || 'Digital'} · {selected.sku_code}</p>
          </div>
          <button type="button" onClick={closeProduct} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">Tutup</button>
        </div>
        <div className="relative z-10 mt-5 rounded-[1.5rem] border-2 border-white/10 bg-black p-4">
          <p className="text-xs font-bold text-slate-400">Total Bayar</p>
          <p className="mt-1 text-4xl font-black" style={{ color: brand.b }}>{rupiah(selected.selling_price)}</p>
        </div>
      </div>
      <div className="p-5 md:p-6">
        <label className="block text-sm font-black text-slate-300">Nomor tujuan / User ID</label>
        <input value={target} onChange={(event) => setTarget(event.target.value)} className="solid-input mt-2 w-full rounded-2xl px-4 py-4 text-base font-bold outline-none" placeholder={targetPlaceholder(selected)} />
        <div className="mt-4 rounded-2xl border-2 border-[#33405f] bg-[#111827] p-4">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#dfff4f]">D-Balance Checkout</p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-300">Order otomatis memakai D-Balance dan VIPayment. Kalau belum login atau saldo kurang, gunakan order manual.</p>
        </div>
        {orderStatus && <p className="mt-3 rounded-2xl bg-white p-3 text-xs font-black leading-5 text-black">{orderStatus}</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={closeProduct} className="rounded-2xl border-2 border-[#33405f] bg-[#111827] px-5 py-4 text-sm font-black text-slate-300">Pilih Lain</button>
          <button type="button" onClick={submitOrder} disabled={!target.trim() || ordering} className={`rounded-2xl px-5 py-4 text-center text-sm font-black transition ${target.trim() && !ordering ? 'bg-[#dfff4f] text-black shadow-xl shadow-lime-500/20 hover:-translate-y-0.5' : 'bg-slate-700 text-slate-400'}`}>{ordering ? 'Memproses...' : 'Lanjut Order'}</button>
        </div>
        <a href={`https://wa.me/?text=${manualMessage()}`} className="mt-3 block rounded-2xl border-2 border-[#33405f] bg-black px-5 py-3 text-center text-xs font-black text-slate-300">Order Manual via WhatsApp</a>
      </div>
    </section>
  );
}
