import { useState } from 'react';
import { TrendingUp, Package, CheckCircle, Clock, UtensilsCrossed, Power, ToggleLeft, ToggleRight, MapPin, AlertTriangle } from 'lucide-react';
import { mockOrders, mockEstablishments } from '../data/mock';
import type { OrderStatus } from '../types';

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

const INITIAL_ORDERS: DashboardOrder[] = [
  { id: 'd1', customer: 'Aïcha K.', items: 'Igname pilée ×2 · Jus gingembre ×1', quartier: 'Banikanni', total: 2800, time: '10:45', status: 'en_attente', paymentMethod: 'MTN MoMo' },
  { id: 'd2', customer: 'Brice M.', items: 'Wagashi grillé ×1 · Pâte gombo ×1', quartier: 'Albarika', total: 2500, time: '11:02', status: 'confirmee', paymentMethod: 'Espèces' },
  { id: 'd3', customer: 'Fatima S.', items: 'Riz au gras ×2', quartier: 'Camp Adagbé', total: 3600, time: '11:18', status: 'en_preparation', paymentMethod: 'Moov Money' },
  { id: 'd4', customer: 'Kouassi A.', items: 'Akassa ×3 · Eau fraîche ×2', quartier: 'Zongo', total: 2800, time: '11:30', status: 'recuperee', paymentMethod: 'MTN MoMo' },
  { id: 'd5', customer: 'Mariam D.', items: 'Igname pilée ×1', quartier: 'Titirou', total: 1700, time: '11:45', status: 'en_route', paymentMethod: 'MTN MoMo' },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_preparation: 'En préparation',
  recuperee: 'Récupérée',
  en_route: 'En route',
  livree: 'Livrée',
  annulee: 'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: 'bg-gray-100 text-gray-600',
  confirmee: 'bg-blue-100 text-blue-700',
  en_preparation: 'bg-yellow-100 text-yellow-700',
  recuperee: 'bg-purple-100 text-purple-700',
  en_route: 'bg-orange-100 text-orange-700',
  livree: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-600',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  en_attente: 'confirmee',
  confirmee: 'en_preparation',
  en_preparation: 'recuperee',
  recuperee: 'en_route',
  en_route: 'livree',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  en_attente: 'Accepter',
  confirmee: 'Commencer préparation',
  en_preparation: 'Marquer récupérée',
  recuperee: 'En route',
  en_route: 'Marquer livrée',
};

// MenuItem state for menu management
const etablissement = mockEstablishments[0];
type MenuItemState = { id: string; name: string; price: number; category: string; available: boolean };

function buildMenuState(): MenuItemState[] {
  return etablissement.menu.flatMap(cat =>
    cat.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: cat.name,
      available: item.available !== false,
    }))
  );
}

export default function RestaurantDashboardPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'new' | 'ongoing' | 'done' | 'menu' | 'stats'>('new');
  const [isOpen, setIsOpen] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItemState[]>(buildMenuState);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  const newOrders = orders.filter(o => o.status === 'en_attente' || o.status === 'confirmee');
  const ongoingOrders = orders.filter(o => ['en_preparation', 'recuperee', 'en_route'].includes(o.status));
  const doneOrders = orders.filter(o => o.status === 'livree' || o.status === 'annulee');

  const todayOrders = [...orders, ...mockOrders].length;
  const revenue = [...doneOrders, ...mockOrders.filter(o => o.status === 'livree')]
    .reduce((s, o) => s + o.total, 0);

  const advance = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = NEXT_STATUS[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  const refuse = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'annulee' } : o));
  };

  const toggleItem = (id: string) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  const savePrice = (id: string) => {
    const val = parseInt(tempPrice, 10);
    if (!isNaN(val) && val > 0) {
      setMenuItems(prev => prev.map(i => i.id === id ? { ...i, price: val } : i));
    }
    setEditingPrice(null);
  };

  const OrderCard = ({ order }: { order: DashboardOrder }) => (
    <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4" style={{ borderLeftColor: order.status === 'en_attente' ? '#f59e0b' : '#3b82f6' }}>
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
      <div className="flex gap-2 mt-3">
        {NEXT_STATUS[order.status] && (
          <button
            onClick={() => advance(order.id)}
            className="flex-1 text-xs text-white px-3 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: '#EA580C' }}
          >
            {NEXT_LABEL[order.status]}
          </button>
        )}
        {order.status === 'en_attente' && (
          <button
            onClick={() => refuse(order.id)}
            className="text-xs text-red-600 px-3 py-2 rounded-lg font-semibold border border-red-200 hover:bg-red-50"
          >
            Refuser
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <UtensilsCrossed size={26} style={{ color: '#EA580C' }} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dashboard Établissement</h1>
              <p className="text-gray-500 text-sm">Maquis Chez Tantie Bio · Albarika</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: isOpen ? '#dcfce7' : '#fee2e2',
              color: isOpen ? '#16a34a' : '#dc2626',
              border: `1.5px solid ${isOpen ? '#86efac' : '#fca5a5'}`,
            }}
          >
            <Power size={16} />
            {isOpen ? 'Ouvert' : 'Fermé'}
            {isOpen ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>

        {!isOpen && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-700 text-sm font-medium text-center">
            <AlertTriangle size={15} className="inline mr-1 align-text-bottom" /> Votre établissement est marqué comme fermé. Les clients ne peuvent pas commander.
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Commandes aujourd\'hui', value: todayOrders, icon: Package, color: '#EA580C' },
            { label: 'Nouvelles', value: newOrders.length, icon: Clock, color: '#f59e0b' },
            { label: 'En cours', value: ongoingOrders.length, icon: CheckCircle, color: '#8b5cf6' },
            { label: 'CA du jour (FCFA)', value: revenue.toLocaleString(), icon: TrendingUp, color: '#10B981' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <kpi.icon size={18} style={{ color: kpi.color }} className="mb-2" />
              <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {([
            { key: 'new', label: `Nouvelles (${newOrders.length})` },
            { key: 'ongoing', label: `En cours (${ongoingOrders.length})` },
            { key: 'done', label: `Terminées (${doneOrders.length})` },
            { key: 'menu', label: 'Menu' },
            { key: 'stats', label: 'Stats' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs whitespace-nowrap transition-all"
              style={activeTab === tab.key ? { backgroundColor: '#EA580C', color: 'white' } : { color: '#6b7280' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Nouvelles commandes */}
        {activeTab === 'new' && (
          <div className="space-y-3">
            {newOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune nouvelle commande</p>
              </div>
            )}
            {newOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}

        {/* Tab: En cours */}
        {activeTab === 'ongoing' && (
          <div className="space-y-3">
            {ongoingOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Clock size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune commande en cours</p>
              </div>
            )}
            {ongoingOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}

        {/* Tab: Terminées */}
        {activeTab === 'done' && (
          <div className="space-y-3">
            {doneOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune commande terminée</p>
              </div>
            )}
            {doneOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 opacity-80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-700">{order.total.toLocaleString()} F</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Menu */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {menuItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  {editingPrice === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={e => setTempPrice(e.target.value)}
                        className="w-20 border border-orange-300 rounded-lg px-2 py-1 text-xs outline-none"
                        onKeyDown={e => e.key === 'Enter' && savePrice(item.id)}
                      />
                      <button onClick={() => savePrice(item.id)} className="text-xs text-white bg-orange-500 px-2 py-1 rounded-lg">OK</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingPrice(item.id); setTempPrice(String(item.price)); }}
                      className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 hover:bg-orange-100 transition-colors"
                      style={{ color: '#EA580C' }}
                    >
                      {item.price.toLocaleString()} F
                    </button>
                  )}
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    style={item.available
                      ? { backgroundColor: '#dcfce7', color: '#16a34a' }
                      : { backgroundColor: '#fee2e2', color: '#dc2626' }
                    }
                  >
                    {item.available ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {item.available ? 'Dispo' : 'Indispo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Stats */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">Ventes de la semaine (FCFA)</h2>
            <div className="space-y-3">
              {[
                ['Lun', 14000], ['Mar', 22000], ['Mer', 18500], ['Jeu', 27000],
                ['Ven', 35000], ['Sam', 48000], ['Dim', 31000],
              ].map(([day, value]) => {
                const max = 48000;
                return (
                  <div key={day} className="flex items-center gap-3 text-sm">
                    <span className="w-8 text-gray-500 text-xs">{day}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                        style={{ width: `${((value as number) / max) * 100}%`, backgroundColor: '#EA580C' }}
                      >
                        {(value as number) >= 10000 ? `${((value as number) / 1000).toFixed(0)}k` : ''}
                      </div>
                    </div>
                    <span className="w-16 text-right text-gray-600 font-medium text-xs">{(value as number).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold" style={{ color: '#EA580C' }}>195 500</p>
                <p className="text-xs text-gray-500">Revenu semaine (FCFA)</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-600">47</p>
                <p className="text-xs text-gray-500">Commandes livrées</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
