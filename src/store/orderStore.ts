import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mockOrders } from '../data/mock';
import type { CartItem, Order, OrderStatus, PaymentMethod } from '../types';

interface CreateOrderInput {
  items: CartItem[];
  establishmentId: string;
  establishmentName: string;
  subtotal: number;
  deliveryFee: number;
  quartierLivraison: string;
  pointRepereLivraison: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
}

interface OrderStore {
  orders: Order[];
  createOrder: (input: CreateOrderInput) => string;
  updateStatus: (id: string, status: OrderStatus) => void;
  rateOrder: (id: string, rating: number) => void;
  markCashCollected: (id: string) => void;
  simulateRefund: (id: string) => void;
}

const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  en_attente: 'confirmee',
  confirmee: 'en_preparation',
  en_preparation: 'prete',
  prete: 'acceptee',
  acceptee: 'recuperee',
  recuperee: 'en_route',
  en_route: 'livree',
};

const STORAGE_KEY = 'foodhub-orders';

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: mockOrders,
      createOrder: (input) => {
        const id = `FH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const order: Order = {
          id,
          establishmentId: input.establishmentId,
          establishmentName: input.establishmentName,
          items: input.items.map(({ item, quantity }) => ({
            id: item.id,
            name: item.name,
            quantity,
            price: item.price,
          })),
          total: input.subtotal + input.deliveryFee,
          deliveryFee: input.deliveryFee,
          status: 'en_attente',
          date: new Date().toISOString(),
          quartierLivraison: input.quartierLivraison,
          pointRepereLivraison: input.pointRepereLivraison,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === 'especes_livraison' ? 'a_la_livraison' : 'simule',
          customerPhone: input.customerPhone,
          livreur: null,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return id;
      },
      updateStatus: (id, status) => set((state) => ({
        orders: state.orders.map((order) => {
          if (order.id !== id) return order;
          const expected = ALLOWED_TRANSITIONS[order.status];
          if (status === 'annulee' && order.status === 'en_attente') {
            return { ...order, status };
          }
          if (status !== expected) return order;
          return {
            ...order,
            status,
            livreur: status === 'acceptee'
              ? { nom: 'Livreur de démonstration', telephone: '+229 97 12 34 56', moyenTransport: 'moto' }
              : order.livreur,
          };
        }),
      })),
      rateOrder: (id, rating) => {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id && order.status === 'livree' ? { ...order, rating } : order
          ),
        }));
      },
      markCashCollected: (id) => set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id &&
          order.status === 'livree' &&
          order.paymentMethod === 'especes_livraison' &&
          order.paymentStatus === 'a_la_livraison'
            ? { ...order, paymentStatus: 'paye_livraison' }
            : order
        ),
      })),
      simulateRefund: (id) => set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id && order.paymentStatus === 'simule' && order.status !== 'livree' && order.status !== 'annulee'
            ? { ...order, status: 'annulee', paymentStatus: 'rembourse_simule' }
            : order
        ),
      })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ orders }) => ({ orders }),
    },
  ),
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) void useOrderStore.persist.rehydrate();
  });
}
