import { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, ArrowUpDown, PlaneTakeoff, PlaneLanding, Info, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FlightSearch({ onSearch }: { onSearch: (params: any) => void }) {
  const today = new Date().toISOString().split('T')[0];

  const [origin, setOrigin] = useState('IXA'); 
  const [destination, setDestination] = useState('CCU');
  const [date, setDate] = useState(today);
  const [cheapestFare, setCheapestFare] = useState<string | null>(null);

  // Fetch the lowest price whenever route changes
  useEffect(() => {
    async function fetchMinPrice() {
      if (origin.length === 3 && destination.length === 3) {
        const { data } = await supabase
          .from('flights')
          .select('price')
          .eq('origin', origin.toUpperCase())
          .eq('destination', destination.toUpperCase())
          .order('price', { ascending: true })
          .limit(1);
        
        if (data?.[0]) {
          setCheapestFare(Math.round(data[0].price).toLocaleString('en-IN'));
        } else {
          setCheapestFare(null);
        }
      }
    }
    fetchMinPrice();
  }, [origin, destination]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We send a NEW object to ensure the child 'FlightList' re-renders
    onSearch({ 
      origin: origin.trim().toUpperCase(), 
      destination: destination.trim().toUpperCase(), 
      date: date,
      timestamp: Date.now() // Forces the useEffect in FlightList to fire
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      
      {/* QUICK DATE TESTER (Helpful for your current testing) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['2026-01-15', '2026-01-16'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDate(d)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
              date === d ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            {new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ROUTE CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 relative">
          
          {/* FROM */}
          <div className="flex items-center p-5 gap-4 border-b border-slate-50">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <PlaneTakeoff size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departure City</p>
              <input 
                className="w-full bg-transparent outline-none font-black text-3xl text-slate-900 tracking-tighter"
                value={origin}
                onChange={e => setOrigin(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
          </div>

          {/* SWAP BUTTON */}
          <button 
            type="button"
            onClick={() => {setOrigin(destination); setDestination(origin)}}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white active:rotate-180 transition-all duration-500"
          >
            <ArrowUpDown size={20} />
          </button>

          {/* TO */}
          <div className="flex items-center p-5 gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
              <PlaneLanding size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrival City</p>
              <input 
                className="w-full bg-transparent outline-none font-black text-3xl text-slate-900 tracking-tighter"
                value={destination}
                onChange={e => setDestination(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
          </div>
        </div>

        {/* DATE & PRICE INFO */}
        <div className="bg-white rounded-[2.2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <CalendarIcon size={20} />
             </div>
             <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travel Date</p>
                <input 
                  type="date"
                  className="w-full bg-transparent outline-none font-black text-xl text-slate-900"
                  value={date}
                  min={today}
                  onChange={e => setDate(e.target.value)}
                  required
                />
             </div>
          </div>
          
          {cheapestFare && (
            <div className="bg-emerald-50 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-emerald-600 fill-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase">Best Price Found</span>
              </div>
              <p className="font-black text-emerald-700 text-sm">₹{cheapestFare}</p>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Search size={20} strokeWidth={3} />
          Find Flights
        </button>
      </form>
    </div>
  );
}