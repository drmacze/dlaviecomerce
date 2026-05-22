import { useEffect, useMemo, useState } from 'react';

type PpobProduct = {
  id: string;
  sku_code: string;
  product_name: string;
  category: string;
  brand?: string | null;
  selling_price: number;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function PpobPage() {
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [status, setStatus] = useState('Memuat produk PPOB...');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/ppob-products')
      .then((res) => res.json())
      .then((json) => {
        setProducts(json.products || []);
        setStatus((json.products || []).length ? 'Produk PPOB siap dipilih.' : 'Belum ada produk. Jalankan sync Digiflazz terlebih dahulu.');
      })
      .catch(() => setStatus('Gagal memuat produk PPOB.'));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return products;
    return products.filter((item) => `${item.product_name} ${item.brand || ''} ${item.category} ${item.sku_code}`.toLowerCase().includes(needle));
  }, [products, query]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 md:p-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">DLAVIE PPOB</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Topup Game, Pulsa, dan Data</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">Katalog PPOB otomatis dari Digiflazz. Checkout transaksi penuh akan diaktifkan setelah saldo dan whitelist production stabil.</p>
          </div>
          <a className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" href="/wallet">Buka Wallet</a>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm font-bold outline-none" placeholder="Cari ML, FF, Telkomsel, XL, PLN..." />
          <div className="rounded-2xl bg-[#dfff4f] px-5 py-3 text-sm font-black text-slate-950">{filtered.length} Produk</div>
        </div>

        <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-500">{status}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <article key={product.id} className="rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black">{product.product_name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{product.category} · {product.brand || 'Digital'} · {product.sku_code}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-[#dfff4f]">{rupiah(product.selling_price)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
