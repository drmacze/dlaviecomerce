import { useState } from 'react';

export default function DownloadPage() {
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState('');
  const [url, setUrl] = useState('');

  async function claim() {
    setStatus('Meminta akses download...');
    setUrl('');
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, productId })
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Download gagal.');
    setUrl(data.url);
    setStatus('Akses siap. Link berlaku 10 menit.');
  }

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Download Produk</h1><p className="mt-3 font-semibold text-slate-600">Masukkan Order ID dan Product ID untuk mengambil signed URL produk digital.</p><input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="mt-5 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Order ID" /><input value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Product ID" /><button onClick={claim} className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Ambil Link</button>{status && <p className="mt-4 font-semibold">{status}</p>}{url && <a href={url} className="mt-4 inline-block rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-black shadow-brutal-sm">Download Sekarang</a>}</section></main>;
}
