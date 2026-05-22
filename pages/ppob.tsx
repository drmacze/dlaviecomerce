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

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function targetPlaceholder(product?: PpobProduct | null) {
  const category = `${product?.category || ''} ${product?.brand || ''}`.toLowerCase();
  if (category.includes('game') || category.includes('free fire') || category.includes('mobile legends')) return 'Masukkan User ID / Server ID';
  if (category.includes('pln')) return 'Masukkan nomor meter / ID pelanggan PLN';
  return 'Masukkan nomor HP tujuan';
}

export default function PpobPage() {
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [status, setStatus] = useState('Memuat produk PPOB...');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PpobProduct | null>(null);
  const [target, setTarget] = useState('');
  const [token, setToken] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetch('/api/ppob-products')
      .then((res) => res.json())
      .then((json) => {
        setProducts(json.products || []);
        setStatus((json.products || []).length ? 'Produk PPOB siap dipilih.' : 'Belum ada produk. Jalankan sync provider terlebih dahulu.');
      })
      .catch(() => setStatus('Gagal memuat produk PPOB.'));

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token || '');
    }).catch(() => setToken(''));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return products;
    return products.filter((item) => `${item.product_name} ${item.brand || ''} ${item.category} ${item.sku_code}`.toLowerCase().includes(needle));
  }, [products, query]);

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
      setOrderStatus('Kamu belum login. Silakan lanjut order manual atau login untuk memakai D-Balance.');
      window.location.href = `https://wa.me/?text=${manualMessage()}`;
      return;
    }

    setOrdering(true);
    setOrderStatus('Membuat order otomatis...');
    try {
      const res = await fetch('/api/ppob-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 md:p-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">DLAVIE PPOB</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Topup Game, Pulsa, dan Data</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">Pilih produk, masukkan nomor tujuan atau User ID, lalu lanjutkan proses order.</p>
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
            <button key={product.id} type="button" onClick={() => openProduct(product)} className="group rounded-3xl bg-slate-50 p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black">{product.product_name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{product.category} · {product.brand || 'Digital'} · {product.sku_code}</p>
                  <p className="mt-3 text-xs font-black text-slate-500 opacity-0 transition group-hover:opacity-100">Tap untuk buka detail</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-[#dfff4f]">{rupiah(product.selling_price)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/60 p-3 backdrop-blur-sm md:items-center md:justify-center">
          <section className="w-full rounded-[2rem] bg-white p-5 shadow-2xl md:max-w-lg md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Detail Produk</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{selected.product_name}</h2>
                <p className="mt-2 text-sm font-bold text-slate-400">{selected.category} · {selected.brand || 'Digital'} · {selected.sku_code}</p>
              </div>
              <button type="button" onClick={closeProduct} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500">Tutup</button>
            </div>

            <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-bold text-slate-400">Total Bayar</p>
              <p className="mt-1 text-3xl font-black text-[#dfff4f]">{rupiah(selected.selling_price)}</p>
            </div>

            <label className="mt-5 block text-sm font-black text-slate-700">Nomor tujuan / User ID</label>
            <input value={target} onChange={(event) => setTarget(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-4 text-base font-bold outline-none focus:ring-2 focus:ring-slate-950" placeholder={targetPlaceholder(selected)} />

            <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700">Order otomatis memakai D-Balance dan VIPayment. Jika fitur belum diaktifkan, kamu tetap bisa lanjut manual.</p>
            {orderStatus && <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-xs font-bold leading-5 text-slate-600">{orderStatus}</p>}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={closeProduct} className="rounded-2xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-600">Pilih Produk Lain</button>
              <button type="button" onClick={submitOrder} disabled={!target.trim() || ordering} className={`rounded-2xl px-5 py-4 text-center text-sm font-black ${target.trim() && !ordering ? 'bg-slate-950 text-[#dfff4f]' : 'bg-slate-200 text-slate-400'}`}>{ordering ? 'Memproses...' : 'Lanjut Order'}</button>
            </div>
            <a href={`https://wa.me/?text=${manualMessage()}`} className="mt-3 block rounded-2xl bg-white px-5 py-3 text-center text-xs font-black text-slate-500 ring-1 ring-black/10">Order Manual via WhatsApp</a>
          </section>
        </div>
      )}
    </main>
  );
}
