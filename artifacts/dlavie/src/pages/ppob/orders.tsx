import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type PpobOrder = {
  id: string;
  public_order_id?: string | null;
  ref_id: string;
  provider: string;
  sku_code: string;
  product_name: string;
  customer_no: string;
  selling_price: number;
  status: string;
  provider_status?: string | null;
  provider_message?: string | null;
  serial_number?: string | null;
  created_at: string;
  updated_at?: string | null;
  settled_at?: string | null;
  refunded_at?: string | null;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const fmt = (value?: string | null) => value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value === 'success') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25';
  if (value === 'failed') return 'bg-red-500/15 text-red-300 border-red-400/25';
  return 'bg-yellow-500/15 text-yellow-200 border-yellow-400/25';
}

export default function PpobOrdersPage() {
  const [orders, setOrders] = useState<PpobOrder[]>([]);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Memuat riwayat PPOB...');
  const [checkingId, setCheckingId] = useState('');

  async function loadOrders(accessToken: string) {
    setStatus('Memuat riwayat PPOB...');
    const res = await fetch('/api/ppob/orders', { headers: { Authorization: `Bearer ${accessToken}` } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(json.error || 'Gagal memuat riwayat PPOB.');
      return;
    }
    setOrders(Array.isArray(json.orders) ? json.orders : []);
    setStatus(json.orders?.length ? 'Riwayat PPOB siap.' : 'Belum ada transaksi PPOB.');
  }

  async function checkStatus(order: PpobOrder) {
    if (!token) return;
    setCheckingId(order.id);
    try {
      const res = await fetch('/api/ppob/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ public_order_id: order.public_order_id, order_id: order.id })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) alert(json.error || 'Cek status gagal.');
      await loadOrders(token);
    } finally {
      setCheckingId('');
    }
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const accessToken = data.session?.access_token || '';
      setToken(accessToken);
      if (!accessToken) {
        setStatus('Login diperlukan untuk melihat riwayat PPOB.');
        return;
      }
      loadOrders(accessToken).catch(() => setStatus('Gagal memuat riwayat PPOB.'));
    }).catch(() => setStatus('Gagal membaca sesi login.'));
  }, []);

  return (
    <main className="min-h-screen bg-[#050507] px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Dlavie PPOB</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Riwayat Transaksi</h1>
            <p className="mt-2 text-sm font-semibold text-zinc-400">Lihat Order ID, status provider, SN/token, dan refund.</p>
          </div>
          <div className="flex gap-2">
            <a href="/ppob" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-zinc-200">Katalog</a>
            <button onClick={() => token && loadOrders(token)} className="rounded-xl bg-lime-300 px-4 py-3 text-sm font-black text-black">Refresh</button>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-zinc-300">{status}</div>

        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-white/10 bg-[#0b0b10] p-4 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClass(order.status)}`}>{order.status}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-400">{order.provider}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-black">{order.product_name}</h2>
                  <p className="mt-1 text-sm font-bold text-zinc-500">{order.customer_no} · {order.sku_code}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-black text-lime-300">{rupiah(order.selling_price)}</p>
                  <p className="mt-1 text-xs font-bold text-zinc-500">{fmt(order.created_at)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
                <Info label="Order ID" value={order.public_order_id || order.id} />
                <Info label="Provider Ref" value={order.ref_id} />
                <Info label="Provider Status" value={order.provider_status || '-'} />
                <Info label="SN / Token" value={order.serial_number || '-'} strong />
                <Info label="Pesan Provider" value={order.provider_message || '-'} />
                <Info label="Selesai" value={fmt(order.settled_at)} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => checkStatus(order)} disabled={checkingId === order.id || order.status === 'success'} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
                  {checkingId === order.id ? 'Mengecek...' : 'Cek Status'}
                </button>
                {order.serial_number && <button onClick={() => navigator.clipboard?.writeText(order.serial_number || '')} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-200">Copy SN</button>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">{label}</p>
      <p className={`mt-1 break-words text-sm ${strong ? 'font-black text-lime-300' : 'font-bold text-zinc-300'}`}>{value}</p>
    </div>
  );
}
