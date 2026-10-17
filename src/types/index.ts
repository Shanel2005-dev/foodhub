import type { LucideIcon } from 'lucide-react';
import { Utensils, Flame, ShoppingBasket, Cookie, Store } from 'lucide-react';

export type EstablishmentCategory = 'restaurant' | 'maquis' | 'superette' | 'patisserie' | 'boutique';

export const CATEGORY_LABELS: Record<EstablishmentCategory, string> = {
  restaurant: 'Restaurant',
  maquis: 'Maquis',
  superette: 'Supérette',
  patisserie: 'Pâtisserie',
  boutique: 'Boutique',
};

export const CATEGORY_ICONS: Record<EstablishmentCategory, LucideIcon> = {
  restaurant: Utensils,
  maquis: Flame,
  superette: ShoppingBasket,
  patisserie: Cookie,
  boutique: Store,
};

export interface Establishment {
  id: string;
  name: string;
  category: EstablishmentCategory;
  quartier: string;
  pointRepere: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  minOrderAmount: number;
  isOpen: boolean;
  image: string;
  description: string;
  menu: MenuCategory[];
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  available?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  establishmentId: string;
  establishmentName: string;
}

export type OrderStatus =
  | 'en_attente'
  | 'confirmee'
  | 'en_preparation'
  | 'prete'
  | 'acceptee'
  | 'recuperee'
  | 'en_route'
  | 'livree'
  | 'annulee';

export type PaymentMethod = 'mtn_momo' | 'moov_money' | 'especes_livraison';
export type PaymentStatus = 'simule' | 'a_la_livraison' | 'paye_livraison' | 'rembourse_simule';

export interface Livreur {
  nom: string;
  telephone: string;
  moyenTransport: 'moto';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  establishmentId: string;
  establishmentName: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  date: string;
  quartierLivraison: string;
  pointRepereLivraison: string;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  customerPhone?: string;
  rating?: number;
  livreur: Livreur | null;
}
