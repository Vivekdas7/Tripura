import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, ShieldCheck, LogOut, ChevronRight, Plane, 
  Wallet, Settings, Bell, Save, Star, Armchair, Coffee, 
  History, CreditCard, Lock, Globe, Heart, Smartphone,
  Camera, MapPin, Award, CheckCircle2, ChevronLeft
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

    if (!error) {
      // Success Haptic/Feedback could go here
    }
    setTimeout(() => setSaving(false), 800);
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

   const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };


  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-12">
      {/* --- MOBILE NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs font-black uppercase tracking-widest">My Passport</span>
        <div className="w-8" /> {/* Spacer */}
      </nav>

      {/* --- HERO PROFILE SECTION --- */}
      <section className="pt-24 pb-12 px-6 flex flex-col items-center">
        <div className="relative mb-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-[3rem] bg-slate-50 p-1.5 shadow-2xl relative z-10"
          >
            <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-white border-2 border-white">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-2xl border-4 border-white shadow-lg active:scale-90 transition-transform">
              <Camera size={16} />
            </button>
          </motion.div>
          {/* Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-slate-100 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-slate-50 rounded-full" />
        </div>

        <motion.h1 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-3xl font-black tracking-tighter mb-1"
        >
          {formData.full_name || 'Tripura Traveler'}
        </motion.h1>
        <p className="text-slate-400 text-xs font-bold mb-6">{user?.email}</p>

        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Award size={12} /> {stats.tier} Member
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 size={12} /> Verified
          </span>
        </div>
      </section>

      {/* --- LOYALTY DASHBOARD --- */}
      <div className="px-6 mb-12">
        <motion.div 
          variants={fadeInUp} initial="initial" whileInView="animate"
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20"
        >
          {/* Abstract Pattern */}
          <div className="absolute top-0 right-0 opacity-10">
            <Plane size={200} className="-mr-20 -mt-10 rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Travel Credits</p>
                <h2 className="text-4xl font-black tracking-tighter">₹{stats.totalSpent.toLocaleString()}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Boardings</p>
                <h2 className="text-2xl font-black tracking-tighter">{stats.totalBookings}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Tier Progression</p>
                <p className="text-[10px] font-black uppercase text-blue-400">{Math.round(stats.nextTierProgress)}% to next</p>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.nextTierProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="px-6 space-y-12">
        
        {/* IDENTITY SECTION */}
        <motion.section variants={staggerContainer} initial="initial" whileInView="animate">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <User size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">Legal Details</h3>
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95 transition-all"
            >
              {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <Save size={14} />}
              {saving ? 'Saving' : 'Save'}
            </button>
          </div>

          <div className="space-y-4">
            <ProfileInput 
              label="Full Name" 
              value={formData.full_name} 
              onChange={(val) => setFormData({...formData, full_name: val})} 
              placeholder="As per Passport"
            />
            <ProfileInput 
              label="Phone Number" 
              value={formData.phone} 
              onChange={(val) => setFormData({...formData, phone: val})} 
              placeholder="+91"
            />
            <ProfileInput 
              label="Passport Number" 
              value={formData.passport} 
              onChange={(val) => setFormData({...formData, passport: val})} 
              placeholder="For International Travel"
            />
          </div>
        </motion.section>

        {/* PREFERENCES SECTION */}
        <motion.section variants={staggerContainer} initial="initial" whileInView="animate">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <Heart size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest">In-Flight Comfort</h3>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Armchair size={20} className="text-slate-900" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seating</p>
                  <p className="text-sm font-black tracking-tight">{prefs.seat}</p>
                </div>
              </div>
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                {['Window', 'Aisle'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setPrefs({...prefs, seat: s as any})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${prefs.seat === s ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Coffee size={20} className="text-slate-900" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catering</p>
                  <p className="text-sm font-black tracking-tight">{prefs.meal}</p>
                </div>
              </div>
              <select 
                value={prefs.meal}
                onChange={(e) => setPrefs({...prefs, meal: e.target.value as any})}
                className="bg-white border border-slate-100 outline-none text-[10px] font-black uppercase text-blue-600 px-4 py-2.5 rounded-2xl shadow-sm"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
          </div>
        </motion.section>

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

        {/* LOGOUT BUTTON */}
        <div className="pt-6">
          <button 
            onClick={handleSignOut}
            className="group w-full bg-white border-2 border-slate-900 text-slate-900 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-slate-100"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
            Sign Out Securely
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TripuraFly Secure Core • v2.4.0</p>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">Designed in Tripura • 2026</p>
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function ProfileInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <motion.div variants={fadeInUp} className="relative">
      <label className="text-[8px] font-black text-slate-400 uppercase absolute top-4 left-6 z-10">{label}</label>
      <input 
        className="w-full pt-8 pb-4 px-6 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300"
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4 transition-all shadow-sm hover:shadow-xl hover:shadow-slate-100 w-full group"
    >
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
    </motion.button>
  );
}