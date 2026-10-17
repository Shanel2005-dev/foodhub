import { useState, type FormEvent } from 'react';
import {
  Activity, ArrowUpRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ClipboardList,
  Clock, ImagePlus, LayoutDashboard, MapPin, Menu as MenuIcon, Package, Pencil, Plus,
  Search, ShieldCheck, ShoppingBag, Store, Trash2, TrendingUp, ToggleLeft,
  ToggleRight, UtensilsCrossed, X,
} from 'lucide-react';
import { mockEstablishments } from '../data/mock';
import { useMenuStore } from '../store/menuStore';
import { useOrderStore } from '../store/orderStore';
import type { MenuItem, Order, OrderStatus } from '../types';

type SalesPeriod = 'week' | 'month' | 'year';
type MenuForm = { name: string; category: string; description: string; price: string; image: string; popular: boolean };

const EMPTY_MENU_FORM: MenuForm = { name: '', category: 'Plats locaux', description: '', price: '', image: '', popular: false };
const ORDER_FILTERS = ['Toutes', 'À confirmer', 'En préparation', 'À livrer', 'Terminées'] as const;

function periodRange(period: SalesPeriod, offset: number) {
  const anchor = new Date();
  if (period === 'week') {
    anchor.setDate(anchor.getDate() + offset * 7);
    const start = new Date(anchor);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end, label: `${start.toLocaleDateString('fr-FR')} – ${new Date(end.getTime() - 1).toLocaleDateString('fr-FR')}` };
  }
  if (period === 'month') {
    anchor.setDate(1);
    anchor.setMonth(anchor.getMonth() + offset);
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    return { start, end, label: start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) };
  }
  anchor.setMonth(0, 1);
  anchor.setFullYear(anchor.getFullYear() + offset);
  const start = new Date(anchor.getFullYear(), 0, 1);
  const end = new Date(anchor.getFullYear() + 1, 0, 1);
  return { start, end, label: String(start.getFullYear()) };
}

function foodSalesTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type DashboardOrder = {
  id: string;
  customer: string;
  items: string;
  quartier: string;
  total: number;
  time: string;
  status: OrderStatus;
  paymentMethod: string;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_preparation: 'En préparation',
  prete: 'Prête à récupérer',
  acceptee: 'Course acceptée',
  recuperee: 'Récupérée',
  en_route: 'En route',
  livree: 'Livrée',
  annulee: 'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: 'bg-gray-100 text-gray-600',
  confirmee: 'bg-blue-100 text-blue-700',
  en_preparation: 'bg-yellow-100 text-yellow-700',
  prete: 'bg-purple-100 text-purple-700',
  acceptee: 'bg-indigo-100 text-indigo-700',
  recuperee: 'bg-purple-100 text-purple-700',
  en_route: 'bg-orange-100 text-orange-700',
  livree: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-600',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  en_attente: 'confirmee',
  confirmee: 'en_preparation',
  en_preparation: 'prete',
  prete: 'acceptee',
  acceptee: 'recuperee',
  recuperee: 'en_route',
  en_route: 'livree',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  en_attente: 'Accepter',
  confirmee: 'Commencer préparation',
  en_preparation: 'Marquer prête',
  prete: 'Accepter la course',
  acceptee: 'Marquer récupérée',
  recuperee: 'En route',
  en_route: 'Marquer livrée',
};

const PAYMENT_LABELS = {
  mtn_momo: 'MTN MoMo (simulé)',
  moov_money: 'Moov Money (simulé)',
  especes_livraison: 'Espèces à la livraison',
};

function formatOrder(order: Order): DashboardOrder {
  return {
    id: order.id,
    customer: order.customerPhone ?? 'Client',
    items: order.items.map((item) => `${item.name} ×${item.quantity}`).join(' · '),
    quartier: order.quartierLivraison,
    total: order.total,
    time: new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    status: order.status,
    paymentMethod: PAYMENT_LABELS[order.paymentMethod],
  };
}

const etablissement = mockEstablishments[0];

export default function RestaurantDashboardPage() {
  const storedOrders = useOrderStore((state) => state.orders);
  const updateOrderStatus = useOrderStore((state) => state.updateStatus);
  const markCashCollected = useOrderStore((state) => state.markCashCollected);
  const menuCategories = useMenuStore((state) => state.menus[etablissement.id] ?? etablissement.menu);
  const addMenuItem = useMenuStore((state) => state.addItem);
  const updateMenuItem = useMenuStore((state) => state.updateItem);
  const removeMenuItem = useMenuStore((state) => state.removeItem);
  const restaurantOrders = storedOrders.filter((order) => order.establishmentId === etablissement.id);
  const orders = restaurantOrders.map(formatOrder);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'stats'>('overview');
  const [orderFilter, setOrderFilter] = useState<(typeof ORDER_FILTERS)[number]>('Toutes');
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [deleteMenuItemId, setDeleteMenuItemId] = useState<string | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [menuForm, setMenuForm] = useState<MenuForm>(EMPTY_MENU_FORM);
  const [menuError, setMenuError] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('Toutes');
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('week');
  const [salesPeriodOffset, setSalesPeriodOffset] = useState(0);

  const menuItems = menuCategories.flatMap((category) =>
    category.items.map((item) => ({ ...item, category: category.name })),
  );
  const soldQuantityByName = restaurantOrders
    .filter((order) => order.status === 'livree')
    .flatMap((order) => order.items)
    .reduce((sales, item) => sales.set(item.name, (sales.get(item.name) ?? 0) + item.quantity), new Map<string, number>());
  const rankedMenuItems = menuItems
    .map((item) => ({ ...item, quantitySold: soldQuantityByName.get(item.name) ?? 0 }))
    .sort((first, second) => second.quantitySold - first.quantitySold);
  const hasRecordedMenuSales = rankedMenuItems.some((item) => item.quantitySold > 0);
  const highlightedMenuItems = (hasRecordedMenuSales
    ? rankedMenuItems.filter((item) => item.quantitySold > 0)
    : rankedMenuItems.filter((item) => item.popular))
    .slice(0, 4);
  const newOrders = orders.filter(o => o.status === 'en_attente' || o.status === 'confirmee');
  const ongoingOrders = orders.filter(o => o.status === 'en_preparation');
  const courierOrders = restaurantOrders
    .filter((order) => ['prete', 'acceptee', 'recuperee', 'en_route'].includes(order.status))
    .map(formatOrder);
  const cashDueOrders = restaurantOrders.filter((order) =>
    order.status === 'livree' &&
    order.paymentMethod === 'especes_livraison' &&
    order.paymentStatus === 'a_la_livraison'
  );
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const todayOrders = restaurantOrders.filter((order) => {
    const date = new Date(order.date);
    return date >= todayStart && date < tomorrowStart;
  });
  const todayRevenue = todayOrders
    .filter((order) => order.status === 'livree' && order.paymentStatus !== 'a_la_livraison')
    .reduce((sum, order) => sum + foodSalesTotal(order), 0);
  const salesRange = periodRange(salesPeriod, salesPeriodOffset);
  const salesOrders = restaurantOrders
    .filter((order) => order.status === 'livree' && order.paymentStatus !== 'a_la_livraison')
    .filter((order) => {
      const date = new Date(order.date);
      return date >= salesRange.start && date < salesRange.end;
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const periodRevenue = salesOrders.reduce((sum, order) => sum + foodSalesTotal(order), 0);
  const periodDishCount = salesOrders.reduce(
    (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
    0,
  );
  const categoryNames = menuCategories.map((category) => category.name);
  const filteredMenuItems = menuItems.filter((item) => {
    const query = menuSearch.trim().toLocaleLowerCase('fr');
    const matchesSearch = !query || `${item.name} ${item.description}`.toLocaleLowerCase('fr').includes(query);
    const matchesCategory = menuCategoryFilter === 'Toutes' || item.category === menuCategoryFilter;
    return matchesSearch && matchesCategory;
  });
  const availableMenuCount = menuItems.filter((item) => item.available !== false).length;
  const visibleOrders = orders.filter((order) => {
    if (orderFilter === 'À confirmer') return order.status === 'en_attente' || order.status === 'confirmee';
    if (orderFilter === 'En préparation') return order.status === 'en_preparation';
    if (orderFilter === 'À livrer') return ['prete', 'acceptee', 'recuperee', 'en_route'].includes(order.status);
    if (orderFilter === 'Terminées') return order.status === 'livree' || order.status === 'annulee';
    return true;
  });
  const weeklyCompletedOrders = restaurantOrders.filter((order) => {
    const date = new Date(order.date);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return order.status === 'livree' && date >= start && date < end;
  });
  const weeklySales = weeklyCompletedOrders.reduce((sum, order) => sum + foodSalesTotal(order), 0);
  const chartBuckets = salesPeriod === 'week'
    ? Array.from({ length: 7 }, (_, index) => {
      const date = new Date(salesRange.start);
      date.setDate(date.getDate() + index);
      return { key: localDateKey(date), label: date.toLocaleDateString('fr-FR', { weekday: 'short' }) };
    })
    : salesPeriod === 'month'
      ? Array.from({ length: Math.ceil((salesRange.end.getTime() - salesRange.start.getTime()) / (7 * 86400000)) }, (_, index) => ({
        key: String(index),
        label: `Sem. ${index + 1}`,
      }))
      : Array.from({ length: 12 }, (_, index) => ({
        key: String(index),
        label: new Date(salesRange.start.getFullYear(), index, 1).toLocaleDateString('fr-FR', { month: 'short' }),
      }));
  const chartData = chartBuckets.map((bucket, index) => ({
    ...bucket,
    amount: salesOrders.reduce((sum, order) => {
      const date = new Date(order.date);
      const matchesBucket = salesPeriod === 'week'
        ? localDateKey(date) === bucket.key
        : salesPeriod === 'month'
          ? Math.floor((date.getDate() - 1) / 7) === index
          : date.getMonth() === index;
      return matchesBucket ? sum + foodSalesTotal(order) : sum;
    }, 0),
  }));
  const maxChartAmount = Math.max(...chartData.map((bucket) => bucket.amount), 0);
  const chartStepBase = maxChartAmount > 0 ? 10 ** Math.floor(Math.log10(maxChartAmount / 4)) : 1;
  const chartStep = maxChartAmount > 0
    ? Math.ceil((maxChartAmount / 4) / chartStepBase) * chartStepBase
    : 1;
  const chartMax = chartStep * 4;
  const chartPlot = { left: 62, right: 700, top: 20, bottom: 218 };
  const chartPoints = chartData.map((bucket, index) => ({
    ...bucket,
    x: chartData.length === 1
      ? (chartPlot.left + chartPlot.right) / 2
      : chartPlot.left + (index / (chartData.length - 1)) * (chartPlot.right - chartPlot.left),
    y: chartPlot.bottom - (bucket.amount / chartMax) * (chartPlot.bottom - chartPlot.top),
  }));
  const chartLine = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const chartArea = chartPoints.length
    ? `${chartPlot.left},${chartPlot.bottom} ${chartLine} ${chartPlot.right},${chartPlot.bottom}`
    : '';
  const advance = (id: string) => {
    const order = storedOrders.find((candidate) => candidate.id === id);
    const next = order && NEXT_STATUS[order.status];
    if (next) updateOrderStatus(id, next);
  };

  const refuse = (id: string) => updateOrderStatus(id, 'annulee');

  const toggleItem = (id: string) => {
    const item = menuItems.find((candidate) => candidate.id === id);
    if (item) updateMenuItem(etablissement.id, id, { available: item.available === false });
  };

  const openNewMenuItem = () => {
    setEditingMenuItemId(null);
    setMenuForm(EMPTY_MENU_FORM);
    setMenuError('');
    setShowAddItemForm(true);
  };

  const openEditMenuItem = (id: string) => {
    const item = menuItems.find((candidate) => candidate.id === id);
    if (!item) return;
    setEditingMenuItemId(id);
    setMenuForm({
      name: item.name,
      category: item.category,
      description: item.description,
      price: String(item.price),
      image: item.image,
      popular: item.popular === true,
    });
    setMenuError('');
    setShowAddItemForm(true);
  };

  const handleMenuImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMenuError('Choisis un fichier image (JPG, PNG ou WebP).');
      return;
    }
    if (file.size > 600 * 1024) {
      setMenuError('La photo doit peser 600 Ko maximum pour être enregistrée dans cette démo locale.');
      return;
    }
    const storedPhotoBytes = menuItems
      .filter((item) => item.id !== editingMenuItemId && item.image.startsWith('data:image/'))
      .reduce((total, item) => total + Math.ceil(item.image.length * 0.75), 0);
    if (storedPhotoBytes + file.size > 2.5 * 1024 * 1024) {
      setMenuError('La limite de stockage photo de cette démo locale est atteinte. Réduis les photos déjà ajoutées.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        setMenuError('La photo n’a pas pu être chargée. Essaie un autre fichier.');
        return;
      }
      setMenuForm((form) => ({ ...form, image: result }));
      setMenuError('');
    };
    reader.onerror = () => setMenuError('Impossible de lire cette photo. Vérifie le fichier et réessaie.');
    reader.readAsDataURL(file);
  };

  const saveNewItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = menuForm.name.trim();
    const category = menuForm.category.trim();
    const description = menuForm.description.trim();
    const price = Number(menuForm.price);
    if (!name || !category || !description || !Number.isSafeInteger(price) || price <= 0) {
      setMenuError('Renseigne le nom, la catégorie, la description et un prix valide.');
      return;
    }
    let image = menuForm.image.trim() || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop&q=80';
    if (menuForm.image.trim()) {
      if (!menuForm.image.startsWith('data:image/')) {
        try {
          const parsedUrl = new URL(menuForm.image.trim());
          if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') throw new Error('Invalid image protocol');
          image = parsedUrl.toString();
        } catch {
          setMenuError('Ajoute une photo valide ou une adresse URL HTTP/HTTPS.');
          return;
        }
      }
    }
    const itemChanges = { name, description, price, image, popular: menuForm.popular };
    if (editingMenuItemId) {
      updateMenuItem(etablissement.id, editingMenuItemId, itemChanges);
      const oldCategory = menuCategories.find((entry) => entry.items.some((item) => item.id === editingMenuItemId))?.name;
      if (oldCategory !== category) {
        const available = menuItems.find((item) => item.id === editingMenuItemId)?.available !== false;
        removeMenuItem(etablissement.id, editingMenuItemId);
        addMenuItem(etablissement.id, category, { ...itemChanges, available });
        if (menuCategoryFilter === oldCategory) setMenuCategoryFilter(category);
      }
    } else {
      const newItem: Omit<MenuItem, 'id'> = { ...itemChanges, available: true };
      addMenuItem(etablissement.id, category, newItem);
    }
    setMenuForm(EMPTY_MENU_FORM);
    setMenuError('');
    setShowAddItemForm(false);
    setEditingMenuItemId(null);
  };

  const OrderCard = ({ order }: { order: DashboardOrder }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-gray-800 text-sm">{order.customer}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-xs text-gray-500">{order.items}</p>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {order.quartier} · {order.paymentMethod}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-sm" style={{ color: '#EA580C' }}>{order.total.toLocaleString()} F</p>
          <p className="text-xs text-gray-400 flex items-center gap-0.5"><Clock size={10} /> {order.time}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {NEXT_STATUS[order.status] && (
          <button
            onClick={() => advance(order.id)}
            className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: '#EA580C' }}
          >
            {NEXT_LABEL[order.status]}
          </button>
        )}
        {order.status === 'en_attente' && (
          <button
            onClick={() => refuse(order.id)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Refuser
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <UtensilsCrossed size={23} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Espace professionnel</p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bonjour, Tantie Bio</h1>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500"><Store size={14} /> {etablissement.name} · {etablissement.quartier}</p>
            </div>
          </div>
        </header>

        <p className="mb-5 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          Mode démonstration : vos modifications sont enregistrées dans ce navigateur. Pour gérer un établissement réel et partager les données, une API serveur sera nécessaire.
        </p>

        <div className="grid items-start gap-5 min-[700px]:grid-cols-[190px_minmax(0,1fr)] min-[1100px]:gap-7">
          <aside className="min-w-0 min-[700px]:sticky min-[700px]:top-24">
            <nav aria-label="Navigation restaurant" className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
              <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Espace restaurant</p>
              <div className="flex gap-1 overflow-x-auto min-[700px]:flex-col">
                {([
                  { key: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
                  { key: 'orders', label: 'Commandes', icon: ClipboardList },
                  { key: 'menu', label: 'Carte & menus', icon: MenuIcon },
                  { key: 'stats', label: 'Ventes & rapports', icon: TrendingUp },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex min-w-max items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors min-[700px]:w-full ${activeTab === key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    {key === 'orders' && newOrders.length > 0 && <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeTab === key ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>{newOrders.length}</span>}
                  </button>
                ))}
              </div>
            </nav>
            <div className="mt-3 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm min-[700px]:block">
              <p className="text-xs font-semibold text-gray-800">État de la carte</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{availableMenuCount} mets disponibles sur {menuItems.length}</p>
              <button onClick={() => setActiveTab('menu')} className="mt-3 text-xs font-semibold text-orange-700 hover:text-orange-800">Gérer les menus <ArrowUpRight size={13} className="ml-1 inline" /></button>
            </div>
          </aside>
          <main className="min-w-0 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section aria-label="Résumé des performances" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'Ventes du jour', value: `${todayRevenue.toLocaleString()} F`, detail: 'Mets livrés aujourd’hui', icon: TrendingUp, tone: 'text-emerald-700 bg-emerald-50' },
                { label: 'Cette semaine', value: `${weeklySales.toLocaleString()} F`, detail: 'Ventes livrées', icon: Activity, tone: 'text-orange-700 bg-orange-50' },
                { label: 'Commandes du jour', value: todayOrders.length, detail: 'Toutes les commandes', icon: ShoppingBag, tone: 'text-blue-700 bg-blue-50' },
                { label: 'À traiter', value: newOrders.length, detail: 'En attente de réponse', icon: Clock, tone: 'text-amber-700 bg-amber-50' },
                { label: 'En cours', value: ongoingOrders.length + courierOrders.length, detail: `${ongoingOrders.length} en préparation · ${courierOrders.length} en livraison`, icon: Package, tone: 'text-violet-700 bg-violet-50' },
              ].map(({ label, value, detail, icon: Icon, tone }) => (
                <div key={label} className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-sm font-medium leading-tight text-gray-500">{label}</p>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={17} /></span>
                  </div>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
                  <p className="mt-1 text-xs text-gray-400">{detail}</p>
                </div>
              ))}
            </section>

            <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-gray-900">Commandes récentes</h2>
                    <p className="mt-1 text-xs text-gray-400">Suivez et préparez les commandes de votre restaurant</p>
                  </div>
                  <button onClick={() => setActiveTab('orders')} className="flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800">Toutes les commandes <ArrowUpRight size={14} /></button>
                </div>
                {orders.slice(0, 3).length === 0 ? (
                  <div className="rounded-xl bg-gray-50 py-12 text-center text-sm text-gray-400"><Package size={30} className="mx-auto mb-2 opacity-40" />Aucune commande pour le moment.</div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">{orders.slice(0, 3).map((order) => <OrderCard key={order.id} order={order} />)}</div>
                )}
              </section>
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">{hasRecordedMenuSales ? 'Meilleures ventes' : 'À la carte'}</h2>
                    <p className="mt-1 text-xs text-gray-400">{hasRecordedMenuSales ? 'Classement issu des commandes livrées' : 'Mets actuellement proposés'}</p>
                  </div>
                  <button onClick={() => setActiveTab('menu')} className="text-xs font-semibold text-orange-700">Gérer la carte</button>
                </div>
                <div className="space-y-3">
                  {highlightedMenuItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-semibold text-gray-400">0{index + 1}</span>
                      <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.price.toLocaleString()} FCFA · {hasRecordedMenuSales ? `${item.quantitySold} vendu${item.quantitySold > 1 ? 's' : ''}` : item.available === false ? 'Indisponible' : 'Disponible'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gestion des commandes</h2>
                <p className="mt-1 text-sm text-gray-500">Accepte, prépare et remets les commandes au livreur.</p>
              </div>
              <span className="text-xs text-gray-400">{orders.length} commande{orders.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ORDER_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${orderFilter === filter ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  {filter}
                  {filter === 'À confirmer' && newOrders.length > 0 ? ` · ${newOrders.length}` : ''}
                </button>
              ))}
            </div>
            {visibleOrders.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
                <Package size={34} className="mx-auto mb-3 opacity-30" />Aucune commande pour ce filtre.
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">{visibleOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
            )}
            {cashDueOrders.length > 0 && (
              <section className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <h3 className="text-sm font-bold text-amber-900">Espèces à confirmer à la livraison</h3>
                {cashDueOrders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4">
                    <div>
                      <p className="text-sm font-bold text-gray-800">#{order.id} · {order.total.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">{order.customerPhone ?? 'Client'} · {order.quartierLivraison}</p>
                    </div>
                    <button onClick={() => markCashCollected(order.id)} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: '#EA580C' }}>Confirmer encaissé</button>
                  </div>
                ))}
              </section>
            )}
          </section>
        )}

        {/* Tab: Menu */}
        {activeTab === 'menu' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">Catalogue du restaurant</p>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Carte & menus</h2>
                <p className="mt-1 text-sm text-gray-500">Ajoute, modifie et organise les plats visibles par tes clients.</p>
              </div>
              <button
                onClick={openNewMenuItem}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                style={{ backgroundColor: '#EA580C' }}
              >
                <Plus size={17} /> Ajouter un met
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: 'Articles au menu', value: menuItems.length },
                { label: 'Disponibles', value: availableMenuCount },
                { label: 'Indisponibles', value: menuItems.length - availableMenuCount },
                { label: 'Catégories', value: categoryNames.length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="mt-1 text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative flex-1">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={menuSearch}
                    onChange={(event) => setMenuSearch(event.target.value)}
                    placeholder="Rechercher un plat..."
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </label>
                <label className="relative md:w-56">
                  <select
                    value={menuCategoryFilter}
                    onChange={(event) => setMenuCategoryFilter(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-orange-400"
                  >
                    {['Toutes', ...categoryNames].map((category) => <option key={category}>{category}</option>)}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </label>
              </div>
            </div>

            {filteredMenuItems.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
                <MenuIcon size={34} className="mx-auto mb-3 text-gray-300" />
                <h3 className="font-semibold text-gray-800">{menuItems.length ? 'Aucun résultat' : 'Ta carte est encore vide'}</h3>
                <p className="mt-1 text-sm text-gray-500">{menuItems.length ? 'Essaie une autre recherche ou catégorie.' : 'Ajoute ton premier met pour commencer à recevoir des commandes.'}</p>
                {!menuItems.length && <button onClick={openNewMenuItem} className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: '#EA580C' }}>Ajouter un premier met</button>}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredMenuItems.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative h-44 bg-gray-100">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm">{item.category}</span>
                      {item.popular && <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">★ Populaire</span>}
                      <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${item.available === false ? 'bg-gray-900/80 text-white' : 'bg-green-100 text-green-800'}`}>
                        {item.available === false ? 'Indisponible' : 'Disponible'}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-gray-900">{item.name}</h3>
                          <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-relaxed text-gray-500">{item.description}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-orange-700">{item.price.toLocaleString()} F</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <button onClick={() => toggleItem(item.id)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900">
                          {item.available === false ? <ToggleLeft size={17} /> : <ToggleRight size={17} />}
                          {item.available === false ? 'Rendre disponible' : 'Mettre en pause'}
                        </button>
                        <div className="flex gap-1">
                          <button onClick={() => openEditMenuItem(item.id)} aria-label={`Modifier ${item.name}`} className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 hover:text-orange-700"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteMenuItemId(item.id)} aria-label={`Supprimer ${item.name}`} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-gray-800">Historique des ventes</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><CalendarDays size={13} /> {salesRange.label}</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                  {([
                    { key: 'week', label: 'Semaine' },
                    { key: 'month', label: 'Mois' },
                    { key: 'year', label: 'Année' },
                  ] as const).map(option => (
                    <button
                      key={option.key}
                      onClick={() => { setSalesPeriod(option.key); setSalesPeriodOffset(0); }}
                      className="rounded-lg px-3 py-2 text-xs font-semibold"
                      style={salesPeriod === option.key ? { backgroundColor: '#EA580C', color: 'white' } : { color: '#6b7280' }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setSalesPeriodOffset((offset) => offset - 1)}
                  aria-label="Période précédente"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <p className="text-sm font-semibold capitalize text-gray-700">{salesRange.label}</p>
                <button
                  onClick={() => setSalesPeriodOffset((offset) => Math.min(offset + 1, 0))}
                  aria-label="Période suivante"
                  disabled={salesPeriodOffset === 0}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: 'Ventes des mets', value: `${periodRevenue.toLocaleString()} F`, color: '#EA580C' },
                  { label: 'Commandes livrées', value: salesOrders.length, color: '#16a34a' },
                  { label: 'Articles vendus', value: periodDishCount, color: '#7c3aed' },
                  { label: 'Panier moyen', value: `${salesOrders.length ? Math.round(periodRevenue / salesOrders.length).toLocaleString() : 0} F`, color: '#2563eb' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl bg-gray-50 p-3">
                    <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">Montants calculés à partir des commandes livrées, hors frais de livraison et commandes annulées.</p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-800">Ventes par {salesPeriod === 'week' ? 'jour' : salesPeriod === 'month' ? 'semaine' : 'mois'} (FCFA)</h3>
              <div className="mt-2 w-full">
                <svg
                  viewBox="0 0 720 270"
                  role="img"
                  aria-label={`Graphique des ventes par ${salesPeriod === 'week' ? 'jour' : salesPeriod === 'month' ? 'semaine' : 'mois'} en FCFA`}
                  className="h-auto w-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="sales-area-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((tick) => {
                    const y = chartPlot.bottom - (tick / 4) * (chartPlot.bottom - chartPlot.top);
                    const amount = chartStep * tick;
                    return (
                      <g key={tick}>
                        <line x1={chartPlot.left} x2={chartPlot.right} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray={tick === 0 ? undefined : '4 5'} />
                        <text x={chartPlot.left - 10} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="11">
                          {amount.toLocaleString('fr-FR')}
                        </text>
                      </g>
                    );
                  })}
                  <polygon points={chartArea} fill="url(#sales-area-gradient)" />
                  <polyline points={chartLine} fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {chartPoints.map((point) => (
                    <g key={point.key}>
                      <title>{`${point.label} : ${point.amount.toLocaleString('fr-FR')} FCFA`}</title>
                      <circle cx={point.x} cy={point.y} r="7" fill="white" />
                      <circle cx={point.x} cy={point.y} r="4" fill="#EA580C" />
                      <text x={point.x} y="250" textAnchor="middle" fill="#6b7280" fontSize="11" className="capitalize">
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              {periodRevenue === 0 && (
                <p className="mt-2 text-center text-sm text-gray-400">Aucune vente enregistrée sur cette période.</p>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5">
                <h3 className="font-bold text-gray-800">Détail des ventes</h3>
              </div>
              {salesOrders.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-400">Aucune vente livrée sur cette période.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {salesOrders.map(order => (
                    <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Commande #{order.id}</p>
                        <p className="mt-1 text-xs text-gray-500">{order.items.map(item => `${item.name} ×${item.quantity}`).join(' · ')}</p>
                        <p className="mt-1 text-xs text-gray-400">{new Date(order.date).toLocaleString('fr-FR')} · {order.quartierLivraison}</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#EA580C' }}>{foodSalesTotal(order).toLocaleString()} FCFA</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

          </main>
        </div>

        {showAddItemForm && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-gray-950/55 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowAddItemForm(false);
            }}
          >
            <form
              onSubmit={saveNewItem}
              role="dialog"
              aria-modal="true"
              aria-labelledby="menu-item-dialog-title"
              className="my-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">Gestion de la carte</p>
                  <h2 id="menu-item-dialog-title" className="mt-1 text-xl font-bold text-gray-900">
                    {editingMenuItemId ? 'Modifier le met' : 'Ajouter un nouveau met'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">Les informations seront visibles sur la page de ton restaurant.</p>
                </div>
                <button type="button" onClick={() => setShowAddItemForm(false)} aria-label="Fermer" className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800"><X size={20} /></button>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom du met <span className="text-red-500">*</span>
                    <input
                      autoFocus
                      value={menuForm.name}
                      onChange={(event) => setMenuForm((form) => ({ ...form, name: event.target.value }))}
                      placeholder="Ex. Igname pilée au poulet"
                      maxLength={80}
                      required
                      className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Catégorie <span className="text-red-500">*</span>
                      <input
                        list="restaurant-menu-categories"
                        value={menuForm.category}
                        onChange={(event) => setMenuForm((form) => ({ ...form, category: event.target.value }))}
                        placeholder="Ex. Plats locaux"
                        maxLength={40}
                        required
                        className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                      <datalist id="restaurant-menu-categories">{categoryNames.map((category) => <option key={category} value={category} />)}</datalist>
                    </label>
                    <label className="block text-sm font-semibold text-gray-700">
                      Prix de vente <span className="text-red-500">*</span>
                      <div className="relative mt-1.5">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={menuForm.price}
                          onChange={(event) => setMenuForm((form) => ({ ...form, price: event.target.value }))}
                          placeholder="1500"
                          required
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-3 pr-16 text-sm font-normal outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">FCFA</span>
                      </div>
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-gray-700">
                    Description <span className="text-red-500">*</span>
                    <textarea
                      value={menuForm.description}
                      onChange={(event) => setMenuForm((form) => ({ ...form, description: event.target.value }))}
                      placeholder="Décris les ingrédients, la portion et les accompagnements..."
                      maxLength={240}
                      rows={4}
                      required
                      className="mt-1.5 w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                    <span className="mt-1 block text-right text-xs font-normal text-gray-400">{menuForm.description.length}/240</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3.5 transition hover:border-orange-200">
                    <input
                      type="checkbox"
                      checked={menuForm.popular}
                      onChange={(event) => setMenuForm((form) => ({ ...form, popular: event.target.checked }))}
                      className="h-4 w-4 accent-orange-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-700">Mettre en avant</span>
                      <span className="block text-xs text-gray-400">Afficher le badge « Populaire » aux clients</span>
                    </span>
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Photo du met</p>
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                    {menuForm.image ? (
                      <img src={menuForm.image} alt="Aperçu du plat" className="h-full w-full object-cover" />
                    ) : (
                      <div className="px-5 text-center text-gray-400">
                        <ImagePlus size={34} className="mx-auto mb-2" />
                        <p className="text-xs">Ajoute une photo appétissante</p>
                      </div>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <ImagePlus size={16} /> Choisir une photo
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleMenuImage(event.target.files?.[0])} />
                  </label>
                  <label className="block text-xs font-medium text-gray-500">
                    Ou coller un lien image
                    <input
                      type="text"
                      value={menuForm.image.startsWith('data:image/') ? '' : menuForm.image}
                      onChange={(event) => setMenuForm((form) => ({ ...form, image: event.target.value }))}
                      placeholder="https://..."
                      className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-400"
                    />
                  </label>
                  <p className="text-[11px] leading-relaxed text-gray-400">JPG, PNG ou WebP · 600 Ko max par photo · conservée dans ce navigateur</p>
                </div>
              </div>

              {menuError && <p role="alert" className="mx-6 mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{menuError}</p>}
              <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                <button type="button" onClick={() => setShowAddItemForm(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700" style={{ backgroundColor: '#EA580C' }}>
                  {editingMenuItemId ? 'Enregistrer les modifications' : 'Ajouter à ma carte'}
                </button>
              </div>
            </form>
          </div>
        )}

        {deleteMenuItemId && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
            <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 size={20} /></div>
              <h2 className="text-lg font-bold text-gray-900">Supprimer ce met ?</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                « {menuItems.find((item) => item.id === deleteMenuItemId)?.name} » sera retiré de ta carte et ne sera plus visible par les clients.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setDeleteMenuItemId(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600">Garder le met</button>
                <button
                  onClick={() => { removeMenuItem(etablissement.id, deleteMenuItemId); setDeleteMenuItemId(null); }}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
