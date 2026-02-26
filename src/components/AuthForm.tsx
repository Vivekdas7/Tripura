import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, referralCode);

    if (error) {
      setError(error.message);
    } else if (!isLogin) {
      setError('Account created! Please sign in.');
      setIsLogin(true);
    } else {
      navigate('/'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-white flex flex-col lg:flex-row font-sans selection:bg-[#FF5722]/30">
      
      {/* --- DESKTOP VISUAL PANEL --- */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-black items-end p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/2088210/pexels-photo-2088210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            className="w-full h-full object-cover opacity-60 scale-110 animate-subtle-zoom"
            alt="Tripura Skyline"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-1 w-12 bg-[#FF5722] rounded-full" />
             <span className="text-[#FF5722] font-black tracking-[0.4em] text-xs uppercase">Premium Travel</span>
          </div>
          <h2 className="text-6xl font-black text-white leading-tight uppercase italic tracking-tighter">
            Fly <br /> <span className="text-[#FF5722]">Smarter.</span>
          </h2>
        </div>
      </div>

      {/* --- MAIN FORM AREA --- */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        
        {/* Mobile Header / Logo Area */}
        <div className="pt-12 pb-6 px-8 flex justify-center lg:justify-start">
          <img 
            src="/assets/logo1.png" 
            className="h-16 w-auto object-contain drop-shadow-sm" 
            alt="TripuraFly" 
          />
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-8 pb-12">
          <div className="w-full max-w-sm">
            
            <header className="mb-10 text-center lg:text-left">
              <h1 className="text-4xl lg:text-[42px] font-black text-slate-900 leading-none tracking-tighter uppercase mb-3 italic">
                {isLogin ? 'Sign In' : 'Join Us'}
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em]">
                {isLogin ? 'Access your premium dashboard' : 'Unlock exclusive travel benefits'}
              </p>
            </header>

            {/* Error Message with AnimatePresence */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-tight">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF5722] transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-[6px] focus:ring-[#FF5722]/5 focus:border-[#FF5722] transition-all outline-none font-black text-[11px] tracking-widest text-slate-800 placeholder:text-slate-200"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF5722] transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-[6px] focus:ring-[#FF5722]/5 focus:border-[#FF5722] transition-all outline-none font-black text-[11px] tracking-widest text-slate-800 placeholder:text-slate-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:bg-slate-300 flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Authorize' : 'Initialize'}</span>
                    <ArrowRight size={18} className="text-[#FF5722]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="group flex flex-col items-center gap-2 mx-auto"
              >
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                  {isLogin ? "Don't have an account?" : "Already a member?"}
                </span>
                <span className="text-[#FF5722] text-[11px] font-black uppercase tracking-widest flex items-center gap-2 group-active:scale-90 transition-transform">
                  {isLogin ? <><UserPlus size={14} /> Create Account</> : <><LogIn size={14} /> Log In Now</>}
                </span>
              </button>
            </div>

            <footer className="mt-16 flex flex-col items-center gap-4 opacity-30 grayscale">
               <div className="flex items-center gap-2">
                 <ShieldCheck size={14} />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900">256-Bit SSL Secured</span>
               </div>
               <p className="text-[8px] font-bold uppercase tracking-widest">© 2026 TripuraFly Global</p>
            </footer>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes subtle-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s infinite alternate ease-in-out;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .flex-1::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .flex-1 {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
} 