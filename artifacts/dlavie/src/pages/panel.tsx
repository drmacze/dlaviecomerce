import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Blocks,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Gauge,
  HardDrive,
  Layers3,
  LockKeyhole,
  MemoryStick,
  MousePointer2,
  Network,
  PackageCheck,
  RefreshCcw,
  Rocket,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UserCircle2,
  Zap
} from 'lucide-react';
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

type ToastTone = 'info' | 'success' | 'warning' | 'danger';

type UiMessage = {
  text: string;
  tone: ToastTone;
};

const rupiah = (value: number) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function formatGb(mb: number) {
  const gb = Number(mb || 0) / 1024;
  return Number.isInteger(gb) ? `${gb} GB` : `${gb.toFixed(1)} GB`;
}

function randomKey() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
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
  if (value === 'fulfilled') return 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100 shadow-emerald-400/10';
  if (value === 'failed' || value === 'cancelled') return 'border-rose-300/40 bg-rose-400/15 text-rose-100 shadow-rose-400/10';
  if (value === 'refunded') return 'border-sky-300/40 bg-sky-400/15 text-sky-100 shadow-sky-400/10';
  return 'border-amber-300/40 bg-amber-400/15 text-amber-100 shadow-amber-400/10';
}

function orderStepIndex(status: string) {
  const value = String(status || '').toLowerCase();
  if (value === 'fulfilled') return 3;
  if (value === 'failed' || value === 'refunded' || value === 'cancelled') return 2;
  return 1;
}

function intensityScore(product?: PanelProduct) {
  if (!product) return 0;
  return Math.min(100, Math.round((product.ram_mb / 8192) * 48 + (product.cpu_percent / 300) * 32 + (product.disk_mb / 40960) * 20));
}

function productAccent(index: number) {
  const accents = [
    {
      ring: 'hover:border-lime-300/60',
      glow: 'from-lime-300/24 via-emerald-300/12 to-cyan-300/22',
      icon: 'from-lime-300/25 to-emerald-400/20 text-lime-100',
      chip: 'border-lime-300/25 bg-lime-300/10 text-lime-100',
      core: 'bg-lime-300'
    },
    {
      ring: 'hover:border-cyan-300/60',
      glow: 'from-cyan-300/24 via-sky-300/12 to-violet-300/22',
      icon: 'from-cyan-300/25 to-sky-400/20 text-cyan-100',
      chip: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
      core: 'bg-cyan-300'
    },
    {
      ring: 'hover:border-fuchsia-300/60',
      glow: 'from-fuchsia-300/24 via-violet-300/12 to-cyan-300/22',
      icon: 'from-fuchsia-300/25 to-violet-400/20 text-fuchsia-100',
      chip: 'border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100',
      core: 'bg-fuchsia-300'
    },
    {
      ring: 'hover:border-amber-300/60',
      glow: 'from-amber-300/24 via-orange-300/12 to-rose-300/22',
      icon: 'from-amber-300/25 to-orange-400/20 text-amber-100',
      chip: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
      core: 'bg-amber-300'
    }
  ];
  return accents[index % accents.length];
}

function messageClass(tone: ToastTone) {
  if (tone === 'success') return 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100';
  if (tone === 'warning') return 'border-amber-300/25 bg-amber-400/10 text-amber-100';
  if (tone === 'danger') return 'border-rose-300/25 bg-rose-400/10 text-rose-100';
  return 'border-white/10 bg-white/[0.055] text-zinc-200';
}

function copyText(value: string) {
  if (!value) return;
  navigator.clipboard.writeText(value).catch(() => null);
}

function useCases(product?: PanelProduct) {
  if (!product) return ['Bot ringan', 'Testing', 'Starter'];
  if (product.ram_mb >= 8192) return ['Multi-bot', 'API aktif', 'Komunitas besar'];
  if (product.ram_mb >= 4096) return ['Bot aktif', 'Node API', 'Server komunitas'];
  if (product.ram_mb >= 2048) return ['Bot WA', 'Bot Telegram', 'Harian'];
  return ['Bot ringan', 'Testing', 'Starter'];
}

function Orb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0.35, scale: 0.92 }}
      animate={{ opacity: [0.28, 0.58, 0.28], y: [0, -18, 0], x: [0, 10, 0], scale: [0.95, 1.04, 0.95] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay }}
      className={className}
    />
  );
}

function CircuitBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_72%)]" />
      <motion.div
        animate={{ x: ['-20%', '120%'] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
        className="absolute top-28 h-px w-1/3 bg-gradient-to-r from-transparent via-lime-300/70 to-transparent"
      />
      <motion.div
        animate={{ x: ['120%', '-20%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-40 h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-300/55 to-transparent"
      />
    </div>
  );
}

function MetricTile({ icon, label, value, helper }: { icon: ReactNode; label: string; value: string; helper: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4 transition hover:border-white/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.075] to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-zinc-100 shadow-inner shadow-white/5">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
          <p className="mt-1 text-lg font-black text-white">{value}</p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-500">{helper}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SpecChip({ icon, label, value, strong = false }: { icon: ReactNode; label: string; value: string | number; strong?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      className={`group rounded-2xl border px-3 py-3 transition ${strong ? 'border-white/18 bg-white/[0.08]' : 'border-white/10 bg-black/25 hover:bg-white/[0.055]'}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-100 transition group-hover:scale-105">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
          <p className="truncate text-sm font-black text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PowerRing({ score, accent }: { score: number; accent: ReturnType<typeof productAccent> }) {
  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/35">
      <div className="absolute inset-2 rounded-full border border-white/10" />
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_90deg,transparent,rgba(190,255,90,0.65),transparent,rgba(34,211,238,0.55),transparent)] opacity-80 blur-[1px]"
      />
      <div className="absolute inset-[3px] rounded-full bg-[#08080d]" />
      <div className={`absolute bottom-3 h-1.5 w-1.5 rounded-full ${accent.core} shadow-[0_0_24px_currentColor]`} />
      <div className="relative text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Power</p>
        <p className="text-2xl font-black text-white">{score}</p>
      </div>
    </div>
  );
}

function ProductBlueprint({ product, index }: { product?: PanelProduct; index: number }) {
  const accent = productAccent(index);
  const score = intensityScore(product);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent.glow}`} />
      <div className="absolute inset-[1px] rounded-[calc(1.75rem-1px)] bg-[#07070b]/90" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Live blueprint</p>
          <h3 className="mt-2 text-xl font-black text-white">{product?.name || 'Pilih paket panel'}</h3>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-zinc-400">Resource dipetakan agar user cepat paham fungsi paket.</p>
        </div>
        <PowerRing score={score} accent={accent} />
      </div>
      <div className="relative mt-4 grid grid-cols-3 gap-2">
        {useCases(product).map((item) => (
          <span key={item} className={`rounded-2xl border px-3 py-2 text-center text-[11px] font-black ${accent.chip}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function PackageCard({ product, index, selected, onSelect }: { product: PanelProduct; index: number; selected: boolean; onSelect: () => void }) {
  const accent = productAccent(index);
  const score = intensityScore(product);
  const stockText = product.stock === null || product.stock === undefined ? 'Ready' : product.stock > 0 ? `${product.stock} stok` : 'Habis';

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.055 }}
      whileHover={{ y: -8, scale: 1.012 }}
      className={`group relative overflow-hidden rounded-[2.2rem] border p-5 text-left transition duration-300 ${
        selected ? 'border-white/35 bg-white/[0.08] shadow-[0_24px_90px_-38px_rgba(190,255,90,0.7)]' : `border-white/10 bg-white/[0.045] ${accent.ring}`
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.glow} opacity-90`} />
      <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2.2rem-1px)] bg-[#08080d]/92" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/16" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none absolute left-8 top-0 h-px w-24 bg-gradient-to-r from-transparent via-white/45 to-transparent" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br ${accent.icon}`}>
              <ServerCog size={27} />
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.12, 0.9] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute -right-1 -top-1 h-3 w-3 rounded-full ${accent.core}`}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Pterodactyl Panel</p>
                <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] font-black text-zinc-300">{stockText}</span>
              </div>
              <h3 className="mt-2 text-2xl font-black leading-tight text-white">{product.name}</h3>
              <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-zinc-400">{product.description}</p>
            </div>
          </div>

          {product.badge && (
            <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${accent.chip}`}>{product.badge}</span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SpecChip icon={<MemoryStick size={16} />} label="RAM" value={formatGb(product.ram_mb)} strong />
          <SpecChip icon={<Cpu size={16} />} label="CPU" value={`${product.cpu_percent}%`} strong />
          <SpecChip icon={<HardDrive size={16} />} label="Disk" value={formatGb(product.disk_mb)} />
          <SpecChip icon={<Database size={16} />} label="Database" value={product.database_limit} />
          <SpecChip icon={<Layers3 size={16} />} label="Backup" value={product.backup_limit} />
          <SpecChip icon={<Network size={16} />} label="Alloc" value={product.allocation_limit} />
        </div>

        <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-black/25 p-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Power index</p>
              <p className="text-xs font-black text-zinc-300">{score}/100</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.85, delay: 0.1 + index * 0.05 }}
                className={`h-full rounded-full ${accent.core}`}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Harga</p>
            <p className="mt-1 text-3xl font-black text-white">{rupiah(product.price)}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span>{product.duration_days} hari aktif</span>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition ${selected ? 'border-lime-300 bg-lime-300 text-black' : 'border-white/10 text-zinc-200'}`}>
            {selected ? 'Dipilih' : 'Pilih Paket'}
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-black shadow-lg ${statusClass(status)}`}>{statusLabel(status)}</span>;
}

function OrderTimeline({ status }: { status: string }) {
  const active = orderStepIndex(status);
  const steps = [
    { label: 'Order', icon: <PackageCheck size={14} /> },
    { label: 'Admin', icon: <ServerCog size={14} /> },
    { label: 'Panel', icon: <TerminalSquare size={14} /> },
    { label: 'Aktif', icon: <BadgeCheck size={14} /> }
  ];

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {steps.map((step, index) => {
        const isActive = index <= active;
        return (
          <div key={step.label} className={`rounded-2xl border px-2 py-2 text-center ${isActive ? 'border-lime-300/25 bg-lime-300/10 text-lime-100' : 'border-white/10 bg-white/[0.03] text-zinc-500'}`}>
            <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-xl border border-current/20 bg-black/20">{step.icon}</div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em]">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function CredentialBox({ label, value, copied, copyKey, onCopy, link }: { label: string; value?: string | null; copied: string; copyKey: string; onCopy: (key: string, value: string) => void; link?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/70">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-2">
        <p className="break-all text-sm font-bold text-white">{value || '-'}</p>
        <button
          type="button"
          onClick={() => onCopy(copyKey, value || '')}
          className="rounded-lg border border-white/10 p-2 text-white/80 transition hover:bg-white/10"
        >
          {copied === copyKey ? <CheckCircle2 size={14} /> : <Copy size={14} />}
        </button>
      </div>
      {link && value && (
        <a href={value} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-black text-emerald-200">
          Buka panel <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}

export default function PanelStorefrontPage() {
  const [products, setProducts] = useState<PanelProduct[]>([]);
  const [orders, setOrders] = useState<PanelOrder[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [username, setUsername] = useState('');
  const [serverName, setServerName] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<UiMessage>({ text: 'Memuat paket panel...', tone: 'info' });
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [copied, setCopied] = useState('');

  const selectedIndex = useMemo(() => Math.max(0, products.findIndex((item) => item.id === selectedId)), [products, selectedId]);
  const selectedProduct = useMemo(() => products.find((item) => item.id === selectedId) || products[0], [products, selectedId]);
  const selectedAccent = productAccent(selectedIndex);
  const selectedScore = intensityScore(selectedProduct);

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
    if (!token) {
      setOrders([]);
      return;
    }

    const res = await fetch('/api/panel/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setOrders(json.orders || []);
  }

  async function boot() {
    setLoading(true);
    setMessage({ text: 'Memuat paket panel...', tone: 'info' });
    try {
      await loadProducts();
      await loadOrders();
      setMessage({ text: 'Pilih paket, isi data server, lalu checkout dengan D-Balance.', tone: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Gagal memuat halaman panel.', tone: 'danger' });
    } finally {
      setLoading(false);
    }
  }

  async function submitOrder() {
    if (!selectedProduct) return setMessage({ text: 'Pilih paket panel terlebih dahulu.', tone: 'warning' });
    if (username.trim().length < 4) return setMessage({ text: 'Username panel minimal 4 karakter.', tone: 'warning' });
    if (serverName.trim().length < 3) return setMessage({ text: 'Nama server minimal 3 karakter.', tone: 'warning' });

    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setMessage({ text: 'Login dulu untuk membeli panel.', tone: 'warning' });
      return;
    }

    setOrdering(true);
    setMessage({ text: 'Membuat order panel...', tone: 'info' });
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
      setMessage({ text: json.message || 'Order panel berhasil dibuat.', tone: 'success' });
      await loadOrders();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Order panel gagal dibuat.', tone: 'danger' });
    } finally {
      setOrdering(false);
    }
  }

  function handleCopy(key: string, value: string) {
    if (!value) return;
    copyText(value);
    setCopied(key);
  }

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(''), 1300);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      <section className="relative px-4 py-7 md:px-8 md:py-10">
        <CircuitBackground />
        <Orb className="absolute left-[-9%] top-[-8%] h-80 w-80 rounded-full bg-lime-300/12 blur-3xl" />
        <Orb className="absolute right-[-12%] top-[8%] h-96 w-96 rounded-full bg-cyan-400/12 blur-3xl" delay={1.2} />
        <Orb className="absolute bottom-[-14%] left-[20%] h-80 w-80 rounded-full bg-fuchsia-400/12 blur-3xl" delay={2.2} />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-7 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/30 md:p-8"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,255,90,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_25%)]" />
              <div className="absolute right-6 top-6 hidden rounded-[1.4rem] border border-white/10 bg-black/25 p-3 md:block">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                  <Activity size={14} className="text-lime-300" /> Live Store
                </div>
              </div>

              <div className="relative">
                <a href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08]">
                  ← Kembali
                </a>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-lime-200">Dlavie Panel Store</span>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">Pterodactyl • D-Balance</span>
                </div>

                <h1 className="mt-5 max-w-5xl text-4xl font-black tracking-tight md:text-7xl">
                  Panel marketplace yang terasa seperti control room digital.
                </h1>
                <p className="mt-4 max-w-3xl text-base font-semibold leading-relaxed text-zinc-400 md:text-lg">
                  Bukan text-only: setiap paket punya icon resource, power index, use-case badge, motion layer, checkout ringkas, dan riwayat order yang siap menampilkan credential panel.
                </p>

                <div className="mt-7 grid gap-3 md:grid-cols-3">
                  <MetricTile icon={<ShieldCheck size={18} className="text-emerald-200" />} label="Flow" value="Manual-safe" helper="Aman sebelum auto provisioning." />
                  <MetricTile icon={<Zap size={18} className="text-lime-200" />} label="Checkout" value="D-Balance" helper="Saldo internal langsung dipakai." />
                  <MetricTile icon={<MousePointer2 size={18} className="text-cyan-200" />} label="UX" value="Interactive" helper="Hover, motion, copy credential." />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-4">
              <ProductBlueprint product={selectedProduct} index={selectedIndex} />
              <div className={`rounded-[1.75rem] border p-4 text-sm font-bold leading-relaxed ${messageClass(message.tone)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25">
                    {loading ? <RefreshCcw size={16} className="animate-spin" /> : message.tone === 'success' ? <CheckCircle2 size={16} /> : message.tone === 'danger' ? <AlertCircle size={16} /> : <Sparkles size={16} />}
                  </div>
                  <p>{loading ? 'Loading...' : message.text}</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Roadmap sistem</p>
                <div className="mt-3 space-y-2">
                  {['Order masuk antrean admin', 'Admin fulfill credential', 'Auto-create Pterodactyl API'].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${index === 0 ? 'bg-lime-300 text-black' : 'bg-white/10 text-zinc-300'}`}>{index + 1}</div>
                      <p className="text-sm font-black text-zinc-200">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_410px]">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Pilih paket</p>
                  <h2 className="mt-1 text-2xl font-black">Resource card dengan detail visual</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-zinc-300">{products.length} Paket</span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {products.map((product, index) => (
                  <PackageCard key={product.id} product={product} index={index} selected={product.id === selectedProduct?.id} onSelect={() => setSelectedId(product.id)} />
                ))}
              </div>
            </section>

            <aside className="h-fit lg:sticky lg:top-6">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/35 backdrop-blur-xl">
                <div className="relative border-b border-white/10 p-5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedAccent.glow}`} />
                  <div className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Checkout panel</p>
                    <h2 className="mt-1 text-3xl font-black">Data server</h2>

                    {selectedProduct && (
                      <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-black/35 p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${selectedAccent.icon}`}>
                            <ServerCog size={24} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-lg font-black text-white">{selectedProduct.name}</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-400">Power index {selectedScore}/100</p>
                            <p className="mt-3 text-3xl font-black text-white">{rupiah(selectedProduct.price)}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <SpecChip icon={<MemoryStick size={15} />} label="RAM" value={formatGb(selectedProduct.ram_mb)} strong />
                          <SpecChip icon={<Cpu size={15} />} label="CPU" value={`${selectedProduct.cpu_percent}%`} strong />
                          <SpecChip icon={<HardDrive size={15} />} label="Disk" value={formatGb(selectedProduct.disk_mb)} />
                          <SpecChip icon={<Clock3 size={15} />} label="Durasi" value={`${selectedProduct.duration_days} hari`} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <label className="block text-sm font-black text-zinc-300">Username panel</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition focus-within:border-lime-300/60 focus-within:bg-black/45">
                    <UserCircle2 size={18} className="text-zinc-500" />
                    <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="contoh: darmahost" className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-zinc-500" />
                  </div>

                  <label className="mt-4 block text-sm font-black text-zinc-300">Nama server</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition focus-within:border-lime-300/60 focus-within:bg-black/45">
                    <TerminalSquare size={18} className="text-zinc-500" />
                    <input value={serverName} onChange={(event) => setServerName(event.target.value)} placeholder="contoh: Bot WhatsApp Utama" className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-zinc-500" />
                  </div>

                  <label className="mt-4 block text-sm font-black text-zinc-300">Catatan opsional</label>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Request egg/runtime, catatan install, atau kebutuhan khusus." rows={4} className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-zinc-500 transition focus:border-lime-300/60 focus:bg-black/45" />

                  <button type="button" onClick={submitOrder} disabled={ordering || !selectedProduct} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-18px_rgba(190,255,90,0.85)] disabled:cursor-not-allowed disabled:opacity-60">
                    {ordering ? 'Memproses...' : 'Order Panel Sekarang'}
                    <ArrowRight size={16} />
                  </button>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                          <LockKeyhole size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">Saldo aman & tercatat</p>
                          <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-400">D-Balance dipotong saat order dibuat, lalu order masuk antrean admin dengan event log.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>

          <section className="mt-10 rounded-[2.2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/25 md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Riwayat order</p>
                <h2 className="mt-1 text-2xl font-black">Order panel kamu</h2>
              </div>
              <button onClick={loadOrders} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08]">
                <RefreshCcw size={14} /> Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-[1.7rem] border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400">
                  <AlertCircle size={26} />
                </div>
                <p className="mt-4 text-lg font-black text-white">Belum ada order panel</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">Setelah checkout, timeline dan detail credential panel akan muncul di sini.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {orders.map((order, index) => (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, delay: index * 0.04 }} className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/25">
                      <div className="border-b border-white/10 p-4 md:p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{order.public_order_id}</p>
                            <h3 className="mt-1 text-xl font-black text-white">{order.server_name || 'Panel Server'}</h3>
                            <p className="mt-1 text-sm font-bold text-zinc-400">Username request: {order.requested_username || '-'}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <StatusPill status={order.status} />
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-zinc-200">{rupiah(order.amount)}</span>
                          </div>
                        </div>
                        <OrderTimeline status={order.status} />
                      </div>

                      <div className="p-4 md:p-5">
                        {order.provisioned_panel_url ? (
                          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <CheckCircle2 size={18} className="text-emerald-300" />
                              <p className="text-sm font-black text-emerald-100">Detail panel tersedia</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                              <CredentialBox label="Panel URL" value={order.provisioned_panel_url} copied={copied} copyKey={`url-${order.id}`} onCopy={handleCopy} link />
                              <CredentialBox label="Username" value={order.provisioned_username} copied={copied} copyKey={`user-${order.id}`} onCopy={handleCopy} />
                              <CredentialBox label="Password" value={order.provisioned_password} copied={copied} copyKey={`pass-${order.id}`} onCopy={handleCopy} />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
                                <Clock3 size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-white">Order masih diproses admin</p>
                                <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-400">Setelah admin membuat panel, URL, username, dan password akan tampil otomatis di kartu ini.</p>
                              </div>
                              <ChevronRight size={18} className="ml-auto hidden text-zinc-600 md:block" />
                            </div>
                          </div>
                        )}

                        {order.admin_notes && (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Catatan admin</p>
                            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-300">{order.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
