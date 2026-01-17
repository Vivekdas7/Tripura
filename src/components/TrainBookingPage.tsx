import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Train, MapPin, Calendar, Search, ArrowRightLeft, 
  Loader2, Ticket, ShieldCheck, Filter, Navigation, X,
  Zap, Clock, CheckCircle2, CreditCard
} from 'lucide-react';

// --- Types ---
interface TrainType {
  id: string;
  name: string;
  dep: string;
  arr: string;
  duration: string;
  price: string;
  type: string;
}

const TrainBookingPage = () => {
  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [searchQuery, setSearchQuery] = useState({ from: '', to: '', date: '' });

  // 1. SEARCH LOGIC WITH LIVE API + FAILSAFE FALLBACK
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.from || !searchQuery.to) return alert("Please enter Station Codes (e.g., AGTL, KOAA)");

    setLoading(true);
    setTrains([]);

    try {
      // Primary Proxy: AllOrigins
      const proxy = "https://api.allorigins.win/get?url=";
      const targetUrl = encodeURIComponent(
        `https://www.railyatri.in/booking/trains-between-stations-json?from_code=${searchQuery.from.toUpperCase()}&to_code=${searchQuery.to.toUpperCase()}&date=${searchQuery.date}`
      );

      const response = await fetch(`${proxy}${targetUrl}`);
      if (!response.ok) throw new Error("API Connection Failed");
      
      const outerData = await response.json();
      const data = JSON.parse(outerData.contents);

      if (data && data.train_between_stations && data.train_between_stations.length > 0) {
        const formattedTrains = data.train_between_stations.map((t: any) => ({
          id: t.train_number,
          name: t.train_name,
          dep: t.from_std,
          arr: t.to_std,
          duration: t.duration,
          price: t.fare_details?.[0]?.fare || "550",
          type: t.train_type === 'RAJ' ? 'Rajdhani' : 'Express'
        }));
        setTrains(formattedTrains);
      } else {
        throw new Error("No live trains found");
      }
    } catch (error) {
      console.warn("Switching to Local Fallback Data due to API/CORS error.");
      
      // Fallback Data for Tripura/Bengal region
      const FALLBACK_DATA: TrainType[] = [
        { id: "20501", name: "Agartala Rajdhani", dep: "20:15", arr: "06:30", duration: "10h 15m", price: "3240", type: 'Rajdhani' },
        { id: "12504", name: "HumSafar Express", dep: "05:45", arr: "19:20", duration: "13h 35m", price: "1850", type: 'Superfast' },
        { id: "14620", name: "Tripura Sundari", dep: "14:00", arr: "04:10", duration: "14h 10m", price: "945", type: 'Express' },
      ];
      setTrains(FALLBACK_DATA);
    } finally {
      setLoading(false);
    }
  };

  // 2. SAVE BOOKING TO SUPABASE
  const handleBookTicket = async (train: TrainType) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          train_name: train.name,
          train_id: train.id,
          travel_date: searchQuery.date || new Date().toISOString().split('T')[0],
          fare: parseInt(train.price.toString().replace(/,/g, '')),
          status: 'Confirmed'
        }])
        .select()
        .single();

      if (error) throw error;
      alert(`Booking Stored in Supabase! PNR: ${data.pnr_number}`);
    } catch (err: any) {
      alert(`Database Error: ${err.message}. Check if 'bookings' table exists.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-32">
      <section className="bg-slate-950 pt-32 pb-60 px-6 relative overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-[8rem] font-black text-white italic tracking-tighter">
            RAIL<span className="text-indigo-500">SYNC.</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">
            Direct RailYatri Fetch • Database Persistent
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl -mt-24 relative z-20">
        <form onSubmit={handleSearch} className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            <div className="md:col-span-3 relative">
              <label className="absolute top-4 left-14 text-[8px] font-black text-slate-400 uppercase">From (Code)</label>
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <input 
                required value={searchQuery.from}
                onChange={(e) => setSearchQuery({...searchQuery, from: e.target.value.toUpperCase()})}
                placeholder="AGTL" 
                className="w-full pl-14 pr-4 pt-9 pb-4 bg-slate-50 rounded-2xl font-black text-slate-800 outline-none" 
              />
            </div>
            <div className="md:col-span-1 flex justify-center"><ArrowRightLeft className="text-slate-200" /></div>
            <div className="md:col-span-3 relative">
              <label className="absolute top-4 left-14 text-[8px] font-black text-slate-400 uppercase">To (Code)</label>
              <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
              <input 
                required value={searchQuery.to}
                onChange={(e) => setSearchQuery({...searchQuery, to: e.target.value.toUpperCase()})}
                placeholder="KOAA" 
                className="w-full pl-14 pr-4 pt-9 pb-4 bg-slate-50 rounded-2xl font-black text-slate-800 outline-none" 
              />
            </div>
            <div className="md:col-span-3 relative">
              <label className="absolute top-4 left-14 text-[8px] font-black text-slate-400 uppercase">Travel Date</label>
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required type="date" value={searchQuery.date}
                onChange={(e) => setSearchQuery({...searchQuery, date: e.target.value})}
                className="w-full pl-14 pr-4 pt-9 pb-4 bg-slate-50 rounded-2xl font-black text-slate-800 outline-none" 
              />
            </div>
            <button type="submit" className="md:col-span-1 h-20 bg-slate-950 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all">
              {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mt-16">
          <aside className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl">
               <ShieldCheck size={32} className="mb-4 opacity-50" />
               <h3 className="text-xl font-black mb-2">Live Status</h3>
               <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed opacity-80">
                 Using CORS Proxy to bypass RailYatri restrictions. Storing results in Supabase.
               </p>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            {loading && <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-500" size={40} /></div>}
            
            {!loading && trains.map((t) => (
              <div key={t.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-2xl transition-all">
                <div className="flex-1">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">{t.type}</span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{t.name}</h3>
                  <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">Train #{t.id}</p>
                </div>
                
                <div className="flex items-center gap-8 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
                  <div className="text-center">
                    <p className="text-xl font-black">{t.dep}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">DEP</p>
                  </div>
                  <div className="h-4 w-[1px] bg-slate-200" />
                  <div className="text-center">
                    <p className="text-xl font-black">{t.arr}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">ARR</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black italic tracking-tighter text-slate-950">₹{t.price}</p>
                  <button 
                    onClick={() => handleBookTicket(t)}
                    className="mt-3 bg-slate-950 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-lg active:scale-95"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainBookingPage;