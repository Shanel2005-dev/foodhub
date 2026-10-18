import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Clock, Home, Utensils, Store, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const itemCount = useCartStore(s => s.itemCount());
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: '#EA580C' }} className="text-white shadow-lg sticky top-0 z-50">
      <div className="relative max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Utensils size={22} />
          <span>Food<span style={{ color: '#fef08a' }}>Hub</span> Parakou</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/" className="flex items-center gap-1.5 hover:text-orange-200 transition-colors text-sm">
            <Home size={17} /><span>Accueil</span>
          </Link>
          <Link to="/orders" className="flex items-center gap-1.5 hover:text-orange-200 transition-colors text-sm">
            <Clock size={17} /><span>Mes commandes</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-orange-200 transition-colors text-sm">
            <Store size={17} /><span>Espace restaurant</span>
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
            <span className="ml-1.5 text-sm">Panier</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(open => !open)}
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/15 md:hidden"
        >
          {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="absolute left-0 right-0 top-16 border-t border-white/20 bg-[#d94f08] p-3 shadow-xl md:hidden">
            <div className="flex flex-col gap-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/10">
                <Home size={19} /> Accueil
              </Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/10">
                <Clock size={19} /> Mes commandes
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/10">
                <Store size={19} /> Espace restaurant
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-white/10">
                <span className="relative">
                  <ShoppingCart size={19} />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#EA580C]">
                      {itemCount}
                    </span>
                  )}
                </span>
                Panier
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
