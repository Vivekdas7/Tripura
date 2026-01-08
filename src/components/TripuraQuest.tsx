import { useEffect, useState } from 'react';
import { 
  User, Mail, Phone, ShieldCheck, LogOut, ChevronRight, Plane, 
  Wallet, Settings, Bell, Save, Star, Armchair, Coffee, 
  History, CreditCard, Lock, Globe, Heart, Smartphone, X, Check, HelpCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

export default function MyProfile() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  
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
      fetchHistory();
    }
  }, [user]);

  const fetchProfileData = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    if (data) {
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        passport: data.passport || ''
      });
      if (data.preferences) setPrefs(data.preferences);
    }
  };

  const fetchHistory = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
    if (data) setBookings(data);
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase.from('bookings').select('total_price').eq('user_id', user!.id).eq('status', 'confirmed');
      if (error) throw error;
      const spent = data.reduce((sum, item) => sum + Number(item.total_price), 0);
      const count = data.length;
      
      let userTier: ProfileStats['tier'] = 'Explorer';
      let progress = (count / 5) * 100;
      if (count >= 10) { userTier = 'Platinum'; progress = 100; }
      else if (count >= 5) { userTier = 'Gold'; progress = ((count - 5) / 5) * 100; }
      else if (count >= 2) { userTier = 'Silver'; progress = ((count - 2) / 3) * 100; }

      setStats({ totalBookings: count, totalSpent: spent, tier: userTier, nextTierProgress: progress });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: user!.id,
      full_name: formData.full_name,
      phone: formData.phone,
      passport: formData.passport,
      preferences: prefs,
      updated_at: new Date()
    });
    setSaving(false);
  };

  // --- Functional Sheets Rendering ---
  const renderSheet = () => {
    if (!activeSheet) return null;
    return (
      <div className="fixed inset-0 z-[2000] bg-white animate-in slide-in-from-bottom duration-300">
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{activeSheet}</h2>
            <button onClick={() => setActiveSheet(null)} className="p-3 bg-slate-100 rounded-full"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {activeSheet === 'History' && (
              <div className="space-y-4">
                {bookings.map((b: any) => (
                  <div key={b.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-black text-slate-900">{b.origin} → {b.destination}</p>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="font-black text-indigo-600">₹{b.total_price}</p>
                  </div>
                ))}
              </div>
            )}

            {activeSheet === 'Cards' && (
              <div className="space-y-6">
                <div className="h-48 w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-8"><Globe size={24} className="opacity-20"/></div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-8 text-white">Travel Rewards Card</p>
                   <p className="text-xl font-bold tracking-[0.2em] mb-4 text-white">**** **** **** 4242</p>
                   <p className="text-xs font-black uppercase text-white">{formData.full_name || 'MEMBER NAME'}</p>
                </div>
                <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-[10px] uppercase tracking-widest">+ Add New Card</button>
              </div>
            )}

            {activeSheet === 'Support' && (
              <div className="space-y-4">
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white">
                  <h4 className="font-black mb-2">How can we help?</h4>
                  <p className="text-xs text-indigo-100">Our flight experts are online 24/7 to assist with your journey.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {['Live Chat', 'Email Support', 'Call Helpline', 'FAQs'].map(item => (
                    <div key={item} className="p-5 border border-slate-100 rounded-2xl flex justify-between items-center font-bold text-sm">
                      {item} <ChevronRight size={16} className="text-slate-300"/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSheet === 'Privacy' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-slate-900">Biometric Login</p>
                    <p className="text-[10px] text-slate-400">Enable FaceID or Fingerprint</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"/></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-slate-900">Marketing Cookies</p>
                    <p className="text-[10px] text-slate-400">Personalized flight offers</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full"/></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 relative">
      {renderSheet()}

      <div className="bg-slate-900 pt-16 pb-24 px-8 rounded-b-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-[80px]" />
        <div className="relative flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 rounded-[3rem] p-1 shadow-2xl">
              <div className="w-full h-full bg-slate-900 rounded-[2.8rem] flex items-center justify-center border-4 border-slate-900 overflow-hidden">
                <span className="text-4xl font-black text-white italic">{user?.email?.substring(0, 2).toUpperCase()}</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white border-[6px] border-slate-900 p-2 rounded-2xl shadow-xl">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">{formData.full_name || 'Premium Member'}</h2>
          <div className="flex items-center gap-2 mt-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-md border border-white/10">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{stats.tier} Status</p>
          </div>
        </div>
      </div>

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
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${stats.nextTierProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-10 space-y-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <User size={18} className="text-slate-900" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identity</h3>
            </div>
            <button onClick={handleUpdateProfile} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-indigo-200">
              {saving ? '...' : 'Save'}
            </button>
          </div>
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative group">
                <label className="text-[9px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Legal Name</label>
                <input className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-900" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="relative group">
                <label className="text-[9px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Mobile Number</label>
                <input className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="relative group">
                <label className="text-[9px] font-black text-slate-400 uppercase absolute -top-2 left-4 bg-white px-2">Passport No.</label>
                <input className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-900" value={formData.passport} onChange={(e) => setFormData({...formData, passport: e.target.value})} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Heart size={18} className="text-rose-500" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Preferences</h3>
          </div>
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Armchair size={20} /></div>
                <div><p className="text-xs font-black text-slate-900 leading-none mb-1">Favorite Seat</p></div>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['Window', 'Aisle'].map(s => (
                  <button key={s} onClick={() => setPrefs({...prefs, seat: s as any})} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${prefs.seat === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Smartphone size={18} className="text-slate-900" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dashboard</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveSheet('History')} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-500"><History size={24}/></div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">History</span>
            </button>
            <button onClick={() => setActiveSheet('Cards')} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-purple-500"><CreditCard size={24}/></div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Cards</span>
            </button>
            <button onClick={() => setActiveSheet('Support')} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500"><Globe size={24}/></div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Support</span>
            </button>
            <button onClick={() => setActiveSheet('Privacy')} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-rose-500"><Lock size={24}/></div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Privacy</span>
            </button>
          </div>
        </section>

        <button onClick={() => signOut()} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl">
          <LogOut size={18} /> Secure Logout
        </button>
      </div>
    </div>
  );
}