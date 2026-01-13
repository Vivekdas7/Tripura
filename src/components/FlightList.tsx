import { useState, useEffect } from 'react';
import { Plane, User, Clock, ShieldCheck, AlertCircle, Lock, ChevronRight } from 'lucide-react';
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
  try {
    const timePart = dbString.includes('T') ? dbString.split('T')[1] : dbString.split(' ')[1];
    return timePart.substring(0, 5);
  } catch (e) {
    return "--:--";
  }
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
    <div className="flex flex-col items-center justify-center py-32 px-6">
      <div className="w-12 h-12 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
      <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Scanning Skies...</p>
    </div>
  );

  if (flights.length === 0 && !loading) return (
    <div className="mx-4 mt-10 p-12 bg-white rounded-[2rem] text-center border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="text-slate-300" size={32} />
      </div>
      <p className="text-slate-900 font-bold text-sm uppercase tracking-tight">No Flights Found</p>
      <p className="text-slate-400 text-xs mt-1 italic">Try adjusting your filters</p>
    </div>
  );

  return (
    <div className="px-4 pb-32 space-y-8 max-w-xl mx-auto mt-6">
      {flights.map((f) => {
        const meta = getAirlineMeta(f.airline);
        const isSoldOut = f.available_seats <= 0;
        const hasStops = f.stops > 0;

        return (
          <div 
            key={f.id} 
            onClick={() => !isSoldOut && onSelectFlight(f)}
            className={`group relative transition-all duration-300 transform active:scale-[0.97] tap-highlight-transparent
              ${isSoldOut ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* BOARDING PASS TOP (Main Info) */}
            <div className="relative bg-white rounded-t-[2.5rem] p-6 pb-4 border-t border-x border-slate-100 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
              {/* Airline Branding */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-50 rounded-xl p-1.5 border border-slate-100 flex items-center justify-center">
                    <img 
                      src={`https://pics.avs.io/200/200/${meta.code}.png`} 
                      alt={f.airline} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">{f.airline}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{f.flight_number}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100">
                    <ShieldCheck size={12} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase">Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Route & Times */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Origin</span>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{f.origin}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-2">{formatTimeDirectly(f.departure_time)}</p>
                </div>

                <div className="flex-[1.2] flex flex-col items-center px-2">
                   <div className="w-full flex items-center gap-2 mb-1">
                      <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
                      <Plane size={18} className="text-slate-300 rotate-90 shrink-0" />
                      <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
                   </div>
                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                      {f.duration}
                   </div>
                   <div className={`mt-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase ${hasStops ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      {hasStops ? `via ${f.via}` : 'Direct'}
                   </div>
                </div>

                <div className="flex-1 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dest</span>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{f.destination}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-2">{formatTimeDirectly(f.arrival_time)}</p>
                </div>
              </div>
            </div>

            {/* BOARDING PASS TEAR-OFF DIVIDER */}
            <div className="relative h-10 flex items-center bg-transparent overflow-visible">
               {/* The Concave Circles (Notches) */}
               <div className="absolute -left-[18px] w-9 h-9 bg-[#f8fafc] rounded-full border border-slate-100 z-10 shadow-[inset_-4px_0_8px_-4px_rgba(0,0,0,0.05)]" />
               <div className="absolute -right-[18px] w-9 h-9 bg-[#f8fafc] rounded-full border border-slate-100 z-10 shadow-[inset_4px_0_8px_-4px_rgba(0,0,0,0.05)]" />
               
               {/* The Dashed Line inside the divider bg */}
               <div className="w-full h-full bg-white border-x border-slate-100 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-slate-100 mx-6 opacity-60" />
               </div>
            </div>

            {/* BOARDING PASS BOTTOM (Stub Section) */}
            <div className="relative bg-white rounded-b-[2.5rem] p-6 pt-2 border-b border-x border-slate-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSoldOut ? 'bg-red-50 text-red-400' : 'bg-orange-50 text-orange-500'}`}>
                      {isSoldOut ? <Lock size={14} /> : <User size={14} />}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-tight ${isSoldOut ? 'text-red-500' : 'text-slate-900'}`}>
                        {isSoldOut ? 'Sold Out' : `${f.available_seats} Seats Available`}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className={`h-1 w-3 rounded-full ${i < (f.available_seats / f.total_seats * 5) ? 'bg-orange-400' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-0.5 mb-1">
                    <span className="text-[10px] font-black text-slate-400 mr-1 italic uppercase">Total</span>
                    <span className="text-xs font-black text-slate-900 uppercase">₹</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                      {f.price.toLocaleString()}
                    </span>
                  </div>
                  <button className={`w-full min-w-[120px] py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2
                    ${isSoldOut ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-slate-900 text-white active:bg-indigo-600'}`}>
                    {isSoldOut ? 'Locked' : (
                      <>Select Flight <ChevronRight size={14} strokeWidth={3} /></>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Bottom Barcode Decorative Element */}
              <div className="mt-6 flex justify-center gap-[3px] opacity-10 h-6 overflow-hidden">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className={`bg-black rounded-full`} style={{ width: `${Math.random() * 4 + 1}px`, height: '100%' }} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}