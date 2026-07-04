import { create } from 'zustand';
import type { CartItem, MenuItem } from '../types';

interface CartStore {
  items: CartItem[];
  establishmentId: string | null;
  establishmentName: string | null;
  quartierLivraison: string | null;
  addItem: (item: MenuItem, establishmentId: string, establishmentName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setQuartierLivraison: (quartier: string) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  establishmentId: null,
  establishmentName: null,
  quartierLivraison: null,

  addItem: (item, establishmentId, establishmentName) => {
    const { items, establishmentId: currentId } = get();
    if (currentId && currentId !== establishmentId) {
      set({ items: [{ item, quantity: 1, establishmentId, establishmentName }], establishmentId, establishmentName });
      return;
    }
    const existing = items.find(ci => ci.item.id === item.id);
    if (existing) {
      set({ items: items.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci) });
    } else {
      set({ items: [...items, { item, quantity: 1, establishmentId, establishmentName }], establishmentId, establishmentName });
    }
  },

  removeItem: (itemId) => {
    const items = get().items.filter(ci => ci.item.id !== itemId);
    set({
      items,
      establishmentId: items.length ? get().establishmentId : null,
      establishmentName: items.length ? get().establishmentName : null,
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) { get().removeItem(itemId); return; }
    set({ items: get().items.map(ci => ci.item.id === itemId ? { ...ci, quantity } : ci) });
  },

  setQuartierLivraison: (quartier) => set({ quartierLivraison: quartier }),

  clearCart: () => set({ items: [], establishmentId: null, establishmentName: null, quartierLivraison: null }),

  total: () => get().items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0),
  itemCount: () => get().items.reduce((sum, ci) => sum + ci.quantity, 0),
}));
