import { useState, useEffect } from 'react';
import { Plane, User, Clock, ShieldCheck, Filter, AlertCircle } from 'lucide-react';
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

// Helper function to extract HH:mm directly from the DB string
// Use this to bypass JavaScript Timezone manipulation
const formatTimeDirectly = (dbString: string) => {
  if (!dbString) return "--:--";
  // database format is usually "2026-01-15 10:30:00" or "2026-01-15T10:30:00"
  // We just want the part between the space/T and the last colon
  const timePart = dbString.includes('T') ? dbString.split('T')[1] : dbString.split(' ')[1];
  return timePart.substring(0, 5); // Returns "10:30"
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

        return (
          <div 
            key={f.id} 
            onClick={() => onSelectFlight(f)}
            className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 active:scale-[0.97] transition-all cursor-pointer"
          >
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
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={12} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase">Confirmed Fare</span>
              </div>
            </div>

            {/* Middle Row - Journey with EXACT Time Strings */}
            <div className="flex items-center justify-between px-2 mb-8">
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 leading-none">{f.origin}</p>
                {/* EXACT TIME FROM DB */}
                <p className="text-sm font-black text-indigo-600 mt-2">
                  {formatTimeDirectly(f.departure_time)}
                </p>
              </div>

              <div className="flex-1 px-4 flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">{f.duration}</span>
                <div className="w-full h-[1px] bg-slate-100 relative flex items-center justify-center">
                  <Plane size={14} className="text-indigo-600 rotate-90 bg-white px-0.5" />
                </div>
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-2">Direct</span>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 leading-none">{f.destination}</p>
                {/* EXACT TIME FROM DB */}
                <p className="text-sm font-black text-indigo-600 mt-2">
                  {formatTimeDirectly(f.arrival_time)}
                </p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                  <User size={14} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none">
                  {f.available_seats} Seats Left
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                   <span className="text-xs font-bold text-slate-900">₹</span>
                   <span className="text-3xl font-black text-slate-900 tracking-tighter">{f.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}