import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  LockKeyhole,
  RefreshCcw,
  RotateCcw,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UserCircle2,
  WalletCards,
  XCircle
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Customer = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  role?: string | null;
  d_balance?: number | null;
};

type PanelOrder = {
  id: string;
  user_id: string;
  public_order_id: string;
  status: string;
  amount: number;
  requested_username?: string | null;
  server_name?: string | null;
  notes?: string | null;
  provisioned_panel_url?: string | null;
  provisioned_username?: string | null;
  provisioned_password?: string | null;
  provisioned_server_id?: string | null;
  admin_notes?: string | null;
  product_snapshot?: Record<string, any> | null;
  created_at: string;
  fulfilled_at?: string | null;
  expires_at?: string | null;
  customer?: Customer | null;
};

type UiMessage = {
  tone: 'info' | 'success' | 'warning' | 'danger';
  text: string;
};

type FulfillForm = {
  panel_url: string;
  panel_username: string;
  panel_password: string;
  server_id: string;
  admin_notes: string;
};

const statusOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'pending_fulfillment', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const rupiah = (value: number) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function messageClass(tone: UiMessage['tone']) {
  if (tone === 'success') return 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100';
  if (tone === 'warning') return 'border-amber-300/25 bg-amber-400/10 text-amber-100';
  if (tone === 'danger') return 'border-rose-300/25 bg-rose-400/10 text-rose-100';
  return 'border-white/10 bg-white/[0.055] text-zinc-200';
}

function statusClass(status: string) {
  const value = String(status || '').toLowerCase();
  if (value === 'fulfilled') return 'border-emerald-300/35 bg-emerald-400/15 text-emerald-100';
  if (value === 'refunded') return 'border-sky-300/35 bg-sky-400/15 text-sky-100';
  if (value === 'failed' || value === 'cancelled') return 'border-rose-300/35 bg-rose-400/15 text-rose-100';
  if (value === 'processing') return 'border-cyan-300/35 bg-cyan-400/15 text-cyan-100';
  return 'border-amber-300/35 bg-amber-400/15 text-amber-100';
}

function statusLabel(status: string) {
  const value = String(status || '').toLowerCase();
  if (value === 'pending_fulfillment') return 'Pending';
  if (value === 'processing') return 'Processing';
  if (value === 'fulfilled') return 'Fulfilled';
  if (value === 'refunded') return 'Refunded';
  if (value === 'failed') return 'Failed';
  if (value === 'cancelled') return 'Cancelled';
  return value || '-';
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function copyText(value: string) {
  if (!value) return;
  navigator.clipboard.writeText(value).catch(() => null);
}

function getProductName(order?: PanelOrder | null) {
  return String(order?.product_snapshot?.name || order?.product_snapshot?.slug || 'Panel Package');
}

function getProductSpec(order?: PanelOrder | null) {
  const snapshot = order?.product_snapshot || {};
  const ram = Number(snapshot.ram_mb || 0) / 1024;
  const cpu = Number(snapshot.cpu_percent || 0);
  const disk = Number(snapshot.disk_mb || 0) / 1024;
  return `${ram || '-'}GB RAM • ${cpu || '-'}% CPU • ${disk || '-'}GB Disk`;
}

function StatTile({ icon, label, value, helper }: { icon: ReactNode; label: string; value: string; helper: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/15">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-lime-200">{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-white">{value}</p>
          <p className="mt-1 text-xs font-semibold text-zinc-500">{helper}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:bg-black/50"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-300">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:bg-black/50"
      />
    </label>
  );
}

function CredentialPreview({ label, value, copied, copyKey, onCopy, link }: { label: string; value?: string | null; copied: string; copyKey: string; onCopy: (key: string, value: string) => void; link?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-2">
        <p className="break-all text-sm font-bold text-white">{value || '-'}</p>
        {value && (
          <button type="button" onClick={() => onCopy(copyKey, value)} className="rounded-lg border border-white/10 p-2 text-white/80 transition hover:bg-white/10">
            {copied === copyKey ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
      {link && value && (
        <a href={value} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-black text-emerald-200">
          Buka panel <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}

export default function AdminPanelOrdersPage() {
  const [orders, setOrders] = useState<PanelOrder[]>([]);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState<UiMessage>({ tone: 'info', text: 'Memuat order panel...' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');
  const [form, setForm] = useState<FulfillForm>({ panel_url: '', panel_username: '', panel_password: '', server_id: '', admin_notes: '' });

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter((order) => {
      return [
        order.public_order_id,
        order.server_name,
        order.requested_username,
        order.customer?.email,
        order.customer?.display_name,
        getProductName(order)
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [orders, query]);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId) || orders[0] || null, [orders, selectedId]);
  const pendingCount = orders.filter((order) => order.status === 'pending_fulfillment').length;
  const fulfilledCount = orders.filter((order) => order.status === 'fulfilled').length;
  const totalRevenue = orders.filter((order) => order.status !== 'refunded' && order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.amount || 0), 0);

  async function getToken() {
    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token || '';
  }

  async function loadOrders(nextStatus = status) {
    setLoading(true);
    setMessage({ tone: 'info', text: 'Memuat order panel...' });
    try {
      const token = await getToken();
      if (!token) throw new Error('Login admin diperlukan.');
      const params = new URLSearchParams();
      params.set('status', nextStatus);
      const res = await fetch(`/api/admin/panel-orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Gagal memuat order panel.');
      setOrders(json.orders || []);
      if (!selectedId && json.orders?.[0]?.id) setSelectedId(json.orders[0].id);
      setMessage({ tone: 'success', text: 'Order panel berhasil dimuat.' });
    } catch (error) {
      setMessage({ tone: 'danger', text: error instanceof Error ? error.message : 'Gagal memuat order panel.' });
    } finally {
      setLoading(false);
    }
  }

  function syncFormFromOrder(order: PanelOrder | null) {
    setForm({
      panel_url: order?.provisioned_panel_url || '',
      panel_username: order?.provisioned_username || order?.requested_username || '',
      panel_password: order?.provisioned_password || '',
      server_id: order?.provisioned_server_id || '',
      admin_notes: order?.admin_notes || ''
    });
  }

  async function adminAction(body: Record<string, unknown>, successMessage: string) {
    setSaving(true);
    setMessage({ tone: 'info', text: 'Memproses aksi admin...' });
    try {
      const token = await getToken();
      if (!token) throw new Error('Login admin diperlukan.');
      const res = await fetch('/api/admin/panel-orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || json.message || 'Aksi admin gagal.');
      setMessage({ tone: 'success', text: json.message || successMessage });
      await loadOrders(status);
    } catch (error) {
      setMessage({ tone: 'danger', text: error instanceof Error ? error.message : 'Aksi admin gagal.' });
    } finally {
      setSaving(false);
    }
  }

  async function fulfillSelected() {
    if (!selectedOrder) return setMessage({ tone: 'warning', text: 'Pilih order terlebih dahulu.' });
    await adminAction(
      {
        action: 'fulfill',
        order_id: selectedOrder.id,
        panel_url: form.panel_url,
        panel_username: form.panel_username,
        panel_password: form.panel_password,
        server_id: form.server_id,
        admin_notes: form.admin_notes
      },
      'Order panel berhasil difulfill.'
    );
  }

  async function markProcessing() {
    if (!selectedOrder) return setMessage({ tone: 'warning', text: 'Pilih order terlebih dahulu.' });
    await adminAction({ action: 'status', order_id: selectedOrder.id, status: 'processing', admin_notes: form.admin_notes || 'Order sedang diproses admin.' }, 'Status diubah menjadi processing.');
  }

  async function refundSelected() {
    if (!selectedOrder) return setMessage({ tone: 'warning', text: 'Pilih order terlebih dahulu.' });
    await adminAction({ action: 'refund', order_id: selectedOrder.id, reason: form.admin_notes || 'Refund order panel oleh admin.' }, 'Refund panel berhasil diproses.');
  }

  async function failSelected() {
    if (!selectedOrder) return setMessage({ tone: 'warning', text: 'Pilih order terlebih dahulu.' });
    await adminAction({ action: 'status', order_id: selectedOrder.id, status: 'failed', admin_notes: form.admin_notes || 'Order panel gagal diproses.' }, 'Status diubah menjadi failed.');
  }

  function changeStatus(nextStatus: string) {
    setStatus(nextStatus);
    loadOrders(nextStatus);
  }

  function handleCopy(key: string, value: string) {
    copyText(value);
    setCopied(key);
  }

  useEffect(() => {
    loadOrders('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    syncFormFromOrder(selectedOrder);
  }, [selectedOrder?.id]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(''), 1300);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      <section className="relative px-4 py-7 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_75%)]" />
        <div className="absolute left-[-8%] top-[-8%] h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <a href="/panel" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black text-zinc-300 transition hover:bg-white/[0.08]">
                ← Ke Panel Store
              </a>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-300">Dlavie Admin Console</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">Panel fulfillment cockpit.</h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-zinc-400">
                Kelola order panel, isi credential, proses refund, dan ubah status tanpa membuka database manual.
              </p>
            </div>
            <div className={`rounded-[1.5rem] border p-4 text-sm font-bold md:max-w-sm ${messageClass(message.tone)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25">
                  {loading ? <RefreshCcw size={16} className="animate-spin" /> : message.tone === 'success' ? <CheckCircle2 size={16} /> : message.tone === 'danger' ? <AlertCircle size={16} /> : <Sparkles size={16} />}
                </div>
                <p>{message.text}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatTile icon={<Clock3 size={19} />} label="Pending" value={String(pendingCount)} helper="Menunggu proses admin" />
            <StatTile icon={<BadgeCheck size={19} />} label="Fulfilled" value={String(fulfilledCount)} helper="Panel sudah dikirim" />
            <StatTile icon={<WalletCards size={19} />} label="Volume" value={rupiah(totalRevenue)} helper="Order non-refund/non-cancel" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="rounded-[2.2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/25 md:p-5">
              <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <Search size={17} className="text-zinc-500" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari order, email, username, produk..." className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-zinc-600" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                  {statusOptions.map((item) => (
                    <button key={item.value} onClick={() => changeStatus(item.value)} className={`shrink-0 rounded-2xl border px-3 py-2 text-xs font-black transition ${status === item.value ? 'border-lime-300 bg-lime-300 text-black' : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-white/[0.06]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="rounded-[1.7rem] border border-dashed border-white/10 p-8 text-center">
                  <AlertCircle className="mx-auto text-zinc-500" size={30} />
                  <p className="mt-3 text-lg font-black text-white">Belum ada order</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-500">Order panel akan tampil di sini setelah user checkout.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredOrders.map((order, index) => {
                    const selected = order.id === selectedOrder?.id;
                    return (
                      <motion.button
                        key={order.id}
                        type="button"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.025 }}
                        onClick={() => setSelectedId(order.id)}
                        className={`group overflow-hidden rounded-[1.6rem] border p-4 text-left transition ${selected ? 'border-lime-300/45 bg-lime-300/10 shadow-[0_18px_60px_-32px_rgba(190,255,90,0.8)]' : 'border-white/10 bg-black/25 hover:border-white/20 hover:bg-white/[0.055]'}`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-black text-zinc-300">{formatDate(order.created_at)}</span>
                            </div>
                            <h3 className="mt-3 text-lg font-black text-white">{order.server_name || 'Panel Server'}</h3>
                            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{order.public_order_id}</p>
                            <p className="mt-2 text-sm font-semibold text-zinc-400">{getProductName(order)} • {getProductSpec(order)}</p>
                            <p className="mt-1 text-sm font-bold text-zinc-500">User: {order.customer?.email || order.requested_username || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-white">{rupiah(order.amount)}</p>
                            <p className="mt-1 text-xs font-bold text-zinc-500">D-Balance purchase</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="h-fit lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="border-b border-white/10 bg-gradient-to-br from-lime-300/12 via-white/[0.03] to-cyan-300/10 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Selected order</p>
                  <h2 className="mt-1 text-2xl font-black text-white">{selectedOrder ? selectedOrder.server_name || 'Panel Server' : 'Pilih order'}</h2>
                  {selectedOrder && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Produk</p>
                        <p className="mt-1 text-sm font-black text-white">{getProductName(selectedOrder)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Harga</p>
                        <p className="mt-1 text-sm font-black text-white">{rupiah(selectedOrder.amount)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Request user</p>
                        <p className="mt-1 text-sm font-black text-white">{selectedOrder.requested_username || '-'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Saldo user</p>
                        <p className="mt-1 text-sm font-black text-white">{rupiah(Number(selectedOrder.customer?.d_balance || 0))}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedOrder ? (
                  <div className="p-5">
                    <div className="mb-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start gap-3">
                        <UserCircle2 size={18} className="mt-0.5 text-zinc-400" />
                        <div>
                          <p className="text-sm font-black text-white">{selectedOrder.customer?.display_name || selectedOrder.customer?.email || 'Customer'}</p>
                          <p className="mt-1 text-xs font-semibold text-zinc-500">{selectedOrder.customer?.email || selectedOrder.user_id}</p>
                          {selectedOrder.notes && <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-400">Catatan user: {selectedOrder.notes}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <Field label="Panel URL" value={form.panel_url} onChange={(value) => setForm((prev) => ({ ...prev, panel_url: value }))} placeholder="https://panel.domainkamu.com" />
                      <Field label="Username panel" value={form.panel_username} onChange={(value) => setForm((prev) => ({ ...prev, panel_username: value }))} placeholder="username login panel" />
                      <Field label="Password panel" value={form.panel_password} onChange={(value) => setForm((prev) => ({ ...prev, panel_password: value }))} placeholder="password login panel" />
                      <Field label="Server ID opsional" value={form.server_id} onChange={(value) => setForm((prev) => ({ ...prev, server_id: value }))} placeholder="ID server Pterodactyl" />
                      <TextArea label="Catatan admin" value={form.admin_notes} onChange={(value) => setForm((prev) => ({ ...prev, admin_notes: value }))} placeholder="Informasi tambahan untuk user / alasan status / refund" />
                    </div>

                    <div className="mt-5 grid gap-2 md:grid-cols-2">
                      <button disabled={saving} onClick={markProcessing} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-60">
                        <ServerCog size={16} /> Processing
                      </button>
                      <button disabled={saving} onClick={fulfillSelected} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-300 px-4 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 disabled:opacity-60">
                        <ArrowRight size={16} /> Fulfill
                      </button>
                      <button disabled={saving} onClick={refundSelected} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm font-black text-sky-100 transition hover:bg-sky-300/15 disabled:opacity-60">
                        <RotateCcw size={16} /> Refund
                      </button>
                      <button disabled={saving} onClick={failSelected} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-black text-rose-100 transition hover:bg-rose-300/15 disabled:opacity-60">
                        <XCircle size={16} /> Failed
                      </button>
                    </div>

                    {(selectedOrder.provisioned_panel_url || selectedOrder.provisioned_username || selectedOrder.provisioned_password) && (
                      <div className="mt-5 rounded-[1.6rem] border border-emerald-300/20 bg-emerald-400/10 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <ShieldCheck size={17} className="text-emerald-200" />
                          <p className="text-sm font-black text-emerald-100">Credential yang tersimpan</p>
                        </div>
                        <div className="grid gap-3">
                          <CredentialPreview label="Panel URL" value={selectedOrder.provisioned_panel_url} copied={copied} copyKey={`url-${selectedOrder.id}`} onCopy={handleCopy} link />
                          <CredentialPreview label="Username" value={selectedOrder.provisioned_username} copied={copied} copyKey={`user-${selectedOrder.id}`} onCopy={handleCopy} />
                          <CredentialPreview label="Password" value={selectedOrder.provisioned_password} copied={copied} copyKey={`pass-${selectedOrder.id}`} onCopy={handleCopy} />
                        </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <div className="flex items-start gap-3">
                        <LockKeyhole size={18} className="mt-0.5 text-lime-200" />
                        <p className="text-xs font-semibold leading-relaxed text-zinc-400">
                          Fulfill akan mengubah status menjadi fulfilled, menyimpan credential, menghitung expired berdasarkan durasi paket, dan user langsung bisa melihat detail panel di halaman /panel.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <CreditCard className="mx-auto text-zinc-500" size={34} />
                    <p className="mt-3 text-lg font-black text-white">Pilih order</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">Detail fulfillment akan muncul di sini.</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
