import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ChefHat, Package, Bike, Home, MapPin, Star, Sparkles } from 'lucide-react';

const STEPS = [
  { icon: CheckCircle, label: 'Confirmée', description: 'Votre commande a été reçue et confirmée par l\'établissement', time: 0 },
  { icon: ChefHat, label: 'En préparation', description: 'L\'établissement prépare votre commande avec soin', time: 3500 },
  { icon: Package, label: 'Récupérée', description: 'Le livreur a récupéré votre commande', time: 7000 },
  { icon: Bike, label: 'En route', description: 'Le zémidjan est en route vers vous !', time: 10500 },
  { icon: Home, label: 'Livrée !', description: 'Votre commande est arrivée. Bon appétit !', time: 14000 },
];

const LIVREUR = {
  nom: 'Moussa Sabi',
  telephone: '+229 97 12 34 56',
  moyenTransport: 'moto',
  note: 4.9,
};

export default function OrderTrackingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timers = STEPS.slice(1).map((step, i) =>
      setTimeout(() => setCurrentStep(i + 1), step.time)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const delivered = currentStep === STEPS.length - 1;
  const showLivreur = currentStep >= 3;
  const orderId = `FH-${Date.now().toString().slice(-5)}`;

  const remainingMs = delivered ? 0 : (STEPS[currentStep + 1]?.time ?? STEPS[currentStep].time) - (STEPS[currentStep].time ?? 0);
  const remainingMin = Math.ceil(remainingMs / 60000) || 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-md w-full">
        <h1 className="text-xl font-bold text-gray-800 text-center mb-1">Suivi de commande</h1>
        <p className="text-gray-400 text-center text-xs mb-7">Commande #{orderId}</p>

        {/* Timeline */}
        <div className="relative mb-8">
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 rounded">
            <div
              className="h-full rounded transition-all duration-1000"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%`, backgroundColor: '#EA580C' }}
            />
          </div>
          <div className="relative flex justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / STEPS.length}%` }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 relative z-10"
                    style={{
                      backgroundColor: done ? '#EA580C' : 'white',
                      borderColor: done ? '#EA580C' : '#e5e7eb',
                      color: done ? 'white' : '#9ca3af',
                      boxShadow: active ? '0 0 0 4px rgba(234,88,12,0.2)' : 'none',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-center leading-tight text-gray-600" style={{ fontSize: 10 }}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current status */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center mb-5">
          <p className="text-gray-800 font-semibold">{STEPS[currentStep].description}</p>
          {!delivered && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
              <Clock size={14} className="animate-pulse text-orange-400" />
              <span>Prochaine mise à jour dans ~{remainingMin} min</span>
            </div>
          )}
          {delivered && (
            <div className="flex justify-center mt-2">
              <Sparkles size={32} style={{ color: '#EA580C' }} />
            </div>
          )}
        </div>

        {/* Livreur card */}
        {showLivreur && (
          <div className="flex items-center gap-4 bg-white border border-orange-200 rounded-2xl p-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Bike size={22} style={{ color: '#EA580C' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">{LIVREUR.nom}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">Zémidjan · <Star size={11} fill="currentColor" className="text-yellow-400" /> {LIVREUR.note}</p>
              <a href={`tel:${LIVREUR.telephone}`} className="text-sm font-mono font-semibold" style={{ color: '#EA580C' }}>
                {LIVREUR.telephone}
              </a>
            </div>
            <a
              href={`tel:${LIVREUR.telephone}`}
              className="flex-shrink-0 text-white px-3 py-2 rounded-xl text-xs font-bold"
              style={{ backgroundColor: '#EA580C' }}
            >
              Appeler
            </a>
          </div>
        )}

        {/* Delivery address reminder */}
        <div className="bg-gray-50 rounded-xl p-3 mb-5 text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
          <MapPin size={12} /> Livraison à votre point de repère indiqué lors de la commande
        </div>

        {delivered && (
          <button
            onClick={() => navigate('/orders')}
            className="w-full text-white py-4 rounded-2xl font-bold shadow-lg"
            style={{ backgroundColor: '#EA580C' }}
          >
            Voir mes commandes
          </button>
        )}
      </div>
    </div>
  );
}
