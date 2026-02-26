import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, ShieldCheck, LogOut, ChevronRight, Plane, 
  Wallet, Settings, Bell, Save, Star, Armchair, Coffee, 
  History, CreditCard, Lock, Globe, Heart, Smartphone,
  Camera, MapPin, Award, CheckCircle2, ChevronLeft,
  LayoutDashboard, ListTodo, Zap, ShieldAlert, BarChart3,
  UserPlus, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// --- Types ---
type ProfileStats = {
  totalBookings: number;
  totalSpent: number;
  tier: 'Explorer' | 'Silver' | 'Gold' | 'Platinum';
  nextTierProgress: number;
};

type TravelPrefs = {
  seat: 'Window' | 'Aisle' | 'Extra Legroom';
  meal: 'Veg' | 'Non-Veg' | 'Vegan';
  notifications: boolean;
};

// --- Animations ---
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function MyProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ANONYMOUS CHECK: If user is logged in via signInAnonymously
  const isAnonymous = user?.is_anonymous || !user?.email;
  
  // PRIVILEGE CHECK
  const isAdmin = user?.email === 'vgdjfijj@gmail.com';

  const [stats, setStats] = useState<ProfileStats>({ 
    totalBookings: 0, totalSpent: 0, tier: 'Explorer', nextTierProgress: 0 
  });
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    passport: ''
  });

  const [prefs, setPrefs] = useState<TravelPrefs>({
    seat: 'Window',
    meal: 'Veg',
    notifications: true
  });

  useEffect(() => {
    // Guest users can't fetch data from 'profiles' table usually, 
    // so we skip fetch for them to avoid 403 errors
    if (user && !isAnonymous) {
      fetchUserStats();
      fetchProfileData();
    } else if (isAnonymous) {
      setLoading(false);
    }
  }, [user, isAnonymous]);

  const fetchProfileData = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (data) {
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        passport: data.passport || ''
      });
      if (data.preferences) setPrefs(data.preferences);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('user_id', user!.id)
        .eq('status', 'confirmed');

      if (error) throw error;

      const spent = data.reduce((sum, item) => sum + Number(item.total_price), 0);
      const count = data.length;
      
      let userTier: ProfileStats['tier'] = 'Explorer';
      let progress = (count / 5) * 100;

      if (count >= 10) { userTier = 'Platinum'; progress = 100; }
      else if (count >= 5) { userTier = 'Gold'; progress = ((count - 5) / 5) * 100; }
      else if (count >= 2) { userTier = 'Silver'; progress = ((count - 2) / 3) * 100; }

      setStats({ totalBookings: count, totalSpent: spent, tier: userTier, nextTierProgress: progress });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (isAnonymous) return; // Guard clause
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user!.id,
        full_name: formData.full_name,
        phone: formData.phone,
        passport: formData.passport,
        preferences: prefs,
        tier: stats.tier,
        updated_at: new Date()
      });

    setTimeout(() => setSaving(false), 800);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-t-4 border-blue-600 border-r-4 border-r-transparent rounded-full mb-6" 
        />
        <p className="text-slate-900 font-black text-[10px] uppercase tracking-[0.3em]">TripuraFly Sync...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 font-sans pb-24 relative overflow-hidden">
      
      {/* --- ANONYMOUS OVERLAY & BLUR --- */}
      <AnimatePresence>
        {isAnonymous && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 bg-white/20 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white border border-slate-100 rounded-[3rem] p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] text-center relative overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
              
              <div className="pt-6 pb-2 px-8 flex justify-center lg:justify-start">
          <img src="/assets/logo1.png" className="h-50 w-auto object-contain" alt="TripuraFly" />
        </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
                Unlock Your <br /><span className="text-[#FF5722]">Identity</span>
              </h2>
              
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
                You are currently exploring as a guest. <br /> Sign up to save your travel stats, <br /> passport data, and history.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <UserPlus size={16} /> Register Now
                </button>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full bg-white border border-slate-100 text-slate-400 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] active:scale-95 transition-all"
                >
                  Leave Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BACKGROUND CONTENT (BLURRED IF GUEST) --- */}
      <div className={isAnonymous ? "filter blur-sm select-none pointer-events-none" : ""}>
        {/* --- MOBILE NAVIGATION BAR --- */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-black uppercase tracking-widest">Profile Console</span>
          <div className="flex items-center gap-2">
             {isAdmin && (
               <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" title="Admin Active" />
             )}
             <Settings size={18} className="text-slate-400" />
          </div>
        </nav>

        {/* --- HERO PROFILE SECTION --- */}
        <section className="pt-24 pb-8 px-6 flex flex-col items-center">
          <div className="relative mb-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-[3.5rem] bg-slate-50 p-1.5 shadow-2xl relative z-10"
            >
              <div className="w-full h-full rounded-[3.3rem] overflow-hidden bg-white border-2 border-white">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-slate-900 text-white p-2.5 rounded-2xl border-4 border-white shadow-lg">
                <Camera size={16} />
              </button>
            </motion.div>
          </div>

          <motion.h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic">
            {formData.full_name || 'Tripura Guest'}
          </motion.h1>
          <div className="flex items-center gap-2 mb-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
             {user?.email || 'Temporary Identity'}
          </div>

          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Award size={12} /> {stats.tier}
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck size={12} /> {isAnonymous ? 'Unverified' : 'Verified'}
            </span>
          </div>
        </section>

        {/* --- ADMIN TERMINAL --- */}
        {isAdmin && (
          <div className="px-6 mb-12">
            <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-6 shadow-xl relative">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Admin Command Center</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/admin-pannel-vivekdas')} className="bg-slate-50 p-5 rounded-[2rem] flex flex-col gap-2">
                  <LayoutDashboard className="text-blue-600" />
                  <span className="text-[10px] font-black uppercase">Bookings</span>
                </button>
                <button onClick={() => navigate('/flight-manager')} className="bg-slate-50 p-5 rounded-[2rem] flex flex-col gap-2">
                  <Plane className="text-rose-600" />
                  <span className="text-[10px] font-black uppercase">Inventory</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STATS CARD --- */}
        <div className="px-6 mb-12">
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">Contribution</p>
                  <h2 className="text-4xl font-black">₹{stats.totalSpent.toLocaleString()}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">Trips</p>
                  <h2 className="text-2xl font-black">{stats.totalBookings}</h2>
                </div>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full" style={{ width: `${stats.nextTierProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* --- FORM SECTIONS --- */}
        <div className="px-6 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xs font-black uppercase tracking-widest">Passport Data</h3>
              <button onClick={handleUpdateProfile} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Save
              </button>
            </div>
            <div className="space-y-4">
              <ProfileInput label="Legal Name" value={formData.full_name} onChange={(val) => setFormData({...formData, full_name: val})} placeholder="Enter name" />
              <ProfileInput label="Mobile" value={formData.phone} onChange={(val) => setFormData({...formData, phone: val})} placeholder="+91" />
              <ProfileInput label="Passport" value={formData.passport} onChange={(val) => setFormData({...formData, passport: val})} placeholder="Optional" />
            </div>
          </section>

          <section>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton icon={<History className="text-blue-500" />} label="History" />
              <ActionButton icon={<Wallet className="text-purple-500" />} label="TripuraPay" />
              <ActionButton icon={<Globe className="text-emerald-500" />} label="Support" onClick={() => navigate('/support')} />
              <ActionButton icon={<Lock className="text-rose-500" />} label="Security" onClick={() => navigate('/privacy')} />
            </div>
          </section>

          <div className="pt-6">
            <button onClick={handleSignOut} className="w-full bg-white border-2 border-slate-100 text-rose-500 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3">
              <LogOut size={16} /> Termination Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Helper Components ---
function ProfileInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="relative group">
      <label className="text-[8px] font-black text-slate-400 uppercase absolute top-4 left-6 tracking-widest">{label}</label>
      <input 
        className="w-full pt-8 pb-4 px-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-white p-6 rounded-[2.2rem] border border-slate-100 flex flex-col items-center gap-3 transition-all shadow-sm active:scale-95">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">{icon}</div>
      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
    </button>
  );
}