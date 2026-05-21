import { useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { VaultAccessCard } from '@/components/vault-access-card';

export default function DownloadPage() {
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [status, setStatus] = useState('Isi data order untuk membuka link download.');
  const [url, setUrl] = useState('');

  async function claim() {
    setStatus('Meminta akses download...');
    setUrl('');
    const res = await fetch('/api/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, productId, buyerEmail }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Download gagal.');
    setUrl(data.url);
    setStatus('Akses siap. Link berlaku 10 menit.');
  }

  const ready = Boolean(buyerEmail && orderId && productId);

  return <DlavieEcosystemPage eyebrow="DLAVIE VAULT" title="Download produk digital lewat vault." description="Masukkan data order untuk membuat link download sementara yang aman dan terkontrol." accent="#dfff4f" metrics={[{ label: 'Access', value: url ? 'READY' : 'LOCKED', hint: url ? 'Temporary link active' : 'Need valid order' }, { label: 'Expiry', value: '10m', hint: 'Download link window' }, { label: 'Fields', value: ready ? '3/3' : 'Check', hint: 'Required inputs' }, { label: 'Vault', value: 'Secure', hint: 'API protected' }]} actions={[{ label: 'Library', href: '/downloads' }, { label: 'Orders', href: '/orders' }, { label: 'Shop', href: '/#products', primary: true }]}><div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]"><VaultAccessCard status={status} downloadUrl={url} /><section className="dlavie-soft-card rounded-[2rem] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Claim Download</p><div className="mt-5 grid gap-3"><input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email pembeli" type="email" /><input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Order ID" /><input value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Product ID" /></div><button onClick={claim} disabled={!ready} className="mt-5 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-sm transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">Ambil Link Download</button><div className="mt-5 grid gap-3 sm:grid-cols-4"><a href="/downloads" className="rounded-[1.2rem] bg-[#dfff4f] p-4 text-sm font-black text-slate-950 ring-1 ring-black/5">Library</a><a href="/orders" className="rounded-[1.2rem] bg-white/75 p-4 text-sm font-black ring-1 ring-black/5">Orders</a><a href="/security" className="rounded-[1.2rem] bg-white/75 p-4 text-sm font-black ring-1 ring-black/5">Security</a><a href="/profile" className="rounded-[1.2rem] bg-white/75 p-4 text-sm font-black ring-1 ring-black/5">Profile</a></div></section></div></DlavieEcosystemPage>;
}
