import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Package, Star, RotateCcw, MapPin, CreditCard, Bike, CheckCircle, Eye } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import type { OrderStatus, PaymentMethod } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-gray-100 text-gray-600' },
  confirmee: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  en_preparation: { label: 'En préparation', color: 'bg-yellow-100 text-yellow-700' },
  prete: { label: 'Prête', color: 'bg-purple-100 text-purple-700' },
  acceptee: { label: 'Livreur assigné', color: 'bg-indigo-100 text-indigo-700' },
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
  const orders = useOrderStore((state) => state.orders);
  const rateOrder = useOrderStore((state) => state.rateOrder);
  const navigate = useNavigate();
  const sortedOrders = [...orders].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const handleReorder = (establishmentId: string) => {
    navigate(`/restaurant/${establishmentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes commandes</h1>

        {sortedOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucune commande pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map(order => {
              const status = STATUS_CONFIG[order.status];
              const isExpanded = expanded === order.id;
              const isDelivered = order.status === 'livree';
              const hasRating = order.rating !== undefined;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    className="w-full p-5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors gap-3"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{order.establishmentName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.date} · {(order.paymentMethod === 'especes_livraison'
                          ? order.total
                          : order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                        ).toLocaleString()} FCFA à payer {order.paymentMethod === 'especes_livraison' ? 'à la livraison' : 'sur la plateforme'}
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
                            <span>Livraison (à payer au livreur)</span>
                            <span>{order.deliveryFee.toLocaleString()} F</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm">
                            <span>{order.paymentMethod === 'especes_livraison' ? 'Total à remettre au livreur' : 'Montant des mets'}</span>
                            <span style={{ color: '#EA580C' }}>
                              {(order.paymentMethod === 'especes_livraison'
                                ? order.total
                                : order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                              ).toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-3 space-y-1.5 text-xs text-gray-400">
                          <p className="flex items-center gap-1"><CreditCard size={11} /> {PAYMENT_LABELS[order.paymentMethod]}</p>
                          {order.paymentStatus === 'simule' && <p className="text-amber-700">Les mets sont à payer sur la plateforme (simulation uniquement). Les frais de livraison sont à régler au livreur à l’arrivée.</p>}
                          {order.paymentStatus === 'a_la_livraison' && <p>Montant total à régler au livreur à la livraison (mets et frais de livraison).</p>}
                          {order.paymentStatus === 'paye_livraison' && <p className="text-green-700">Espèces encaissées à la livraison (démo).</p>}
                          {order.paymentStatus === 'rembourse_simule' && <p className="text-amber-700">Remboursement simulé — aucune transaction réelle.</p>}
                          {order.customerPhone && <p>Téléphone : {order.customerPhone}</p>}
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
                                  onClick={() => rateOrder(order.id, star)}
                                  className="text-2xl transition-transform hover:scale-110"
                                  aria-label={`Noter ${star} sur 5`}
                                >
                                  <Star
                                    size={24}
                                    className={star <= (order.rating ?? 0) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}
                                    fill={star <= (order.rating ?? 0) ? 'currentColor' : 'none'}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {isDelivered && hasRating && (
                          <div className="mt-3 text-xs text-green-600 font-medium bg-green-50 rounded-xl px-3 py-2">
                            <CheckCircle size={13} className="inline mr-1 align-text-bottom" /> Merci pour votre avis ! Vous avez noté {order.rating}/5
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Link
                            to={`/tracking?order=${encodeURIComponent(order.id)}`}
                            className="flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold"
                            style={{ borderColor: '#EA580C', color: '#EA580C' }}
                          >
                            <Eye size={15} /> Suivre
                          </Link>
                          <button
                            onClick={() => handleReorder(order.establishmentId)}
                            className="flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold"
                            style={{ borderColor: '#EA580C', color: '#EA580C' }}
                          >
                            <RotateCcw size={15} /> Recommander
                          </button>
                        </div>
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
