import { useState } from 'react';

export default function DownloadPage() {
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [status, setStatus] = useState('');
  const [url, setUrl] = useState('');

  async function claim() {
    setStatus('Meminta akses download...');
    setUrl('');
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, productId, buyerEmail })
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Download gagal.');
    setUrl(data.url);
    setStatus('Akses siap. Link berlaku 10 menit.');
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-xl rounded-[2.5rem] p-6 md:p-8"><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE VAULT</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Download Produk</h1><p className="mt-3 font-semibold text-slate-600">Masukkan email pembeli, Order ID, dan Product ID.</p><input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="mt-5 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Email pembeli" type="email" /><input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="mt-3 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Order ID" /><input value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-3 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Product ID" /><button onClick={claim} disabled={!buyerEmail || !orderId || !productId} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-sm disabled:opacity-50">Ambil Link</button>{status && <p className="mt-4 font-semibold">{status}</p>}{url && <a href={url} className="mt-4 inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Download Sekarang</a>}</section></main>;
}
