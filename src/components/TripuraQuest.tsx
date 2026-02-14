import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, ShieldCheck, LogOut, ChevronRight, Plane, 
  Wallet, Settings, Bell, Save, Star, Armchair, Coffee, 
  History, CreditCard, Lock, Globe, Heart, Smartphone,
  Camera, MapPin, Award, CheckCircle2, ChevronLeft,
  LayoutDashboard, ListTodo, Zap, ShieldAlert, BarChart3
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
  
  // PRIVILEGE CHECK
  const isAdmin = user?.email === 'dasvivek398@gmail.com';

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
    if (user) {
      fetchUserStats();
      fetchProfileData();
    }
  }, [user]);

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
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-24">
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
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-slate-900 text-white p-2.5 rounded-2xl border-4 border-white shadow-lg active:scale-90 transition-transform">
              <Camera size={16} />
            </button>
          </motion.div>
          {/* Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-slate-100 rounded-full" />
        </div>

        <motion.h1 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-3xl font-black tracking-tighter mb-1"
        >
          {formData.full_name || 'Tripura Traveler'}
        </motion.h1>
        <div className="flex items-center gap-2 mb-6">
           <p className="text-slate-400 text-xs font-bold">{user?.email}</p>
           {isAdmin && <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase">Root</span>}
        </div>

        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Award size={12} /> {stats.tier}
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={12} /> Verified
          </span>
        </div>
      </section>

      {/* --- ADMIN TERMINAL (ONLY FOR dasvivek398@gmail.com) --- */}
      {isAdmin && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 mb-12"
          >
            <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative">
              {/* Caution Pattern Background */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#f1f5f9,#f1f5f9_10px,#000_10px,#000_20px)] opacity-10" />
              
              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <ShieldAlert size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Admin Command Center</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* COMPONENT 1: ADMIN DASHBOARD */}
                <button 
                  onClick={() => navigate('/admin-pannel-vivekdas')}
                  className="bg-slate-50 hover:bg-slate-100 p-5 rounded-[2rem] flex flex-col items-start gap-3 transition-all border border-slate-100 group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <LayoutDashboard size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">Bookings</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Manage Manifest</p>
                  </div>
                </button>

                {/* COMPONENT 2: FLIGHT DETAILS / SKYMANAGER */}
                <button 
                  onClick={() => navigate('/flight-manager')}
                  className="bg-slate-50 hover:bg-slate-100 p-5 rounded-[2rem] flex flex-col items-start gap-3 transition-all border border-slate-100 group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Plane size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">Inventory</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">SkyManager Pro</p>
                  </div>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Systems Online</span>
                </div>
                <BarChart3 size={14} className="text-slate-200" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* --- STATS CARD --- */}
      <div className="px-6 mb-12">
        <motion.div 
          variants={fadeInUp} initial="initial" whileInView="animate"
          className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200"
        >
          <div className="absolute top-0 right-0 opacity-10">
            <Zap size={200} className="-mr-10 -mt-10" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Total Contribution</p>
                <h2 className="text-4xl font-black tracking-tighter">₹{stats.totalSpent.toLocaleString()}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Trips</p>
                <h2 className="text-2xl font-black tracking-tighter">{stats.totalBookings}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Tier progress</p>
                <p className="text-[10px] font-black uppercase text-white">{Math.round(stats.nextTierProgress)}%</p>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.nextTierProgress}%` }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- FORM SECTIONS --- */}
      <div className="px-6 space-y-12">
        
        {/* IDENTITY */}
        <motion.section variants={staggerContainer} initial="initial" whileInView="animate">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center">
                <User size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">Passport Data</h3>
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all shadow-xl shadow-slate-200"
            >
              {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <Save size={14} />}
              {saving ? 'Syncing' : 'Save'}
            </button>
          </div>

          <div className="space-y-4">
            <ProfileInput label="Legal Name" value={formData.full_name} onChange={(val) => setFormData({...formData, full_name: val})} placeholder="Enter name" />
            <ProfileInput label="Mobile" value={formData.phone} onChange={(val) => setFormData({...formData, phone: val})} placeholder="+91" />
            <ProfileInput label="Passport" value={formData.passport} onChange={(val) => setFormData({...formData, passport: val})} placeholder="Optional" />
          </div>
        </motion.section>

        {/* COMFORT PREFS */}
        <motion.section variants={staggerContainer} initial="initial" whileInView="animate">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <Heart size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest">Travel Styles</h3>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Armchair size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seating</p>
                  <p className="text-sm font-black italic tracking-tighter">{prefs.seat}</p>
                </div>
              </div>
              <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                {['Window', 'Aisle'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setPrefs({...prefs, seat: s as any})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${prefs.seat === s ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ACCOUNT MANAGEMENT */}
        {/* QUICK ACTIONS DASHBOARD */}
        <motion.section variants={staggerContainer} initial="initial" whileInView="animate">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
              <Settings size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest">Dashboard</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ActionButton icon={<History className="text-blue-500" />} label="History" />
            <ActionButton icon={<Wallet className="text-purple-500" />} label="TripuraPay" />
            <ActionButton icon={<Globe className="text-emerald-500" />} label="Support" onClick={() => navigate('/support')} />
            <ActionButton icon={<Lock className="text-rose-500" />} label="Security" onClick={() => navigate('/privacy')} />
          </div>
        </motion.section>


        {/* LOGOUT */}
        <div className="pt-6">
          <button 
            onClick={handleSignOut}
            className="w-full bg-white border-2 border-slate-100 text-rose-500 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm"
          >
            <LogOut size={16} /> Termination Session
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center py-8">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">TripuraFly Secure Environment • 2026</p>
        </div>

      </div>
    </div>
  );
}

// --- Internal Helper Components ---

function ProfileInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <motion.div variants={fadeInUp} className="relative group">
      <label className="text-[8px] font-black text-slate-400 uppercase absolute top-4 left-6">{label}</label>
      <input 
        className="w-full pt-8 pb-4 px-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </motion.div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <motion.button 
      variants={fadeInUp}
      onClick={onClick}
      className="bg-white p-6 rounded-[2.2rem] border border-slate-100 flex flex-col items-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-95"
    >
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
    </motion.button>
  );
}