import { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, ArrowUpDown, PlaneTakeoff, PlaneLanding, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FlightSearch({ onSearch }: { onSearch: (f: any) => void }) {
  // Get today's date in YYYY-MM-DD format for the 'min' attribute
  const today = new Date().toISOString().split('T')[0];

  const [origin, setOrigin] = useState('IXA'); 
  const [destination, setDestination] = useState('CCU');
  const [date, setDate] = useState(today); // Default to today
  const [cheapestFare, setCheapestFare] = useState<string | null>(null);

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

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      {/* Trip Type Selector */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mx-auto">
        <button type="button" className="px-6 py-2 bg-white rounded-xl text-[10px] font-black uppercase shadow-sm">One Way</button>
        <button type="button" className="px-6 py-2 text-slate-400 text-[10px] font-black uppercase">Round Trip</button>
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); onSearch({ origin, destination, date }); }}
        className="space-y-3"
      >
        {/* ROUTE CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-2 relative">
          
          {/* Origin Input */}
          <div className="flex items-center p-4 gap-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
              <PlaneTakeoff size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</p>
              <input 
                className="w-full bg-transparent outline-none font-black text-2xl text-slate-900"
                value={origin}
                onChange={e => setOrigin(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="Origin"
              />
            </div>
          </div>

          {/* Floating Swap Button */}
          <button 
            type="button"
            onClick={() => {setOrigin(destination); setDestination(origin)}}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white active:scale-90 transition-transform"
          >
            <ArrowUpDown size={20} />
          </button>

          {/* Destination Input */}
          <div className="flex items-center p-4 gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 shrink-0">
              <PlaneLanding size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</p>
              <input 
                className="w-full bg-transparent outline-none font-black text-2xl text-slate-900"
                value={destination}
                onChange={e => setDestination(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="Destination"
              />
            </div>
          </div>
        </div>

        {/* DATE CARD */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Travel Date</p>
              {cheapestFare && (
                <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">FROM ₹{cheapestFare}</span>
              )}
            </div>
            <input 
              type="date"
              className="w-full bg-transparent outline-none font-black text-lg text-slate-900 appearance-none"
              value={date}
              min={today} // Prevents selection of past dates
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* INFO BADGE */}
        <div className="flex items-center gap-2 px-6 py-2">
          <Info size={12} className="text-slate-400" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
            Direct flights from {origin} to {destination} available
          </p>
        </div>

        {/* SEARCH BUTTON */}
        <button 
          type="submit"
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Search size={18} />
          Search Flights
        </button>
      </form>
    </div>
  );
}