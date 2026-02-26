import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, UserPlus, LogIn, Loader2, ExternalLink } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWebView, setIsWebView] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  // Detect if user is in an embedded WebView (which Google blocks)
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isMobileWebView = /viber|fbav|instagram|fban|line|wv/i.test(ua);
    setIsWebView(isMobileWebView);
  }, []);

  const handleGoogleSignIn = async () => {
    if (isWebView) {
      setError("Google Login is blocked in WebViews. Please open this site in Chrome or Safari.");
      return;
    }
    
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Note: If successful, the page will redirect away to Google
  };

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
        setError('Check your email for confirmation!');
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

  return (
    <div className="min-h-[100dvh] w-full bg-white flex flex-col lg:flex-row font-sans selection:bg-[#FF5722]/30 overflow-x-hidden">
      
      {/* DESKTOP PANEL (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-black items-end p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/2088210/pexels-photo-2088210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            className="w-full h-full object-cover opacity-60 scale-110 animate-subtle-zoom"
            alt="Skyline"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">
            Fly <span className="text-[#FF5722]">Smarter.</span>
          </h2>
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        <div className="pt-10 pb-4 px-8 flex justify-center lg:justify-start">
          <img src="/assets/logo1.png" className="h-12 w-auto object-contain" alt="TripuraFly" />
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-8 pb-12">
          <div className="w-full max-w-sm">
            <header className="mb-8 text-center lg:text-left">
              <h1 className="text-4xl lg:text-[42px] font-black text-slate-900 uppercase mb-3 italic">
                {isLogin ? 'Sign In' : 'Join Us'}
              </h1>
            </header>

            {/* WEBVIEW WARNING */}
            {isWebView && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <ExternalLink className="text-amber-600 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">
                  You are using an internal browser. For Google Login, please tap the three dots (⋮) and select "Open in Browser".
                </p>
              </div>
            )}

            {/* GOOGLE SIGN IN */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={loading}
              className="w-full mb-4 bg-white border border-slate-200 py-4 rounded-[1.2rem] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Continue with Google</span>
            </button>

            <div className="relative my-8 flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="px-4 text-[9px] font-black text-slate-300 uppercase">OR</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-[10px] font-black text-red-600 uppercase leading-tight">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF5722]" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-[#FF5722] outline-none font-black text-[11px] tracking-widest"
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
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:border-[#FF5722] outline-none font-black text-[11px] tracking-widest"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] active:scale-95 shadow-xl disabled:bg-slate-400 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Authorize' : 'Initialize'}</span>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button type="button" onClick={() => {setIsLogin(!isLogin); setError('');}} className="group flex flex-col items-center gap-2 mx-auto">
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