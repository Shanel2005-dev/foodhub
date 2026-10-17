import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Search, Star, Clock, ChevronRight, MapPin, ShoppingBag, LayoutGrid, Utensils, Flame, ShoppingBasket, Cookie, Store } from 'lucide-react';
import { mockEstablishments, QUARTIERS_PARAKOU } from '../data/mock';
import { useMenuStore } from '../store/menuStore';
import { CATEGORY_LABELS, CATEGORY_ICONS, type EstablishmentCategory } from '../types';

const FILTER_CATEGORIES: { key: EstablishmentCategory | 'tous'; label: string; Icon: LucideIcon }[] = [
  { key: 'tous', label: 'Tous', Icon: LayoutGrid },
  { key: 'restaurant', label: 'Restaurants', Icon: Utensils },
  { key: 'maquis', label: 'Maquis', Icon: Flame },
  { key: 'superette', label: 'Supérettes', Icon: ShoppingBasket },
  { key: 'patisserie', label: 'Pâtisseries', Icon: Cookie },
  { key: 'boutique', label: 'Boutiques', Icon: Store },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<EstablishmentCategory | 'tous'>('tous');
  const [activeQuartier, setActiveQuartier] = useState('');
  const menus = useMenuStore((state) => state.menus);

  const filtered = mockEstablishments.filter(e => {
    const query = search.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const priceQuery = /\d/.test(search) ? search.replace(/\D/g, '') : '';
    const menu = menus[e.id] ?? e.menu;
    const matchSearch =
      !query ||
      e.name.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
      menu.some(cat => cat.items.some(item => {
        const searchableText = `${item.name} ${item.description}`.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return searchableText.includes(query) || (!!priceQuery && String(item.price) === priceQuery);
      }));
    const matchCat = activeCategory === 'tous' || e.category === activeCategory;
    const matchQuartier = !activeQuartier || e.quartier === activeQuartier;
    return matchSearch && matchCat && matchQuartier;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[580px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=90"
          alt="FoodHub Parakou"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(18,18,18,0.48)0%,rgba(28,28,28,0.36)60%,rgba(14,14,14,0.42)100%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center text-white w-full">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold mb-6 uppercase tracking-widest" style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)' }}>
            <MapPin size={13} /> Livraison rapide à Parakou
          </div>

          <h1 className="font-extrabold leading-tight mb-4 drop-shadow-xl" style={{ fontSize: 'clamp(2.2rem,6vw,3.8rem)', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}>
            Restos, supérettes, boutiques —<br />
            <span style={{ color: '#fb923c' }}>livrés chez vous à Parakou</span>
          </h1>

          <p className="text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.82)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            Commandez auprès des meilleurs établissements de Parakou. Paiement MTN MoMo, Moov Money ou espèces à la livraison.
          </p>

          {/* Search bar */}
          <form
            onSubmit={e => e.preventDefault()}
            className="mx-auto mb-8 w-full max-w-xl"
          >
            <div className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/85 px-4 shadow-lg shadow-black/20 transition focus-within:border-white focus-within:bg-white/95">
              <Search size={18} className="shrink-0 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Plat, produit ou prix (ex. 1 500 FCFA)"
                aria-label="Rechercher un restaurant, un plat, un produit ou un prix"
                className="h-11 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
              />
            </div>
          </form>

        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'none' }}>
            {FILTER_CATEGORIES.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-medium whitespace-nowrap text-sm transition-all flex-shrink-0"
                style={
                  activeCategory === key
                    ? { backgroundColor: '#EA580C', color: 'white', boxShadow: '0 2px 8px rgba(234,88,12,0.4)' }
                    : { backgroundColor: 'white', color: '#4b5563', border: '1px solid #e5e7eb' }
                }
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Quartier filter */}
          <select
            value={activeQuartier}
            onChange={e => setActiveQuartier(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 outline-none cursor-pointer flex-shrink-0"
          >
            <option value="">Tous les quartiers</option>
            {QUARTIERS_PARAKOU.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          {filtered.length} établissement{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
          {activeQuartier && <span className="font-normal text-gray-500"> à {activeQuartier}</span>}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(estab => {
            const CategoryIcon = CATEGORY_ICONS[estab.category];
            return (
            <Link
              key={estab.id}
              to={`/restaurant/${estab.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              <div className="relative overflow-hidden h-44">
                <img
                  src={estab.image}
                  alt={estab.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!estab.isOpen && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="bg-white text-gray-800 px-4 py-1 rounded-full font-semibold text-sm">Fermé</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                    <CategoryIcon size={11} /> {CATEGORY_LABELS[estab.category]}
                  </span>
                </div>
                {estab.isOpen && (
                  <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Ouvert
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-800 text-base leading-tight">{estab.name}</h3>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                </div>

                <p className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin size={11} /> {estab.quartier} · {estab.pointRepere.slice(0, 40)}{estab.pointRepere.length > 40 ? '…' : ''}
                </p>

                <p className="text-gray-500 text-sm mb-3 line-clamp-1">{estab.description}</p>

                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-yellow-600 font-medium">
                    <Star size={13} fill="currentColor" />{estab.rating}
                    <span className="text-gray-400 font-normal">({estab.reviewCount})</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock size={13} />{estab.deliveryTimeMin}–{estab.deliveryTimeMax} min
                  </span>
                  {estab.minOrderAmount > 0 && (
                    <span className="text-gray-400 text-xs">Min. {estab.minOrderAmount.toLocaleString()} F</span>
                  )}
                </div>
              </div>
            </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun établissement trouvé</p>
            <p className="text-sm mt-1">Essayez un autre quartier ou catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
}
