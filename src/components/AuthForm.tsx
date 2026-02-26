import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, UserPlus, LogIn, Loader2, UserCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Destructure signInAnonymously if you added it to your AuthContext
  const { signIn, signUp, signInAnonymously } = useAuth(); 
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const { error: authError } = isLogin
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, referralCode);

      if (authError) {
        setError(authError.message);
      } else if (!isLogin) {
        setError('Verification email sent! Please check your inbox.');
        setIsLogin(true);
      } else {
        navigate('/'); 
      }
    } catch (err: any) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Real Anonymous Sign-In Logic
  const handleGuestEntry = async () => {
    setLoading(true);
    setError('');
    try {
      // If your AuthContext doesn't have this yet, you can use:
      // await supabase.auth.signInAnonymously()
      const { error: guestError } = await signInAnonymously();
      
      if (guestError) throw guestError;
      
      navigate('/'); 
    } catch (err: any) {
      setError("Guest access failed. Please try email login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-white flex flex-col lg:flex-row font-sans selection:bg-[#FF5722]/30 overflow-x-hidden">
      
      {/* DESKTOP PANEL */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-black items-end p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/2088210/pexels-photo-2088210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            className="w-full h-full object-cover opacity-60 scale-110"
            alt="Skyline"
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

      {/* MAIN FORM AREA */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        <div className="pt-10 pb-4 px-8 flex justify-center lg:justify-start">
          <img src="/assets/logo1.png" className="h-12 w-auto object-contain" alt="TripuraFly" />
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-8 pb-12">
          <div className="w-full max-w-sm">
            <header className="mb-8 text-center lg:text-left">
              <h1 className="text-4xl lg:text-[42px] font-black text-slate-900 leading-none tracking-tighter uppercase mb-3 italic">
                {isLogin ? 'Sign In' : 'Join Us'}
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em]">
                {isLogin ? 'Access your premium dashboard' : 'Unlock exclusive travel benefits'}
              </p>
            </header>

            <button
              onClick={handleGuestEntry}
              type="button"
              disabled={loading}
              className="w-full mb-4 bg-white border border-slate-200 py-4 rounded-[1.2rem] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-sm hover:border-[#FF5722]/50 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : (
                <>
                  <UserCircle className="w-5 h-5 text-slate-400 group-hover:text-[#FF5722] transition-colors" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Explore as Guest</span>
                </>
              )}
            </button>

            <div className="relative my-8 flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">OR AUTHENTICATE</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-tight leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF5722]" size={18} />
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-[#FF5722] transition-all outline-none font-black text-[11px] tracking-widest text-slate-800"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF5722]" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-[#FF5722] transition-all outline-none font-black text-[11px] tracking-widest text-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] active:scale-95 transition-all shadow-xl disabled:bg-slate-400 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Authorize' : 'Initialize'}</span>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button type="button" onClick={() => {setIsLogin(!isLogin); setError('');}} className="group flex flex-col items-center gap-2 mx-auto">
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                  {isLogin ? "Don't have an account?" : "Already a member?"}
                </span>
                <span className="text-[#FF5722] text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  {isLogin ? <><UserPlus size={14} /> Create Account</> : <><LogIn size={14} /> Log In Now</>}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}