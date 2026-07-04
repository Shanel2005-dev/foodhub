import { Link } from 'react-router-dom';
import { Utensils, Phone, Mail, MapPin, Heart, Smartphone, Banknote } from 'lucide-react';

const PRIMARY = '#EA580C';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>
              <Utensils size={16} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-base">
              Food<span style={{ color: PRIMARY }}>Hub</span> Parakou
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Restos, maquis, supérettes et boutiques livrés rapidement partout à Parakou. 100% local, 100% Borgou.
          </p>
          {/* Zone de couverture */}
          <div className="text-xs bg-gray-800 rounded-xl p-3">
            <p className="text-gray-300 font-semibold mb-1 flex items-center gap-1"><MapPin size={11} /> Zone de couverture</p>
            <p>Parakou uniquement — Albarika, Banikanni, Tourou, Titirou, Camp Adagbé, Zongo, Guéma, Sinagourou, Kpébié</p>
          </div>
        </div>

        {/* Commander */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Commander</h4>
          <ul className="space-y-2 text-sm">
            {[
              { to: '/', l: 'Tous les établissements' },
              { to: '/cart', l: 'Mon panier' },
              { to: '/orders', l: 'Mes commandes' },
              { to: '/tracking', l: 'Suivi livraison' },
            ].map(({ to, l }) => (
              <li key={l}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Restaurateurs */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Partenaires</h4>
          <ul className="space-y-2 text-sm">
            {[
              { to: '/dashboard', l: 'Espace établissement' },
              { to: '/dashboard', l: 'Gérer mon menu' },
              { to: '/dashboard', l: 'Voir mes commandes' },
            ].map(({ to, l }) => (
              <li key={l}><Link to={to} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact + paiement */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-3 text-sm mb-5">
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: PRIMARY }} />
              <span>Parakou, Département du Borgou, Bénin</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} style={{ color: PRIMARY }} />
              <span>+229 23 61 00 00</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} style={{ color: PRIMARY }} />
              <span>contact@foodhub-parakou.bj</span>
            </li>
          </ul>

          {/* Paiements acceptés */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Paiements acceptés</p>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-yellow-400 text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                <Smartphone size={12} /> MTN MoMo
              </div>
              <div className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">
                <Smartphone size={12} /> Moov Money
              </div>
              <div className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">
                <Banknote size={12} /> Espèces
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
          <p>© 2026 FoodHub Parakou. Tous droits réservés.</p>
          <p className="flex items-center gap-1">Fait avec <Heart size={10} fill={PRIMARY} style={{ color: PRIMARY }} /> à Parakou, Bénin</p>
        </div>
      </div>
    </footer>
  );
}
