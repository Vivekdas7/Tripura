import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Plane, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      setError(error.message);
    } else if (!isLogin) {
      setError('Account created! Please sign in.');
      setIsLogin(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      
      {/* --- LEFT SIDE: THEMATIC VISUAL (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-950 items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1621356880091-6f7773248c8b?q=80&w=1000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40 brightness-75"
            alt="Tripura Heritage"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-transparent to-orange-500/20"></div>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-600 p-2 rounded-xl">
              <Plane size={32} className="text-white transform -rotate-45" />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">TripuraFly</h1>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            The Most <span className="text-orange-500">Affordable</span> Way to Explore the Northeast.
          </h2>
          <p className="text-indigo-100 text-xl font-light leading-relaxed">
            Join thousands of travelers booking cheap flights to Agartala every day. Your journey to the Queen of Hills starts here.
          </p>
          
          <div className="mt-12 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-orange-400 font-bold text-2xl">10k+</p>
              <p className="text-indigo-200 text-xs uppercase tracking-widest">Happy Travelers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-orange-400 font-bold text-2xl">50+</p>
              <p className="text-indigo-200 text-xs uppercase tracking-widest">Daily Routes</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Plane size={24} className="text-white transform -rotate-45" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter">TripuraFly</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Enter your details to access your bookings.' : 'Join us for exclusive fares to Tripura.'}
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              error.includes('created') 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              <div className={`w-2 h-2 rounded-full ${error.includes('created') ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create My Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-slate-500 font-medium">
              {isLogin ? "Don't have an account? " : "Already a member? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-orange-600 font-bold hover:text-orange-700 transition-colors ml-1"
              >
                {isLogin ? 'Register Now' : 'Log In'}
              </button>
            </p>
          </div>

          <footer className="mt-12 pt-8 border-t border-slate-100 hidden lg:block">
            <p className="text-slate-400 text-xs font-medium">
              By continuing, you agree to TripuraFly's Terms of Service and Privacy Policy. Secure 256-bit SSL encrypted connection.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}