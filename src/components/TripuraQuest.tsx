import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, LogOut, ChevronRight, Plane, 
  Wallet, Settings, Bell, Save, Star, Armchair, Coffee, 
  History, CreditCard, Lock, Globe, Heart, Smartphone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Types for better data handling
type ProfileStats = {
  totalBookings: number;
  totalSpent: number;
  tier: 'Explorer' | 'Silver' | 'Gold' | 'Platinum';
  nextTierProgress: number;
};

const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) console.error("Sign out error:", error.message);
  
  // Optional: Manually redirect to ensure the UI resets
  window.location.href = '/'; 
};

type TravelPrefs = {
  seat: 'Window' | 'Aisle' | 'Extra Legroom';
  meal: 'Veg' | 'Non-Veg' | 'Vegan';
  notifications: boolean;
};

export default function MyProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate(); // Navigation hook initialized
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({ 
    totalBookings: 0, totalSpent: 0, tier: 'Explorer', nextTierProgress: 0 
  });
  
  // Profile Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    passport: ''
  });

  // Preferences State
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
    const { data, error } = await supabase
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

      if (count >= 10) {
        userTier = 'Platinum';
        progress = 100;
      } else if (count >= 5) {
        userTier = 'Gold';
        progress = ((count - 5) / 5) * 100;
      } else if (count >= 2) {
        userTier = 'Silver';
        progress = ((count - 2) / 3) * 100;
      }

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
        updated_at: new Date()
      });

    if (!error) {
       console.log("Saved");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Syncing Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* 1. HEADER SECTION */}
      <div className="bg-slate-900 pt-16 pb-24 px-8 rounded-b-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full -ml-10 -mb-10 blur-[60px]" />
        
        <div className="relative flex flex-col items-center">
          <div className="relative mb-6 group">
            <div className="w-28 h-28 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 rounded-[3rem] p-1 shadow-2xl transition-transform group-hover:scale-105 duration-500">
              <div className="w-full h-full bg-slate-900 rounded-[2.8rem] flex items-center justify-center overflow-hidden border-4 border-slate-900">
                <span className="text-4xl font-black text-white italic">
                  {user?.email?.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white border-[6px] border-slate-900 p-2 rounded-2xl shadow-xl">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tighter">
            {formData.full_name || 'Premium Member'}
          </h2>
          <div className="flex items-center gap-2 mt-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-md border border-white/10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
              {stats.tier} Status
            </p>
          </div>
        </div>
      </div>

      {/* 2. STATS & LOYALTY CARD */}
      <div className="px-6 -mt-16">
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-indigo-100/50 border border-slate-50 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expenditure</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter">₹{stats.totalSpent.toLocaleString()}</h4>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Trips</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{stats.totalBookings}</h4>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Next Tier Progress</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {stats.tier === 'Platinum' ? 'Max Tier' : `${Math.round(stats.nextTierProgress)}%`}
              </p>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${stats.nextTierProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-10 space-y-8">
        
        {/* 3. PERSONAL INFORMATION */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <User size={18} className="text-slate-900" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identity</h3>
            </div>
            <button 
              onClick={handleUpdateProfile}
              className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-indigo-200 active:scale-90 transition-all"
            >
              {saving ? '...' : 'Save'}
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative group">
                <label className="text-[9px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Legal Name</label>
                <input 
                  className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="relative group">
                <label className="text-[9px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Mobile Number</label>
                <input 
                  className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 00000 00000"
                />
              </div>
              <div className="relative group">
                <label className="text-[9px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Passport No.</label>
                <input 
                  className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                  value={formData.passport}
                  onChange={(e) => setFormData({...formData, passport: e.target.value})}
                  placeholder="ID12345678"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. TRAVEL PREFERENCES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Heart size={18} className="text-rose-500" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Preferences</h3>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Armchair size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-none mb-1">Favorite Seat</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{prefs.seat}</p>
                </div>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['Window', 'Aisle'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setPrefs({...prefs, seat: s as any})}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${prefs.seat === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Coffee size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-none mb-1">Meal Choice</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{prefs.meal}</p>
                </div>
              </div>
              <select 
                value={prefs.meal}
                onChange={(e) => setPrefs({...prefs, meal: e.target.value as any})}
                className="bg-slate-50 border-none outline-none text-[10px] font-black uppercase text-indigo-600 px-3 py-2 rounded-xl"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
          </div>
        </section>

        {/* 5. QUICK MENU & SECURITY */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Smartphone size={18} className="text-slate-900" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dashboard</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MenuButton icon={<History className="text-blue-500" />} label="History" />
            <MenuButton icon={<CreditCard className="text-purple-500" />} label="Cards" />
            <MenuButton 
              icon={<Globe className="text-emerald-500" />} 
              label="Support" 
              onClick={() => navigate('/support')}
            />
            <MenuButton 
             icon= {<Lock className="text-rose-500" />}
              label="Privacy" 
              onClick={() => navigate('/privacy')}
            />
           
          </div>
        </section>

        {/* 6. SIGN OUT */}
        <button 
          onClick={() => handleSignOut()}
          className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-slate-200"
        >
          <LogOut size={18} /> Secure Logout
        </button>

        <p className="text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
          TripuraFly v2.4.0 • Encrypted Connection
        </p>
      </div>
    </div>
  );
}

// Reusable Menu Button Component - UPDATED to handle onClick
function MenuButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-sm hover:border-indigo-100 hover:shadow-md w-full"
    >
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
    </button>
  );
}