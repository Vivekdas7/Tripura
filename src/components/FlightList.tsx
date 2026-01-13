import { useState, useEffect } from 'react';
import { Plane, User, Clock, ShieldCheck, Filter, AlertCircle, Lock, MapPin, Ticket } from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  via?: string | null;
  stops: number;
  departure_time: string;
  arrival_time: string;
  price: number;
  duration: string;
  available_seats: number;
  total_seats: number;
}

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
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Scanning Skies...</p>
    </div>
  );

  if (flights.length === 0 && !loading) return (
    <div className="mx-6 mt-10 p-10 bg-slate-50 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
      <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
      <p className="text-slate-500 font-black text-sm uppercase tracking-tighter">No Flights for {searchParams.date}</p>
    </div>
  );

  return (
    <div className="px-4 pb-24 space-y-6 max-w-2xl mx-auto mt-6">
      {flights.map((f) => {
        const meta = getAirlineMeta(f.airline);
        const isSoldOut = f.available_seats <= 0;
        const hasStops = f.stops > 0;

        return (
          <div 
            key={f.id} 
            onClick={() => !isSoldOut && onSelectFlight(f)}
            className={`group relative bg-white transition-all duration-300 active:scale-95
              ${isSoldOut ? 'grayscale cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* TICKET TOP SECTION */}
            <div className="relative bg-white border-x border-t border-slate-100 rounded-t-[2.5rem] p-6 pb-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                    <img src={`https://pics.avs.io/200/200/${meta.code}.png`} alt={f.airline} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-tighter">{f.airline}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.flight_number}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
                  <div className={`px-2 py-1 rounded-md flex items-center gap-1 ${isSoldOut ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <ShieldCheck size={10} strokeWidth={3} />
                    <span className="text-[8px] font-black uppercase">Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Main Flight Info */}
              <div className="flex items-center justify-between px-2 mb-4">
                <div className="w-20">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{f.origin}</p>
                  <p className="text-xs font-black text-indigo-600 mt-1">{formatTimeDirectly(f.departure_time)}</p>
                </div>

                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Clock size={10} /> {f.duration}
                  </div>
                  <div className="w-full h-[1.5px] bg-slate-100 relative flex items-center justify-center">
                    <div className={`absolute w-2 h-2 rounded-full border-2 border-white z-10 ${hasStops ? 'bg-orange-500' : 'bg-slate-300'}`} />
                    <Plane size={14} className="text-indigo-600 rotate-90 bg-white px-0.5 z-20" />
                  </div>
                  <div className={`text-[8px] font-black uppercase tracking-[0.2em] mt-2 ${hasStops ? 'text-orange-500' : 'text-slate-300'}`}>
                    {hasStops ? `1-Stop via ${f.via}` : 'Non-Stop Flight'}
                  </div>
                </div>

                <div className="w-20 text-right">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{f.destination}</p>
                  <p className="text-xs font-black text-indigo-600 mt-1">{formatTimeDirectly(f.arrival_time)}</p>
                </div>
              </div>
            </div>

            {/* TICKET CUT DIVIDER (LEFT & RIGHT HOLES) */}
            <div className="relative h-6 flex items-center overflow-hidden bg-transparent">
               {/* Left Cut */}
               <div className="absolute -left-3 w-6 h-6 bg-[#f8fafc] rounded-full border border-slate-100 z-20 shadow-inner" />
               {/* Dash Line */}
               <div className="w-full border-t-2 border-dashed border-slate-100 mx-4 z-10" />
               {/* Right Cut */}
               <div className="absolute -right-3 w-6 h-6 bg-[#f8fafc] rounded-full border border-slate-100 z-20 shadow-inner" />
            </div>

            {/* TICKET BOTTOM SECTION */}
            <div className="relative bg-white border-x border-b border-slate-100 rounded-b-[2.5rem] p-6 pt-2 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSoldOut ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-orange-600'}`}>
                    {isSoldOut ? <Lock size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-tight ${isSoldOut ? 'text-red-500' : 'text-slate-900'}`}>
                      {isSoldOut ? 'Sold Out' : `${f.available_seats} Seats Left`}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Inventory Level</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-xs font-black text-slate-900 uppercase">₹</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {f.price.toLocaleString()}
                    </span>
                  </div>
                  <button className={`mt-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all
                    ${isSoldOut ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white group-hover:bg-indigo-600'}`}>
                    {isSoldOut ? 'Unavailable' : 'Select Flight'}
                  </button>
                </div>
              </div>
              
              {/* Bottom Decorative Edge */}
              <div className="mt-4 flex justify-center gap-1 opacity-20">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-slate-300 rounded-full" />
                ))}
              </div>
            </div>

            {/* Sold Out Blur Overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 z-30 bg-white/40 backdrop-blur-[1px] rounded-[2.5rem] flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 px-6 py-2 rounded-2xl shadow-xl border border-slate-100">
                  <p className="text-slate-900 font-black text-[12px] uppercase tracking-[0.3em]">Full</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}