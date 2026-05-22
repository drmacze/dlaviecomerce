import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
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
  kind: string;
};

type BrandTheme = {
  a: string;
  b: string;
  c: string;
  name: string;
};

type CategoryTheme = {
  color: string;
  kind: string;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const normalize = (value?: string | null, fallback = 'Digital') => String(value || fallback).trim() || fallback;

function css(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

function brandKey(value?: string | null) {
  return normalize(value, 'Digital').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function brandTheme(brand?: string | null): BrandTheme {
  const key = brandKey(brand);
  if (key.includes('smartfren')) return { a: '#ff174d', b: '#ffffff', c: '#2b0711', name: 'SMARTFREN' };
  if (key.includes('telkomsel') || key.includes('tsel')) return { a: '#ff1645', b: '#ffb703', c: '#310610', name: 'TELKOMSEL' };
  if (key.includes('axis')) return { a: '#7b2cff', b: '#ffea00', c: '#170a34', name: 'AXIS' };
  if (key.includes('xl')) return { a: '#1547ff', b: '#30d5ff', c: '#071342', name: 'XL' };
  if (key.includes('tri') || key.includes('three')) return { a: '#0b0b0d', b: '#ff6b00', c: '#070707', name: 'TRI' };
  if (key.includes('indosat') || key.includes('isat')) return { a: '#ffd400', b: '#e51b23', c: '#312400', name: 'INDOSAT' };
  if (key.includes('pln')) return { a: '#00a8ff', b: '#ffd400', c: '#062235', name: 'PLN' };
  if (key.includes('freefire')) return { a: '#ff7a18', b: '#ffe100', c: '#331404', name: 'FREE FIRE' };
  if (key.includes('mobile') || key.includes('legend')) return { a: '#2f6bff', b: '#c59bff', c: '#071a40', name: 'MLBB' };
  return { a: '#dfff4f', b: '#30d5ff', c: '#101522', name: normalize(brand, 'DLAVIE').toUpperCase().slice(0, 12) };
}

function categoryTheme(category: string): CategoryTheme {
  const text = category.toLowerCase();
  if (text.includes('game') || text.includes('stream')) return { color: '#ff7a18', kind: 'game' };
  if (text.includes('pln') || text.includes('listrik')) return { color: '#ffd400', kind: 'pln' };
  if (text.includes('data') || text.includes('internet') || text.includes('aigo') || text.includes('always')) return { color: '#30d5ff', kind: 'data' };
  if (text.includes('pulsa')) return { color: '#dfff4f', kind: 'phone' };
  if (text.includes('voucher')) return { color: '#b58cff', kind: 'voucher' };
  if (text.includes('wallet') || text.includes('saldo')) return { color: '#37f29b', kind: 'wallet' };
  return { color: '#f35cff', kind: 'spark' };
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

function setSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

export default function PpobPage() {
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [status, setStatus] = useState('Loading live component packs...');
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
        setStatus(list.length ? 'Live VIPayment packs are ready.' : 'No active products yet. Refresh again in a moment.');
      })
      .catch(() => setStatus('Failed to load the catalog. Check connection and refresh.'));

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
        const theme = categoryTheme(label);
        return { key: label, label, count, color: theme.color, kind: theme.kind };
      });

    return [{ key: 'all', label: 'All Packs', count: products.length, color: '#dfff4f', kind: 'all' }, ...dynamic];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((item) => {
      if (activeCategory !== 'all' && categoryTitle(item.category) !== activeCategory) return;
      set.add(normalize(item.brand, 'Digital'));
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))].slice(0, 24);
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

  const featured = filtered.slice(0, 6);

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
    setOrderStatus('Creating automatic D-Balance order...');
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
    <main className="bits-page min-h-screen overflow-x-hidden px-4 py-4 text-white md:px-7 md:py-7">
      <style jsx global>{`
        body{background:#050507;color:#fff}.bits-page{position:relative;isolation:isolate;background:#050507;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.bits-page:before{content:'';position:fixed;inset:0;z-index:-5;background:radial-gradient(circle at 18% 4%,rgba(223,255,79,.18),transparent 28rem),radial-gradient(circle at 82% 10%,rgba(48,213,255,.16),transparent 24rem),radial-gradient(circle at 50% 108%,rgba(181,140,255,.16),transparent 30rem),linear-gradient(#050507,#050507)}.bits-grid{position:fixed;inset:0;z-index:-4;opacity:.52;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,black,transparent 88%)}.bits-noise{position:fixed;inset:0;z-index:-3;pointer-events:none;opacity:.085;background:repeating-linear-gradient(0deg,transparent 0 6px,#fff 7px),linear-gradient(115deg,#dfff4f,#30d5ff,#b58cff);mix-blend-mode:overlay;animation:bitsNoise 7s linear infinite}.shell{border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.025));box-shadow:0 30px 100px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(18px)}.topbar{border-bottom:1px solid rgba(255,255,255,.08);background:rgba(5,5,7,.72);backdrop-filter:blur(18px)}.command{border:1px solid rgba(255,255,255,.1);background:#0b0b0f;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.command:focus{border-color:rgba(223,255,79,.72);box-shadow:0 0 0 4px rgba(223,255,79,.13),inset 0 1px 0 rgba(255,255,255,.06)}.side-item{position:relative;border:1px solid rgba(255,255,255,.08);background:#0a0a0d;color:#a1a1aa}.side-item:before{content:'';position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 0% 50%,var(--tone),transparent 42%);opacity:0;transition:.25s}.side-item.active{color:#fff;border-color:color-mix(in srgb,var(--tone),white 18%);background:linear-gradient(90deg,color-mix(in srgb,var(--tone),transparent 86%),#0a0a0d)}.side-item.active:before{opacity:.22}.chip-track{scrollbar-width:none}.chip-track::-webkit-scrollbar{display:none}.chip{border:1px solid rgba(255,255,255,.08);background:#0a0a0d;color:#a1a1aa}.chip.active{background:#dfff4f;color:#050507;border-color:#dfff4f}.hero-card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,#0d0d12,#070709);box-shadow:0 24px 70px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)}.hero-card:before{content:'';position:absolute;inset:auto -18% -35% -18%;height:55%;background:radial-gradient(ellipse at center,rgba(223,255,79,.18),transparent 65%);filter:blur(22px);animation:heroPulse 4.8s ease-in-out infinite}.gradient-title{background:linear-gradient(90deg,#fff,#dfff4f 38%,#30d5ff 72%,#fff);-webkit-background-clip:text;background-clip:text;color:transparent}.preview-card{border:1px solid rgba(255,255,255,.09);background:#08080b;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 22px 70px rgba(0,0,0,.46)}.bit-card{--mx:50%;--my:50%;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.095);background:linear-gradient(180deg,#0c0c11,#07070a);box-shadow:0 18px 50px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.07);animation:cardIn .42s ease both}.bit-card:before{content:'';position:absolute;inset:0;background:radial-gradient(420px circle at var(--mx) var(--my),color-mix(in srgb,var(--brandA),transparent 70%),transparent 42%);opacity:0;transition:.22s}.bit-card:after{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(135deg,transparent,var(--brandA),transparent,var(--brandB));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.18;transition:.22s}.bit-card:hover{transform:translateY(-8px);box-shadow:0 32px 95px rgba(0,0,0,.72),0 0 42px color-mix(in srgb,var(--brandA),transparent 76%)}.bit-card:hover:before{opacity:1}.bit-card:hover:after{opacity:.76}.preview-window{background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.36),transparent 20%),linear-gradient(135deg,var(--brandA),var(--brandB));box-shadow:inset 0 1px 0 rgba(255,255,255,.65),0 16px 42px rgba(0,0,0,.48)}.preview-window:after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 0 28%,rgba(255,255,255,.23) 35%,transparent 48%);transform:translateX(-130%);animation:shine 5.2s ease-in-out infinite}.tag{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.045)}.drawer{animation:drawer .24s ease-out}.svg-icon{display:block}.modal-shell{border:1px solid rgba(255,255,255,.1);background:#08080b;box-shadow:0 30px 110px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.08)}@keyframes bitsNoise{to{background-position:0 80px,120px 0}}@keyframes heroPulse{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}@keyframes cardIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes shine{0%,55%{transform:translateX(-130%)}100%{transform:translateX(130%)}}@keyframes drawer{from{opacity:.65;transform:translateY(24px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>
      <div className="bits-grid" />
      <div className="bits-noise" />

      <section className="mx-auto max-w-7xl pt-10 md:pt-0">
        <div className="shell overflow-hidden rounded-[1.75rem]">
          <header className="topbar sticky top-0 z-30 px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#dfff4f]/30 bg-[#dfff4f]/10 text-[#dfff4f]"><LogoMark /></div>
                <div>
                  <p className="text-sm font-black tracking-tight">Dlavie PPOB</p>
                  <p className="text-[10px] font-bold uppercase tracking-[.24em] text-zinc-500">Component-style catalog</p>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-[22rem_auto]">
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="command w-full rounded-xl px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-600" placeholder="Search brand, product, code..." />
                <a href="/wallet" className="rounded-xl bg-[#dfff4f] px-4 py-3 text-center text-sm font-black text-black transition hover:-translate-y-0.5">Wallet</a>
              </div>
            </div>
          </header>

          <div className="grid min-w-0 gap-0 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
            <aside className="hidden border-r border-white/10 p-4 lg:block">
              <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[.24em] text-zinc-600">Categories</p>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} className={`side-item ${activeCategory === category.key ? 'active' : ''} flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold transition`} style={css({ '--tone': category.color })}>
                    <span className="relative z-10 flex min-w-0 items-center gap-2"><CategoryIcon kind={category.kind} color={category.color} micro /><span className="truncate">{category.label}</span></span>
                    <span className="relative z-10 text-xs opacity-60">{category.count}</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="min-w-0 p-4 md:p-6">
              <div className="chip-track mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {categories.map((category) => (
                  <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} className={`chip ${activeCategory === category.key ? 'active' : ''} flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition`}>
                    <CategoryIcon kind={category.kind} color={activeCategory === category.key ? '#050507' : category.color} micro />
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="hero-card rounded-[1.75rem] p-5 md:p-8">
                <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-center">
                  <div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#dfff4f]/30 bg-[#dfff4f]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.18em] text-[#dfff4f]">Live Provider</span>
                      <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[11px] font-black uppercase tracking-[.18em] text-zinc-400">{status}</span>
                    </div>
                    <h1 className="gradient-title max-w-4xl text-5xl font-black leading-[.88] tracking-[-.06em] md:text-7xl">Digital products, rebuilt as premium components.</h1>
                    <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-zinc-400 md:text-base">Browse category bits, preview brand visuals, and open each product like a polished interactive component.</p>
                  </div>
                  <div className="preview-card relative overflow-hidden rounded-[1.5rem] p-3">
                    <div className="preview-window relative h-60 overflow-hidden rounded-[1.15rem]">
                      <ProductVisual product={featured[0] || products[0]} large />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Stat label="Products" value={products.length} />
                      <Stat label="Shown" value={filtered.length} />
                      <Stat label="Mode" value="VIP" />
                    </div>
                  </div>
                </div>
              </div>

              {brands.length > 2 && (
                <div className="chip-track mt-5 flex gap-2 overflow-x-auto pb-1">
                  {brands.map((brand) => (
                    <button key={brand} type="button" onClick={() => setActiveBrand(brand)} className={`chip ${activeBrand === brand ? 'active' : ''} shrink-0 rounded-full px-3.5 py-2 text-xs font-black transition`}>
                      {brand === 'all' ? 'All Brands' : brand}
                    </button>
                  ))}
                </div>
              )}

              {featured.length > 0 && (
                <div className="chip-track mt-5 flex gap-3 overflow-x-auto pb-3">
                  {featured.map((item) => {
                    const brand = brandTheme(item.brand);
                    return (
                      <button key={item.id} type="button" onMouseMove={setSpotlight} onClick={() => openProduct(item)} className="bit-card min-w-[14rem] rounded-2xl p-3 text-left transition duration-300" style={css({ '--brandA': brand.a, '--brandB': brand.b })}>
                        <div className="preview-window relative h-24 overflow-hidden rounded-xl"><ProductVisual product={item} mini /></div>
                        <p className="relative z-10 mt-3 line-clamp-1 text-sm font-black">{item.product_name}</p>
                        <p className="relative z-10 mt-1 text-xs font-black" style={{ color: brand.b }}>{rupiah(item.selling_price)}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product, index) => {
                  const category = categoryTheme(product.category);
                  const brand = brandTheme(product.brand);
                  return (
                    <button key={product.id} type="button" onMouseMove={setSpotlight} onClick={() => openProduct(product)} className="bit-card group min-w-0 rounded-[1.35rem] p-3 text-left transition duration-300" style={css({ '--brandA': brand.a, '--brandB': brand.b, animationDelay: `${Math.min(index, 18) * 22}ms` })}>
                      <div className="preview-window relative h-40 overflow-hidden rounded-[1rem]">
                        <ProductVisual product={product} />
                        <div className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-black backdrop-blur" style={{ color: brand.b }}>{rupiah(product.selling_price)}</div>
                      </div>
                      <div className="relative z-10 mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="tag flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-black" style={{ color: category.color }}><CategoryIcon kind={category.kind} color={category.color} micro /><span className="truncate">{categoryTitle(product.category)}</span></span>
                          <span className="tag rounded-full px-2.5 py-1.5 text-[10px] font-black text-zinc-500">{product.sku_code}</span>
                        </div>
                        <h3 className="line-clamp-2 min-h-[2.75rem] text-lg font-black leading-tight text-white">{product.product_name}</h3>
                        <div className="flex items-center justify-between border-t border-white/10 pt-3">
                          <p className="text-xs font-bold text-zinc-500">{brand.name} preview</p>
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black transition group-hover:rotate-6 group-hover:scale-110">↗</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!filtered.length && (
                <div className="preview-card mt-5 rounded-[1.5rem] p-10 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#dfff4f]/10"><CategoryIcon kind="spark" color="#dfff4f" /></div>
                  <h2 className="mt-4 text-3xl font-black">No matching pack</h2>
                  <p className="mt-2 text-sm font-bold text-zinc-500">Try another category, brand, or keyword.</p>
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-xl border border-white/10 bg-black/60 p-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-zinc-500">{label}</p><p className="mt-1 text-lg font-black text-white">{value}</p></div>;
}

function LogoMark() {
  return <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none"><path d="M11 8h14c8 0 13 6 13 16S33 40 25 40H11V8Z" stroke="currentColor" strokeWidth="5"/><path d="M21 18h4c3 0 5 2 5 6s-2 6-5 6h-4V18Z" fill="currentColor"/></svg>;
}

function CategoryIcon({ kind, color, micro }: { kind: string; color: string; micro?: boolean }) {
  const size = micro ? 14 : 34;
  const common = { width: size, height: size, viewBox: '0 0 48 48', fill: 'none', className: 'svg-icon' };
  if (kind === 'data') return <svg {...common}><path d="M8 31c8.8-8.7 23.2-8.7 32 0" stroke={color} strokeWidth="4" strokeLinecap="round"/><path d="M15 38c5-4.8 13-4.8 18 0" stroke={color} strokeWidth="4" strokeLinecap="round"/><circle cx="24" cy="42" r="3" fill={color}/><path d="M4 23c11-11 29-11 40 0" stroke={color} strokeWidth="4" strokeLinecap="round" opacity=".45"/></svg>;
  if (kind === 'game') return <svg {...common}><rect x="6" y="15" width="36" height="22" rx="10" stroke={color} strokeWidth="4"/><path d="M16 26h8M20 22v8" stroke={color} strokeWidth="3" strokeLinecap="round"/><circle cx="31" cy="25" r="2.5" fill={color}/><circle cx="36" cy="29" r="2.5" fill={color}/></svg>;
  if (kind === 'pln') return <svg {...common}><path d="M28 4 11 27h12l-3 17 18-24H26l2-16Z" fill={color}/></svg>;
  if (kind === 'phone') return <svg {...common}><rect x="14" y="5" width="20" height="38" rx="6" stroke={color} strokeWidth="4"/><path d="M21 10h6M22 36h4" stroke={color} strokeWidth="3" strokeLinecap="round"/></svg>;
  if (kind === 'voucher') return <svg {...common}><path d="M8 16a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v5a4 4 0 0 0 0 6v5a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-5a4 4 0 0 0 0-6v-5Z" stroke={color} strokeWidth="4"/><path d="M24 13v22" stroke={color} strokeWidth="3" strokeDasharray="3 4"/></svg>;
  if (kind === 'wallet') return <svg {...common}><rect x="7" y="13" width="34" height="25" rx="7" stroke={color} strokeWidth="4"/><path d="M31 23h10v8H31a4 4 0 0 1 0-8Z" fill={color}/></svg>;
  return <svg {...common}><path d="M24 5v38M5 24h38M10 10l28 28M38 10 10 38" stroke={color} strokeWidth="4" strokeLinecap="round"/><circle cx="24" cy="24" r="7" fill={color}/></svg>;
}

function ProductVisual({ product, large, mini }: { product?: PpobProduct; large?: boolean; mini?: boolean }) {
  const brand = brandTheme(product?.brand);
  const category = categoryTheme(product?.category || 'Digital');
  const height = large ? 240 : mini ? 96 : 160;
  return (
    <svg viewBox="0 0 420 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice" style={{ minHeight: height }}>
      <rect width="420" height="220" rx="30" fill={brand.c} />
      <circle cx="344" cy="48" r="105" fill={brand.a} opacity="0.72" />
      <circle cx="64" cy="188" r="115" fill={brand.b} opacity="0.34" />
      <path d="M0 166 C74 102 135 238 237 138 C312 64 354 88 420 50 V220 H0Z" fill="rgba(255,255,255,.20)" />
      <g filter="url(#shadow)">
        <rect x="32" y="42" width="108" height="138" rx="24" fill="#050507" opacity=".94" />
        <rect x="44" y="56" width="84" height="96" rx="16" fill="rgba(255,255,255,.12)" />
        <rect x="56" y="70" width="58" height="10" rx="5" fill={brand.a} />
        <rect x="56" y="90" width="42" height="8" rx="4" fill={brand.b} />
        <circle cx="86" cy="166" r="5" fill="#fff" opacity=".7" />
      </g>
      <g transform="translate(250 45)">
        <rect width="124" height="102" rx="22" fill="rgba(255,255,255,.86)" />
        <rect x="14" y="16" width="60" height="12" rx="6" fill={brand.a} />
        <rect x="14" y="40" width="94" height="10" rx="5" fill="#050507" opacity=".18" />
        <rect x="14" y="61" width="72" height="10" rx="5" fill="#050507" opacity=".16" />
        <path d="M96 17h15v23H96z" fill={brand.b} />
      </g>
      <g transform="translate(158 122)">
        <circle cx="25" cy="25" r="25" fill="#050507" opacity=".92" />
        <CategoryIconSvg kind={category.kind} color={brand.b} />
      </g>
      <text x="165" y="75" fill="#ffffff" fontSize="27" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="1.5">{brand.name}</text>
      <text x="166" y="101" fill="rgba(255,255,255,.7)" fontSize="12" fontWeight="800" fontFamily="Arial, sans-serif">{categoryTitle(product?.category || 'Digital').toUpperCase()}</text>
      <defs><filter id="shadow" x="-20%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="10" floodColor="#000" floodOpacity=".5"/></filter></defs>
    </svg>
  );
}

function CategoryIconSvg({ kind, color }: { kind: string; color: string }) {
  if (kind === 'data') return <g transform="translate(8 10)"><path d="M0 16c8-8 20-8 28 0" stroke={color} strokeWidth="4" strokeLinecap="round"/><path d="M7 23c4-4 10-4 14 0" stroke={color} strokeWidth="4" strokeLinecap="round"/></g>;
  if (kind === 'pln') return <path d="M27 6 10 28h12l-3 17 19-25H27V6Z" fill={color}/>;
  if (kind === 'game') return <g><rect x="7" y="15" width="34" height="20" rx="9" stroke={color} strokeWidth="4"/><path d="M16 25h8M20 21v8" stroke={color} strokeWidth="3" strokeLinecap="round"/><circle cx="32" cy="24" r="2.5" fill={color}/></g>;
  return <rect x="15" y="7" width="18" height="34" rx="6" stroke={color} strokeWidth="4"/>;
}

function OrderDrawer({ selected, target, setTarget, closeProduct, submitOrder, ordering, orderStatus, manualMessage }: { selected: PpobProduct; target: string; setTarget: (value: string) => void; closeProduct: () => void; submitOrder: () => void; ordering: boolean; orderStatus: string; manualMessage: () => string }) {
  const brand = brandTheme(selected.brand);
  return (
    <section className="modal-shell drawer w-full overflow-hidden rounded-[1.5rem] text-white md:max-w-xl">
      <div className="relative overflow-hidden p-5 md:p-6" style={{ background: `linear-gradient(135deg,${brand.c},#050507 66%)` }}>
        <div className="absolute right-0 top-0 h-40 w-44 opacity-85"><ProductVisual product={selected} mini /></div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="max-w-[70%]">
            <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: brand.b }}>Open Product</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">{selected.product_name}</h2>
            <p className="mt-2 text-sm font-bold text-zinc-500">{categoryTitle(selected.category)} · {selected.brand || 'Digital'} · {selected.sku_code}</p>
          </div>
          <button type="button" onClick={closeProduct} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">Tutup</button>
        </div>
        <div className="relative z-10 mt-5 rounded-[1.25rem] border border-white/10 bg-black/70 p-4">
          <p className="text-xs font-bold text-zinc-500">Total Bayar</p>
          <p className="mt-1 text-4xl font-black" style={{ color: brand.b }}>{rupiah(selected.selling_price)}</p>
        </div>
      </div>
      <div className="p-5 md:p-6">
        <label className="block text-sm font-black text-zinc-300">Nomor tujuan / User ID</label>
        <input value={target} onChange={(event) => setTarget(event.target.value)} className="command mt-2 w-full rounded-xl px-4 py-4 text-base font-bold text-white outline-none" placeholder={targetPlaceholder(selected)} />
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[.035] p-4">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#dfff4f]">D-Balance Checkout</p>
          <p className="mt-1 text-sm font-bold leading-6 text-zinc-400">Order otomatis memakai D-Balance dan VIPayment. Kalau belum login atau saldo kurang, gunakan order manual.</p>
        </div>
        {orderStatus && <p className="mt-3 rounded-xl bg-white p-3 text-xs font-black leading-5 text-black">{orderStatus}</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={closeProduct} className="rounded-xl border border-white/10 bg-white/[.035] px-5 py-4 text-sm font-black text-zinc-300">Pilih Lain</button>
          <button type="button" onClick={submitOrder} disabled={!target.trim() || ordering} className={`rounded-xl px-5 py-4 text-center text-sm font-black transition ${target.trim() && !ordering ? 'bg-[#dfff4f] text-black shadow-xl shadow-lime-500/20 hover:-translate-y-0.5' : 'bg-zinc-800 text-zinc-500'}`}>{ordering ? 'Memproses...' : 'Lanjut Order'}</button>
        </div>
        <a href={`https://wa.me/?text=${manualMessage()}`} className="mt-3 block rounded-xl border border-white/10 bg-black px-5 py-3 text-center text-xs font-black text-zinc-300">Order Manual via WhatsApp</a>
      </div>
    </section>
  );
}
