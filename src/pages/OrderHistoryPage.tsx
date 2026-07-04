import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Package, Star, RotateCcw, MapPin, CreditCard, Bike, CheckCircle } from 'lucide-react';
import { mockOrders } from '../data/mock';
import type { OrderStatus, PaymentMethod } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-gray-100 text-gray-600' },
  confirmee: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  en_preparation: { label: 'En préparation', color: 'bg-yellow-100 text-yellow-700' },
  recuperee: { label: 'Récupérée', color: 'bg-purple-100 text-purple-700' },
  en_route: { label: 'En route', color: 'bg-orange-100 text-orange-700' },
  livree: { label: 'Livrée ✓', color: 'bg-green-100 text-green-700' },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-600' },
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mtn_momo: 'MTN Mobile Money',
  moov_money: 'Moov Money',
  especes_livraison: 'Espèces à la livraison',
};

export default function OrderHistoryPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rated, setRated] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const handleReorder = (establishmentId: string) => {
    navigate(`/restaurant/${establishmentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes commandes</h1>

        {mockOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucune commande pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockOrders.map(order => {
              const status = STATUS_CONFIG[order.status];
              const isExpanded = expanded === order.id;
              const isDelivered = order.status === 'livree';
              const hasRating = order.id in rated;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    className="w-full p-5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors gap-3"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{order.establishmentName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.date} · {order.total.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {order.quartierLivraison}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <div className="mt-4 space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} × {item.quantity}</span>
                            <span className="font-medium">{(item.price * item.quantity).toLocaleString()} F</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 space-y-1">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Livraison</span>
                            <span>{order.deliveryFee.toLocaleString()} F</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm">
                            <span>Total</span>
                            <span style={{ color: '#EA580C' }}>{order.total.toLocaleString()} FCFA</span>
                          </div>
                        </div>

                        <div className="border-t pt-3 space-y-1.5 text-xs text-gray-400">
                          <p className="flex items-center gap-1"><CreditCard size={11} /> {PAYMENT_LABELS[order.paymentMethod]}</p>
                          <p className="flex items-start gap-1"><MapPin size={11} className="mt-0.5 flex-shrink-0" /> {order.pointRepereLivraison}</p>
                          {order.livreur && (
                            <p className="flex items-center gap-1"><Bike size={11} /> Livré par {order.livreur.nom} · {order.livreur.telephone}</p>
                          )}
                        </div>

                        {/* Rating */}
                        {isDelivered && !hasRating && (
                          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Comment était cette commande ?</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => setRated(r => ({ ...r, [order.id]: star }))}
                                  className="text-2xl transition-transform hover:scale-110"
                                >
                                  <Star
                                    size={24}
                                    className="text-gray-300 hover:text-yellow-400 transition-colors"
                                    fill="none"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {isDelivered && hasRating && (
                          <div className="mt-3 text-xs text-green-600 font-medium bg-green-50 rounded-xl px-3 py-2">
                            <CheckCircle size={13} className="inline mr-1 align-text-bottom" /> Merci pour votre avis ! Vous avez noté {rated[order.id]}/5
                          </div>
                        )}

                        {/* Reorder */}
                        <button
                          onClick={() => handleReorder(order.establishmentId)}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors"
                          style={{ borderColor: '#EA580C', color: '#EA580C' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#EA580C'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#EA580C'; }}
                        >
                          <RotateCcw size={15} />
                          Recommander chez {order.establishmentName.split(' ').slice(0, 2).join(' ')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
