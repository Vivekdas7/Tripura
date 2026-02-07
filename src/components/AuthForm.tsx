import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, Gift, ShieldCheck } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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
    /* FIXED INSET-0 ensures the form covers every pixel of the screen, hiding any layout headers */
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-[#FF5722]/30">
      
      {/* --- LEFT SIDE: CINEMATIC PANEL (Desktop Only) --- */}
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

      {/* --- RIGHT SIDE: THE FORM (Full Screen on Mobile) --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#F8FAFC] relative">
        
        <div className="w-full max-w-sm">
          {/* Internal Logo - Replaces the external header */}
          <div className="flex  items-center ">
            <img 
              src="/assets/logo1.png" 
              className="h-23 w-auto object-contain drop-shadow-sm" 
              alt="TripuraFly" 
            />
            
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-[38px] font-black text-slate-900 leading-none tracking-tighter uppercase mb-2">
              {isLogin ? 'Sign In' : 'Register'}
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              {isLogin ? 'Welcome back to TripuraFly' : 'Start your journey today'}
            </p>
          </div>

          {/* Error/Referral Area */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-shake">
              <p className="text-[11px] font-black text-red-600 uppercase">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF5722] transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl focus:ring-[6px] focus:ring-[#FF5722]/5 focus:border-[#FF5722] transition-all outline-none font-black text-[11px] tracking-widest text-slate-800 placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF5722] transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl focus:ring-[6px] focus:ring-[#FF5722]/5 focus:border-[#FF5722] transition-all outline-none font-black text-[11px] tracking-widest text-slate-800 placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#FF5722] transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:bg-slate-200 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Authenticate' : 'Complete Setup'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[#FF5722] text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
            >
              {isLogin ? 'New to TripuraFly? Create Account' : 'Already Have Access? Log In'}
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 opacity-20 grayscale">
             <ShieldCheck size={14} />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Cloud Secured</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes subtle-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s infinite alternate ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}