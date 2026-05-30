import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { useCartStore } from '@/stores/cart-store';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function Cart() {
  const { items, remove, clear } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const qty = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <DlavieEcosystemPage
      eyebrow="DLAVIE CART"
      title="Digital cart sebelum checkout."
      description="Cek produk digital, kuantitas, dan total sebelum lanjut ke Secure Checkout."
      accent="#dfff4f"
      metrics={[
        { label: 'Items', value: String(items.length), hint: 'Product rows' },
        { label: 'Qty', value: String(qty), hint: 'Total quantity' },
        { label: 'Total', value: rupiah(total), hint: 'Before coupon' },
        { label: 'Checkout', value: items.length ? 'READY' : 'EMPTY', hint: 'Cart status' }
      ]}
      actions={[
        { label: 'Shop', href: '/#products' },
        { label: 'Downloads', href: '/downloads' },
        { label: 'Checkout', href: '/checkout', primary: true }
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <section className="grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="dlavie-soft-card rounded-[1.8rem] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Digital Product</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{item.name}</h2>
                  <p className="mt-1 font-bold text-slate-500">Qty {item.qty} · {rupiah(item.price * item.qty)}</p>
                </div>
                <button onClick={() => remove(item.id)} className="rounded-full bg-red-50 px-4 py-3 font-black text-red-600 ring-1 ring-red-100">Hapus</button>
              </div>
            </article>
          ))}
          {!items.length && (
            <div className="dlavie-soft-card rounded-[2rem] p-8">
              <p className="text-3xl font-black tracking-tight text-slate-950">Keranjang masih kosong.</p>
              <p className="mt-2 font-semibold leading-7 text-slate-500">Pilih produk digital dari vault DLAVIE lalu kembali ke checkout.</p>
              <a href="/#products" className="mt-5 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950">Explore Products</a>
            </div>
          )}
        </section>

        <aside className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Checkout Summary</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight">{rupiah(total)}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/55">Coupon dan D-Balance akan divalidasi di halaman Secure Checkout.</p>
          <div className="mt-6 grid gap-3">
            <a href="/checkout" className={`rounded-[1.4rem] p-5 font-black transition hover:-translate-y-1 ${items.length ? 'bg-[#dfff4f] text-slate-950' : 'pointer-events-none bg-white/10 text-white/35'}`}>Continue Checkout</a>
            <button onClick={clear} disabled={!items.length} className="rounded-[1.4rem] bg-white/10 p-5 text-left font-black text-white ring-1 ring-white/10 disabled:opacity-35">Clear Cart</button>
            <a href="/#products" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Back to Shop</a>
          </div>
        </aside>
      </div>
    </DlavieEcosystemPage>
  );
}
