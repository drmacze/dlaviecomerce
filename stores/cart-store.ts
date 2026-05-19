import { create } from 'zustand';
import type { Product } from '@/lib/types';

type CartItem = Product & { qty: number };

type CartState = {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (product) => set((state) => {
    const existing = state.items.find((item) => item.id === product.id);
    if (existing) {
      return { items: state.items.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) };
    }
    return { items: [...state.items, { ...product, qty: 1 }] };
  }),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clear: () => set({ items: [] })
}));
