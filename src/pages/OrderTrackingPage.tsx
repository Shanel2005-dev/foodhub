import { Bike, CheckCircle, ChefHat, Clock, Home, MapPin, Package, Sparkles, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { mockEstablishments } from '../data/mock';
import { useOrderStore } from '../store/orderStore';
import type { OrderStatus } from '../types';

const STEPS: { status: OrderStatus; icon: typeof CheckCircle; label: string; description: string }[] = [
  { status: 'en_attente', icon: Clock, label: 'Envoyée', description: 'La commande attend la confirmation de l’établissement.' },
  { status: 'confirmee', icon: CheckCircle, label: 'Confirmée', description: 'L’établissement a confirmé votre commande.' },
  { status: 'en_preparation', icon: ChefHat, label: 'Préparation', description: 'L’établissement prépare votre commande.' },
  { status: 'prete', icon: Package, label: 'Prête', description: 'La commande est prête à être récupérée par un livreur.' },
  { status: 'acceptee', icon: Bike, label: 'Livreur assigné', description: 'Un livreur a accepté la course et se prépare à récupérer votre commande.' },
  { status: 'recuperee', icon: Bike, label: 'Récupérée', description: 'Le livreur a récupéré votre commande.' },
  { status: 'en_route', icon: Bike, label: 'En route', description: 'Le livreur est en route vers vous.' },
  { status: 'livree', icon: Home, label: 'Livrée', description: 'Votre commande a été livrée. Bon appétit !' },
];

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const orders = useOrderStore((state) => state.orders);
  const requestedId = searchParams.get('order');
  const latestOrder = [...orders].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
  const order = orders.find((candidate) => candidate.id === requestedId) ?? latestOrder;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Package size={44} className="mb-3 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-800">Aucune commande à suivre</h1>
        <p className="mt-2 text-sm text-gray-500">Passez une commande pour voir son suivi ici.</p>
        <Link to="/" className="mt-5 rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: '#EA580C' }}>Retour à l’accueil</Link>
      </div>
    );
  }

  const cancelled = order.status === 'annulee';
  const currentStep = STEPS.findIndex((step) => step.status === order.status);
  const delivered = order.status === 'livree';
  const establishment = mockEstablishments.find((entry) => entry.id === order.establishmentId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-lg w-full">
        <h1 className="text-xl font-bold text-gray-800 text-center mb-1">Suivi de commande</h1>
        <p className="text-gray-400 text-center text-xs mb-2">Commande #{order.id}</p>
        <p className="text-gray-500 text-center text-sm mb-7">{order.establishmentName}</p>

        {cancelled ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-red-700">
            <p className="font-semibold">Cette commande a été annulée.</p>
            {order.paymentStatus === 'rembourse_simule' && <p className="mt-1 text-sm">Remboursement simulé (aucune transaction réelle).</p>}
          </div>
        ) : (
          <>
            <div className="relative mb-7">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 rounded">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{ width: `${(Math.max(currentStep, 0) / (STEPS.length - 1)) * 100}%`, backgroundColor: '#EA580C' }}
                />
              </div>
              <div className="relative flex justify-between">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const done = index <= currentStep;
                  return (
                    <div key={step.status} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / STEPS.length}%` }}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-10"
                        style={{ backgroundColor: done ? '#EA580C' : 'white', borderColor: done ? '#EA580C' : '#e5e7eb', color: done ? 'white' : '#9ca3af' }}
                      >
                        <Icon size={17} />
                      </div>
                      <span className="text-center leading-tight text-gray-600" style={{ fontSize: 9 }}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center mb-5">
              <p className="text-gray-800 font-semibold">
                {currentStep < 0 ? 'Le statut de cette commande est indisponible.' : STEPS[currentStep].description}
              </p>
              {!delivered && <p className="mt-2 text-xs text-gray-500">Le statut évolue quand le restaurant ou le livreur met à jour la commande.</p>}
              {delivered && <Sparkles size={28} className="mx-auto mt-2" style={{ color: '#EA580C' }} />}
              {establishment && <p className="mt-2 text-xs text-gray-500">Délai indicatif : {establishment.deliveryTimeMin} à {establishment.deliveryTimeMax} min.</p>}
            </div>

            {order.livreur && currentStep >= 3 && (
              <div className="flex items-center gap-4 border border-orange-200 rounded-2xl p-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Bike size={22} style={{ color: '#EA580C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{order.livreur.nom}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">Zémidjan · <Star size={11} fill="currentColor" className="text-yellow-400" /> Profil démo</p>
                  <a href={`tel:${order.livreur.telephone}`} className="text-sm font-mono font-semibold" style={{ color: '#EA580C' }}>{order.livreur.telephone}</a>
                </div>
                <a href={`tel:${order.livreur.telephone}`} className="rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: '#EA580C' }}>Appeler</a>
              </div>
            )}
          </>
        )}

        <div className="bg-gray-50 rounded-xl p-3 mb-5 text-xs text-gray-500 flex items-start gap-1.5">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          <span>{order.quartierLivraison} · {order.pointRepereLivraison}</span>
        </div>
        <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Mets</span>
            <span>{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} FCFA</span>
          </div>
          <div className="mt-2 flex justify-between text-gray-600">
            <span>Livraison (à régler au livreur)</span>
            <span>{order.deliveryFee.toLocaleString()} FCFA</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-800">
            <span>{order.paymentMethod === 'especes_livraison' ? 'Total à remettre au livreur' : 'Montant des mets'}</span>
            <span>{(order.paymentMethod === 'especes_livraison'
              ? order.total
              : order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            ).toLocaleString()} FCFA</span>
          </div>
          <p className="mt-2 text-xs font-medium text-orange-700">
            {order.paymentMethod === 'especes_livraison'
              ? `Le montant total, livraison comprise, est à régler au livreur à l'arrivée.`
              : `Les frais de livraison (${order.deliveryFee.toLocaleString()} FCFA) sont exclus du paiement sur la plateforme et à régler au livreur à l'arrivée.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/orders" className="flex-1 text-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700">Mes commandes</Link>
          <Link to="/" className="flex-1 text-center rounded-xl py-3 text-sm font-semibold text-white" style={{ backgroundColor: '#EA580C' }}>Accueil</Link>
        </div>
      </div>
    </div>
  );
}
