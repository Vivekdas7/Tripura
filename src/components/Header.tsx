import { Plane, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type HeaderProps = {
  currentView: 'search' | 'bookings';
  onViewChange: (view: 'search' | 'bookings') => void;
};

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (view: 'search' | 'bookings') => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* --- LOGO --- */}
          <div 
            className="flex items-center gap-2 md:gap-3 cursor-pointer" 
            onClick={() => handleNavClick('search')}
          >
            <div className="bg-orange-600 p-1.5 md:p-2 rounded-xl">
              
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic">
                Tripura<span className="text-orange-600">fly</span>
              </h1>
            </div>
          </div>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-1">
              <button
                onClick={() => handleNavClick('search')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  currentView === 'search'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Find Flights
              </button>
              <button
                onClick={() => handleNavClick('bookings')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  currentView === 'bookings'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                My Bookings
              </button>
            </nav>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Welcome back,</p>
                <p className="text-sm font-bold text-slate-800">{user?.email?.split('@')[0]}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="md:hidden flex items-center gap-3">
             <button
                onClick={() => signOut()}
                className="p-2 text-slate-400"
              >
                <LogOut size={20} />
              </button>
            <button 
              onClick={toggleMenu}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE NAVIGATION DRAWER --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('search')}
              className={`w-full text-left px-4 py-4 rounded-xl font-bold ${
                currentView === 'search'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              Search Flights
            </button>
            <button
              onClick={() => handleNavClick('bookings')}
              className={`w-full text-left px-4 py-4 rounded-xl font-bold ${
                currentView === 'bookings'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-50 text-slate-700'
              }`}
            >
              My Bookings
            </button>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Logged in as</p>
              <p className="text-sm text-slate-800 font-medium truncate">{user?.email}</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}