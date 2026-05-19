import { useCartStore } from '@/stores/cart-store';

export default function Cart() {
  const { items, remove, clear } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal">
        <h1 className="text-3xl font-black">Cart LUMINA</h1>
        <p className="mt-2 font-semibold text-slate-600">Keranjang lokal memakai Zustand persist.</p>
        <div className="mt-6 space-y-4">
          {items.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border-2 border-slate-900 p-4"><div><p className="font-black">{item.name}</p><p className="font-semibold text-slate-600">Qty {item.qty} · Rp {(item.price * item.qty).toLocaleString('id-ID')}</p></div><button onClick={() => remove(item.id)} className="font-black text-red-600">Hapus</button></div>)}
          {!items.length && <p className="rounded-2xl border-2 border-dashed border-slate-300 p-6 font-bold text-slate-500">Keranjang masih kosong.</p>}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-900 pt-5"><p className="text-2xl font-black">Total Rp {total.toLocaleString('id-ID')}</p><div className="flex gap-3"><button onClick={clear} className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm">Clear</button><a href="/checkout" className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-2 font-black shadow-brutal-sm">Checkout</a></div></div>
      </section>
    </main>
  );
}
