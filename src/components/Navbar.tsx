import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Clock, Home, Utensils } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const itemCount = useCartStore(s => s.itemCount());
  const navigate = useNavigate();

  return (
    <nav style={{ backgroundColor: '#EA580C' }} className="text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Utensils size={22} />
          <span>Food<span style={{ color: '#fef08a' }}>Hub</span> Parakou</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 hover:text-orange-200 transition-colors text-sm">
            <Home size={17} /><span className="hidden sm:inline">Accueil</span>
          </Link>
          <Link to="/orders" className="flex items-center gap-1.5 hover:text-orange-200 transition-colors text-sm">
            <Clock size={17} /><span className="hidden sm:inline">Mes commandes</span>
          </Link>
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-1.5 hover:text-orange-200 transition-colors"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#EA580C] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {itemCount}
              </span>
            )}
            <span className="hidden sm:inline ml-1.5 text-sm">Panier</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
