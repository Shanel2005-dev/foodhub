import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mockEstablishments } from '../data/mock';
import type { MenuCategory, MenuItem } from '../types';

interface MenuStore {
  menus: Record<string, MenuCategory[]>;
  addItem: (establishmentId: string, category: string, item: Omit<MenuItem, 'id'>) => void;
  updateItem: (establishmentId: string, itemId: string, changes: Partial<Omit<MenuItem, 'id'>>) => void;
  removeItem: (establishmentId: string, itemId: string) => void;
}

const initialMenus = Object.fromEntries(
  mockEstablishments.map((establishment) => [establishment.id, establishment.menu]),
);

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      menus: initialMenus,
      addItem: (establishmentId, categoryName, item) => set((state) => {
        const categories = state.menus[establishmentId] ?? [];
        const existingCategory = categories.find((category) => category.name === categoryName);
        const newItem: MenuItem = {
          ...item,
          id: `menu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        };

        return {
          menus: {
            ...state.menus,
            [establishmentId]: existingCategory
              ? categories.map((category) => category.name === categoryName
                ? { ...category, items: [...category.items, newItem] }
                : category)
              : [...categories, { name: categoryName, items: [newItem] }],
          },
        };
      }),
      updateItem: (establishmentId, itemId, changes) => set((state) => ({
        menus: {
          ...state.menus,
          [establishmentId]: (state.menus[establishmentId] ?? []).map((category) => ({
            ...category,
            items: category.items.map((item) => item.id === itemId ? { ...item, ...changes } : item),
          })),
        },
      })),
      removeItem: (establishmentId, itemId) => set((state) => ({
        menus: {
          ...state.menus,
          [establishmentId]: (state.menus[establishmentId] ?? [])
            .map((category) => ({
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }))
            .filter((category) => category.items.length > 0),
        },
      })),
    }),
    {
      name: 'foodhub-menus',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ menus }) => ({ menus }),
    },
  ),
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'foodhub-menus') void useMenuStore.persist.rehydrate();
  });
}
