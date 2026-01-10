import { useState, useEffect } from 'react';
import { Plane, User, Clock, ShieldCheck, Filter, AlertCircle, Lock } from 'lucide-react';
import { supabase, type Flight } from '../lib/supabase';

const getAirlineMeta = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('indigo')) return { code: '6E', color: '#001b94' };
  if (n.includes('express')) return { code: 'IX', color: '#d42e12' };
  if (n.includes('india')) return { code: 'AI', color: '#ed1c24' };
  if (n.includes('vistara')) return { code: 'UK', color: '#5f2653' };
  if (n.includes('akasa')) return { code: 'QP', color: '#ff6d22' };
  return { code: 'G8', color: '#000000' };
};

const formatTimeDirectly = (dbString: string) => {
  if (!dbString) return "--:--";
  const timePart = dbString.includes('T') ? dbString.split('T')[1] : dbString.split(' ')[1];
  return timePart.substring(0, 5);
};

export default function FlightList({ searchParams, onSelectFlight }: { searchParams: any, onSelectFlight: (f: Flight) => void }) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFlights() {
      if (!searchParams.origin || !searchParams.destination || !searchParams.date) return;
      
      setLoading(true);
      setError(null);

      try {
        const dateStr = searchParams.date; 
        const dayStart = `${dateStr} 00:00:00`;
        const dayEnd = `${dateStr} 23:59:59`;

        const { data, error: dbError } = await supabase
          .from('flights')
          .select('*')
          .eq('origin', searchParams.origin.toUpperCase())
          .eq('destination', searchParams.destination.toUpperCase())
          .gte('departure_time', dayStart)
          .lte('departure_time', dayEnd)
          .order('departure_time', { ascending: true });

        if (dbError) throw dbError;
        setFlights((data as Flight[]) || []);
      } catch (err: any) {
        setError("Unable to find flights.");
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, [searchParams.origin, searchParams.destination, searchParams.date, searchParams.timestamp]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Searching Database...</p>
    </div>
  );

  if (flights.length === 0 && !loading) return (
    <div className="mx-6 mt-10 p-10 bg-slate-50 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
      <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
      <p className="text-slate-500 font-black text-sm uppercase tracking-tighter">No Flights for {searchParams.date}</p>
    </div>
  );

  return (
    <div className="px-4 pb-24 space-y-5 max-w-2xl mx-auto mt-4">
      {flights.map((f) => {
        const meta = getAirlineMeta(f.airline);
        const isSoldOut = f.available_seats <= 0;

        return (
          <div 
            key={f.id} 
            onClick={() => !isSoldOut && onSelectFlight(f)}
            className={`relative bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 transition-all 
              ${isSoldOut 
                ? 'grayscale opacity-60 cursor-not-allowed overflow-hidden' 
                : 'active:scale-[0.97] cursor-pointer hover:shadow-md'}`}
          >
            {/* Blur Overlay for Sold Out Cards */}
            {isSoldOut && (
              <div className="absolute inset-0 backdrop-blur-[2px] z-10 flex items-center justify-center">
                 <div className="bg-slate-900/10 px-4 py-2 rounded-full border border-white/20">
                    <span className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em]">Full Capacity</span>
                 </div>
              </div>
            )}

            {/* Top Row */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl p-2">
                  <img src={`https://pics.avs.io/200/200/${meta.code}.png`} alt={f.airline} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm leading-none">{f.airline}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{f.flight_number}</p>
                </div>
              </div>
              <div className={`${isSoldOut ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'} px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                <ShieldCheck size={12} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase">
                  {isSoldOut ? 'Unavailable' : 'Confirmed Fare'}
                </span>
              </div>
            </div>

            {/* Middle Row */}
            <div className="flex items-center justify-between px-2 mb-8">
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 leading-none">{f.origin}</p>
                <p className={`text-sm font-black mt-2 ${isSoldOut ? 'text-slate-400' : 'text-indigo-600'}`}>
                  {formatTimeDirectly(f.departure_time)}
                </p>
              </div>

              <div className="flex-1 px-4 flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">{f.duration}</span>
                <div className="w-full h-[1px] bg-slate-100 relative flex items-center justify-center">
                  <Plane size={14} className={`${isSoldOut ? 'text-slate-300' : 'text-indigo-600'} rotate-90 bg-white px-0.5`} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest mt-2 ${isSoldOut ? 'text-slate-300' : 'text-indigo-400'}`}>Direct</span>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 leading-none">{f.destination}</p>
                <p className={`text-sm font-black mt-2 ${isSoldOut ? 'text-slate-400' : 'text-indigo-600'}`}>
                  {formatTimeDirectly(f.arrival_time)}
                </p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSoldOut ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-orange-500'}`}>
                  {isSoldOut ? <Lock size={14} /> : <User size={14} />}
                </div>
                <p className={`text-[9px] font-black uppercase leading-none ${isSoldOut ? 'text-red-500' : 'text-slate-400'}`}>
                  {isSoldOut ? 'Sold Out' : `${f.available_seats} Seats Left`}
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                   <span className="text-xs font-bold text-slate-900">₹</span>
                   <span className="text-3xl font-black text-slate-900 tracking-tighter">
                    {f.price.toLocaleString()}
                   </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}