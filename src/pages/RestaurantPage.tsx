import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Plus, ShoppingCart, ArrowLeft, Lock, ShoppingBasket } from 'lucide-react';
import { mockEstablishments } from '../data/mock';
import { useCartStore } from '../store/cartStore';
import { useMenuStore } from '../store/menuStore';
import { CATEGORY_LABELS, CATEGORY_ICONS, type MenuItem } from '../types';

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items, itemCount } = useCartStore();
  const menu = useMenuStore((state) => id ? state.menus[id] : undefined);
  const estab = mockEstablishments.find(e => e.id === id);

  if (!estab) return <div className="text-center py-20 text-gray-400">Établissement introuvable</div>;

  const CategoryIcon = CATEGORY_ICONS[estab.category];
  const establishmentMenu = menu ?? estab.menu;
  const getCount = (itemId: string) => items.find(ci => ci.item.id === itemId)?.quantity ?? 0;

  const handleAdd = (item: MenuItem) => {
    if (!estab.isOpen) return;
    addItem(item, estab.id, estab.name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header image */}
      <div className="relative h-56 md:h-72">
        <img src={estab.image} alt={estab.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors shadow-md"
        >
          <ArrowLeft size={20} />
        </button>

        {!estab.isOpen && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-xl flex items-center gap-2">
              <Lock size={18} className="text-gray-500" />
              <span className="font-bold text-gray-800">Établissement fermé</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
              <CategoryIcon size={13} /> {CATEGORY_LABELS[estab.category]}
            </span>
            {estab.isOpen
              ? <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full font-bold">Ouvert</span>
              : <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full font-bold">Fermé</span>
            }
          </div>
          <h1 className="text-2xl md:text-3xl font-bold drop-shadow">{estab.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm">
            <span className="flex items-center gap-1"><Star size={13} fill="currentColor" className="text-yellow-400" />{estab.rating} ({estab.reviewCount} avis)</span>
            <span className="flex items-center gap-1"><Clock size={13} />{estab.deliveryTimeMin}–{estab.deliveryTimeMax} min</span>
            <span className="flex items-center gap-1"><MapPin size={13} />{estab.quartier}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Info bar */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 mb-5 text-sm text-orange-800 space-y-1">
          <p className="flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 flex-shrink-0" /><span><strong>Point de repère :</strong> {estab.pointRepere}</span></p>
          {estab.minOrderAmount > 0 && (
            <p className="flex items-center gap-1.5"><ShoppingBasket size={13} className="flex-shrink-0" /><span><strong>Commande minimum :</strong> {estab.minOrderAmount.toLocaleString()} FCFA</span></p>
          )}
        </div>

        {!estab.isOpen && (
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mb-5 text-center text-gray-600 text-sm font-medium">
            Cet établissement est actuellement fermé. Revenez plus tard pour commander.
          </div>
        )}

        {/* Menu */}
        {establishmentMenu.map(category => (
          <div key={category.name} className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.items.map(item => {
                const count = getCount(item.id);
                const disabled = !estab.isOpen || item.available === false;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl overflow-hidden shadow-sm flex ${disabled ? 'opacity-60' : ''}`}
                  >
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                      {item.popular && <span className="text-xs text-orange-600 font-medium flex items-center gap-0.5"><Star size={11} fill="currentColor" /> Populaire</span>}
                      {item.available === false && <span className="text-xs text-gray-400 font-medium ml-1">Indisponible</span>}
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                      <p className="font-bold mt-2 text-sm" style={{ color: '#EA580C' }}>{item.price.toLocaleString()} FCFA</p>
                      <button
                        onClick={() => handleAdd(item)}
                        disabled={disabled}
                        className="mt-2.5 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors disabled:cursor-not-allowed"
                        style={{ backgroundColor: disabled ? '#d1d5db' : '#EA580C' }}
                      >
                        <Plus size={14} />
                        {count > 0 ? `Ajouter (${count} au panier)` : 'Ajouter'}
                      </button>
                    </div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover self-center mr-3 rounded-lg flex-shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {itemCount() > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
          <button
            onClick={() => navigate('/cart')}
            className="w-full flex items-center justify-center gap-3 text-white px-6 py-4 rounded-2xl shadow-xl font-semibold text-base"
            style={{ backgroundColor: '#EA580C' }}
          >
            <ShoppingCart size={20} />
            Voir le panier · {itemCount()} article{itemCount() > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
