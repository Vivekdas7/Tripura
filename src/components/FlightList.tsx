import { useState, useEffect } from 'react';
import { Plane, User, Clock, ShieldCheck, Filter, AlertCircle } from 'lucide-react';
import { supabase, type Flight } from '../lib/supabase';

// Helper to get real logos based on airline name
const getAirlineMeta = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('indigo')) return { code: '6E', color: '#001b94' };
  if (n.includes('express')) return { code: 'IX', color: '#d42e12' };
  if (n.includes('india')) return { code: 'AI', color: '#ed1c24' };
  if (n.includes('vistara')) return { code: 'UK', color: '#5f2653' };
  if (n.includes('akasa')) return { code: 'QP', color: '#ff6d22' };
  return { code: 'G8', color: '#000000' };
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
        const start = `${searchParams.date}T00:00:00.000Z`;
        const end = `${searchParams.date}T23:59:59.999Z`;

        const { data, error: dbError } = await supabase
          .from('flights')
          .select('*')
          .eq('origin', searchParams.origin.toUpperCase())
          .eq('destination', searchParams.destination.toUpperCase())
          .gte('departure_time', start)
          .lte('departure_time', end)
          .order('price', { ascending: true });

        if (dbError) throw dbError;
        setFlights((data as Flight[]) || []);
      } catch (err: any) {
        setError("Unable to reach servers. Check connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, [searchParams]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Searching Best Fares...</p>
    </div>
  );

  if (error || (flights.length === 0 && !loading && searchParams.date)) return (
    <div className="mx-4 mt-10 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
      <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
      <p className="text-slate-500 font-bold text-sm">No flights found for this route on {searchParams.date}.</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 font-black text-xs uppercase">Try Again</button>
    </div>
  );

  return (
    <div className="px-3 pb-20 space-y-4 max-w-4xl mx-auto mt-6">
      {/* Search Header for Mobile */}
      <div className="flex items-center justify-between px-2 mb-6">
        <h3 className="text-xl font-black text-slate-900">Available Flights</h3>
        <button className="p-2 bg-slate-100 rounded-xl text-slate-600"><Filter size={18} /></button>
      </div>

      {flights.map((f) => {
        const meta = getAirlineMeta(f.airline);
        const depTime = new Date(f.departure_time);
        const arrTime = new Date(f.arrival_time);
        const durationHr = Math.abs(arrTime.getTime() - depTime.getTime()) / 36e5;

        return (
          <div key={f.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
            {/* Top Row: Airline & Flight No */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://pics.avs.io/200/200/${meta.code}.png`} 
                  alt={f.airline}
                  className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-50"
                />
                <div>
                  <h4 className="font-black text-slate-900 text-sm leading-none">{f.airline}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{f.flight_number} • {f.aircraft_type}</span>
                </div>
              </div>
              <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-black uppercase tracking-tight">On Time</span>
              </div>
            </div>

            {/* Middle Row: The Journey */}
            <div className="flex items-center justify-between bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100 mb-5">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{f.origin}</p>
                <p className="text-[11px] font-bold text-slate-500">{depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              <div className="flex-grow flex flex-col items-center px-4">
                <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{durationHr.toFixed(1)}h Direct</span>
                <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-center">
                  <div className="absolute w-2 h-2 bg-indigo-600 rounded-full border-2 border-white" />
                  <div className="w-full border-t border-dashed border-slate-300" />
                  <Plane size={14} className="absolute text-indigo-600 bg-slate-50 px-0.5 rotate-90" />
                </div>
                <span className="text-[9px] font-bold text-indigo-500 mt-1 uppercase tracking-tighter italic">Economy</span>
              </div>

              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{f.destination}</p>
                <p className="text-[11px] font-bold text-slate-500">{arrTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Bottom Row: Price & Action */}
            <div className="flex items-center justify-between pl-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-orange-600 mb-0.5">
                  <User size={10} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{f.available_seats} Seats Left</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400 italic">₹</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">
                    {Number(f.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => onSelectFlight(f)}
                className="bg-slate-900 text-white px-10 py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-colors"
              >
                Select
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Trust Badge for Mobile */}
      <div className="py-6 flex items-center justify-center gap-2 opacity-40">
        <ShieldCheck size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Database Booking</span>
      </div>
    </div>
  );
}