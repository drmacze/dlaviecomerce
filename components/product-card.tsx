import type { Product } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  return <article className="rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-brutal-sm"><h2 className="text-2xl font-black">{product.name}</h2><p className="mt-3 font-semibold text-slate-600">{product.description || 'Produk digital premium LUMINA.'}</p><p className="mt-5 text-xl font-black">Rp {product.price.toLocaleString('id-ID')}</p><div className="mt-5 grid gap-2"><a href={`/product/${product.slug}`} className="w-full rounded-xl border-2 border-slate-900 bg-white px-4 py-3 text-center font-black shadow-brutal-sm">Detail Produk</a><button onClick={() => add(product)} className="w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-3 font-black shadow-brutal-sm">Tambah ke Cart</button></div></article>;
}
