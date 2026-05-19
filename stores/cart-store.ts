import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/types';

type CartItem = Product & { qty: number };
type CartState = { items: CartItem[]; add: (p: Product) => void; remove: (id: string) => void; clear: () => void };

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  add: (p) => set((s) => {
    const found = s.items.find((i) => i.id === p.id);
    return found ? { items: s.items.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) } : { items: [...s.items, { ...p, qty: 1 }] };
  }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] })
}), { name: 'lumina-cart' }));
