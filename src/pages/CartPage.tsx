import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, Tag, AlertCircle, Store, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { mockEstablishments, QUARTIERS_PARAKOU, getDeliveryFee } from '../data/mock';

export default function CartPage() {
  const { items, updateQuantity, removeItem, establishmentId, establishmentName, clearCart, quartierLivraison, setQuartierLivraison } = useCartStore();
  const navigate = useNavigate();
  const subtotal = useCartStore(s => s.total());
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const establishment = mockEstablishments.find(e => e.id === establishmentId);
  const deliveryFee = quartierLivraison && establishment
    ? getDeliveryFee(establishment.quartier, quartierLivraison)
    : null;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;
  const minNotMet = establishment && subtotal < establishment.minOrderAmount;

  const handlePromo = () => {
    if (promoCode.trim().toUpperCase() === 'PARAKOU10') {
      setPromoApplied(true);
    } else {
      alert('Code promo invalide');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 text-gray-400">
        <ShoppingBag size={64} className="mb-4 opacity-30" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Votre panier est vide</h2>
        <p className="mb-6 text-sm">Ajoutez des articles depuis nos établissements</p>
        <button onClick={() => navigate('/')} className="text-white px-6 py-3 rounded-xl font-semibold" style={{ backgroundColor: '#EA580C' }}>
          Découvrir les établissements
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Mon panier</h1>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-sm text-orange-700 font-medium flex items-center gap-2">
          <Store size={15} className="flex-shrink-0" /> {establishmentName}
          {establishment && <span className="font-normal"> · {establishment.quartier}</span>}
        </div>

        {/* Min order warning */}
        {minNotMet && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>Commande minimum : <strong>{establishment!.minOrderAmount.toLocaleString()} FCFA</strong> · Il manque {(establishment!.minOrderAmount - subtotal).toLocaleString()} FCFA</span>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm divide-y mb-5">
          {items.map(ci => (
            <div key={ci.item.id} className="flex items-center gap-4 p-4">
              <img src={ci.item.image} alt={ci.item.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{ci.item.name}</p>
                <p className="font-bold text-sm" style={{ color: '#EA580C' }}>{(ci.item.price * ci.quantity).toLocaleString()} FCFA</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center font-semibold text-sm">{ci.quantity}</span>
                <button onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)} className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#EA580C' }}>
                  <Plus size={12} />
                </button>
                <button onClick={() => removeItem(ci.item.id)} className="ml-1 text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quartier livraison */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin size={16} style={{ color: '#EA580C' }} /> Quartier de livraison
          </h2>
          <select
            value={quartierLivraison ?? ''}
            onChange={e => setQuartierLivraison(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400"
          >
            <option value="">-- Choisir votre quartier --</option>
            {QUARTIERS_PARAKOU.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          {quartierLivraison && deliveryFee !== null && (
            <p className="text-xs text-gray-500 mt-2">
              Frais de livraison depuis {establishment?.quartier} → {quartierLivraison} : <strong>{deliveryFee.toLocaleString()} FCFA</strong>
            </p>
          )}
          {quartierLivraison && deliveryFee !== null && (
            <p className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-800">
              Les frais de livraison ne sont pas inclus dans le paiement sur la plateforme. Ils sont à régler directement au livreur à l’arrivée.
            </p>
          )}
        </div>

        {/* Promo code */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Tag size={16} style={{ color: '#EA580C' }} /> Code promo
          </h2>
          {promoApplied ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 rounded-xl px-4 py-2.5">
              <CheckCircle size={16} className="flex-shrink-0" /> Code PARAKOU10 appliqué — 10% de réduction
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Ex : PARAKOU10"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 uppercase"
              />
              <button
                onClick={handlePromo}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: '#EA580C' }}
              >
                Appliquer
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 space-y-2.5">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>À régler au livreur à l’arrivée</span>
            <span>{deliveryFee !== null ? `${deliveryFee.toLocaleString()} FCFA` : '—'}</span>
          </div>
          {promoApplied && (
            <div className="flex justify-between text-green-600 text-sm">
              <span>Réduction (10%)</span><span>−{discount.toLocaleString()} FCFA</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2.5">
            <span>Total à payer sur la plateforme</span>
            <span style={{ color: '#EA580C' }}>{total.toLocaleString()} FCFA</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          disabled={!!minNotMet || deliveryFee === null}
          className="w-full text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: '#EA580C' }}
        >
          {minNotMet ? `Minimum non atteint (${establishment!.minOrderAmount.toLocaleString()} FCFA)` : deliveryFee === null ? 'Choisissez votre quartier' : 'Passer la commande'}
        </button>

        <button onClick={() => { clearCart(); navigate('/'); }} className="w-full mt-3 text-gray-400 py-2.5 text-sm hover:text-red-500">
          Vider le panier
        </button>
      </div>
    </div>
  );
}
