import { LogOut, Menu, X, Sparkles, Plane, Headphones, ArrowRight, Phone } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinkClasses = ({ isActive }) =>
    `px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
      isActive
        ? 'bg-[#FF9D00] text-white shadow-lg shadow-orange-200'
        : 'text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-100">
     

      {/* --- FIXED MOBILE DRAWER --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-0 bg-white z-[200] md:hidden overflow-y-auto">
          <div className="flex flex-col min-h-screen p-6">
            
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-2xl font-black tracking-tighter">
                <span className="text-[#1A1C8B]">Tripura</span><span className="text-[#FF9D00]">Fly</span>
              </h1>
              <button onClick={toggleMenu} className="p-3 bg-slate-100 rounded-2xl"><X size={24}/></button>
            </div>

            {/* Profile Card */}
            <div className="bg-[#1A1C8B] p-6 rounded-[32px] text-white shadow-xl mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">Account Executive</p>
                <h3 className="text-xl font-black truncate mb-4">{user?.email?.split('@')[0]}</h3>
                <a href="tel:+919366159066" className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                    <Phone size={16} className="text-orange-400" />
                    <span className="text-xs font-bold">+91 93661 59066</span>
                </a>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <NavLink 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={({isActive}) => `flex items-center justify-between p-5 rounded-[24px] font-bold ${isActive ? 'bg-orange-50 text-[#FF9D00]' : 'bg-slate-50 text-slate-700'}`}
              >
                <div className="flex items-center gap-4"><Plane size={20} /> Find Flights</div>
                <ArrowRight size={18} />
              </NavLink>

              <NavLink 
                to="/bookings" 
                onClick={() => setIsMenuOpen(false)}
                className={({isActive}) => `flex items-center justify-between p-5 rounded-[24px] font-bold ${isActive ? 'bg-orange-50 text-[#FF9D00]' : 'bg-slate-50 text-slate-700'}`}
              >
                <div className="flex items-center gap-4"><Sparkles size={20} /> My Bookings</div>
                <ArrowRight size={18} />
              </NavLink>
            </div>

            {/* Sign Out */}
            <div className="mt-auto pt-10">
               <button 
                onClick={() => { signOut(); setIsMenuOpen(false); }}
                className="w-full py-5 bg-red-50 text-red-600 rounded-[24px] font-black flex items-center justify-center gap-3"
               >
                <LogOut size={20} /> Sign Out
               </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}