import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type PanelProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  ram_mb: number;
  cpu_percent: number;
  disk_mb: number;
  backup_limit: number;
  database_limit: number;
  allocation_limit: number;
  duration_days: number;
  stock?: number | null;
  price: number;
  badge?: string | null;
};

type PanelOrder = {
  id: string;
  public_order_id: string;
  status: string;
  amount: number;
  requested_username?: string | null;
  server_name?: string | null;
  provisioned_panel_url?: string | null;
  provisioned_username?: string | null;
  provisioned_password?: string | null;
  admin_notes?: string | null;
  created_at: string;
  fulfilled_at?: string | null;
};

const rupiah = (value: number) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const gb = (mb: number) => `${Number(mb || 0) / 1024} GB`;

function randomKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function statusLabel(status: string) {
  const value = String(status || '').toLowerCase();
  if (value === 'fulfilled') return 'Aktif';
  if (value === 'failed') return 'Gagal';
  if (value === 'refunded') return 'Refund';
  if (value === 'cancelled') return 'Batal';
  return 'Diproses';
}

function statusClass(status: string) {
  const value = String(status || '').toLowerCase();
  if (value === 'fulfilled') return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200';
  if (value === 'failed' || value === 'cancelled') return 'border-red-400/30 bg-red-500/15 text-red-200';
  if (value === 'refunded') return 'border-sky-400/30 bg-sky-500/15 text-sky-200';
  return 'border-amber-400/30 bg-amber-500/15 text-amber-200';
}

function PackageCard({ product, selected, onSelect }: { product: PanelProduct; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-[2rem] border p-5 text-left transition duration-300 hover:-translate-y-1 ${
        selected ? 'border-lime-300/70 bg-lime-300/10 shadow-2xl shadow-lime-500/10' : 'border-white/10 bg-white/[0.045] hover:border-white/25'
      }`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-300/10 blur-2xl transition group-hover:bg-lime-300/20" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Pterodactyl</p>
          <h3 className="mt-2 text-2xl font-black text-white">{product.name}</h3>
        </div>
        {product.badge && <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-black">{product.badge}</span>}
      </div>
      <p className="relative mt-3 min-h-12 text-sm font-semibold leading-relaxed text-zinc-400">{product.description}</p>
      <div className="relative mt-5 grid grid-cols-2 gap-2 text-sm font-bold text-zinc-300">
        <span className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">RAM {gb(product.ram_mb)}</span>
        <span className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">CPU {product.cpu_percent}%</span>
        <span className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">Disk {gb(product.disk_mb)}</span>
        <span className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">{product.duration_days} Hari</span>
      </div>
      <div className="relative mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Harga</p>
          <p className="mt-1 text-3xl font-black text-white">{rupiah(product.price)}</p>
        </div>
        <span className={`rounded-full border px-4 py-2 text-xs font-black ${selected ? 'border-lime-300 bg-lime-300 text-black' : 'border-white/10 text-zinc-300'}`}>
          {selected ? 'Dipilih' : 'Pilih'}
        </span>
      </div>
    </button>
  );
}

export default function PanelStorefrontPage() {
  const [products, setProducts] = useState<PanelProduct[]>([]);
  const [orders, setOrders] = useState<PanelOrder[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [username, setUsername] = useState('');
  const [serverName, setServerName] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('Memuat paket panel...');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const selectedProduct = useMemo(() => products.find((item) => item.id === selectedId) || products[0], [products, selectedId]);

  async function loadProducts() {
    const res = await fetch('/api/panel/products');
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Gagal memuat paket panel.');
    setProducts(json.products || []);
    if (!selectedId && json.products?.[0]?.id) setSelectedId(json.products[0].id);
  }

  async function loadOrders() {
    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    const res = await fetch('/api/panel/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setOrders(json.orders || []);
  }

  async function boot() {
    setLoading(true);
    setMessage('Memuat paket panel...');
    try {
      await loadProducts();
      await loadOrders();
      setMessage('Pilih paket panel, isi data server, lalu checkout dengan D-Balance.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat halaman panel.');
    } finally {
      setLoading(false);
    }
  }

  async function submitOrder() {
    if (!selectedProduct) return setMessage('Pilih paket panel terlebih dahulu.');
    if (username.trim().length < 4) return setMessage('Username panel minimal 4 karakter.');
    if (serverName.trim().length < 3) return setMessage('Nama server minimal 3 karakter.');

    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setMessage('Login dulu untuk membeli panel.');
      return;
    }

    setOrdering(true);
    setMessage('Membuat order panel...');
    try {
      const res = await fetch('/api/panel/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Idempotency-Key': randomKey()
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          requested_username: username,
          server_name: serverName,
          notes
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || json.message || 'Order panel gagal dibuat.');

      setUsername('');
      setServerName('');
      setNotes('');
      setMessage(json.message || 'Order panel berhasil dibuat.');
      await loadOrders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Order panel gagal dibuat.');
    } finally {
      setOrdering(false);
    }
  }

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      <section className="relative px-4 py-8 md:px-8 md:py-12">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute right-[-12%] top-[12%] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <a href="/" className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-zinc-300">
                ← Kembali
              </a>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-300">Dlavie Panel Store</p>
              <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">Panel Pterodactyl siap order.</h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-zinc-400">
                Pilih paket, isi username, lalu order masuk ke antrean admin. Tahap awal ini dibuat manual-safe agar tidak bergantung whitelist IP provider.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-zinc-300 md:max-w-sm">
              {loading ? 'Loading...' : message}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">Paket Panel</h2>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-400">{products.length} Paket</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {products.map((product) => (
                  <PackageCard key={product.id} product={product} selected={product.id === selectedProduct?.id} onSelect={() => setSelectedId(product.id)} />
                ))}
              </div>
            </section>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:sticky lg:top-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Checkout</p>
              <h2 className="mt-2 text-3xl font-black">Data Panel</h2>
              {selectedProduct && (
                <div className="mt-4 rounded-3xl border border-lime-300/20 bg-lime-300/10 p-4">
                  <p className="text-sm font-black text-lime-200">{selectedProduct.name}</p>
                  <p className="mt-1 text-2xl font-black text-white">{rupiah(selectedProduct.price)}</p>
                </div>
              )}

              <label className="mt-5 block text-sm font-black text-zinc-300">Username panel</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="contoh: darmahost"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-lime-300/60"
              />

              <label className="mt-4 block text-sm font-black text-zinc-300">Nama server</label>
              <input
                value={serverName}
                onChange={(event) => setServerName(event.target.value)}
                placeholder="contoh: Bot WhatsApp Utama"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-lime-300/60"
              />

              <label className="mt-4 block text-sm font-black text-zinc-300">Catatan opsional</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Catatan untuk admin, misal egg/runtime yang diinginkan."
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-lime-300/60"
              />

              <button
                type="button"
                onClick={submitOrder}
                disabled={ordering || !selectedProduct}
                className="mt-5 w-full rounded-2xl bg-lime-300 px-5 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ordering ? 'Memproses...' : 'Order Panel'}
              </button>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-zinc-500">
                D-Balance akan dipotong saat order dibuat. Jika admin membatalkan, saldo bisa direfund dari dashboard admin.
              </p>
            </aside>
          </div>

          <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Riwayat</p>
                <h2 className="mt-1 text-2xl font-black">Order Panel Kamu</h2>
              </div>
              <button onClick={loadOrders} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black text-zinc-300">Refresh</button>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm font-bold text-zinc-500">Belum ada order panel.</div>
            ) : (
              <div className="grid gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{order.public_order_id}</p>
                        <h3 className="mt-1 text-lg font-black text-white">{order.server_name || 'Panel Server'}</h3>
                        <p className="mt-1 text-sm font-bold text-zinc-400">Username: {order.requested_username || '-'}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-300">{rupiah(order.amount)}</span>
                      </div>
                    </div>

                    {order.provisioned_panel_url && (
                      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-100">
                        <p>Panel URL: {order.provisioned_panel_url}</p>
                        <p>Username: {order.provisioned_username || '-'}</p>
                        <p>Password: {order.provisioned_password || '-'}</p>
                      </div>
                    )}
                    {order.admin_notes && <p className="mt-3 text-sm font-semibold text-zinc-400">Catatan admin: {order.admin_notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
