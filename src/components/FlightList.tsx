import { useState, useEffect, useMemo } from 'react';
import { 
  Plane, 
  User, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  TrendingDown, 
  ShieldAlert,
  Info,
  Calendar,
  IndianRupee,
  BadgePercent,
  Star,
  ArrowRightLeft,
  Navigation,
  Filter,
  Flame,
  RefreshCcw
} from 'lucide-react';

/**
 * --- INTERFACES & TYPES ---
 */
export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flight_number: string;
  origin: string;
  destination: string;
  stops: number;
  departure_time: string;
  arrival_time: string;
  price: number;
  duration: string;
  available_seats: number;
  total_seats: number;
}

interface AirlineMeta {
  code: string;
  color: string;
  fullName: string;
}

/**
 * --- CONSTANTS ---
 */
const PLATFORM_FEE_SAVINGS = 400;
const RAPID_API_KEY = '64eaeaba66mshe996f271458da7ap11bdb8jsnb74702c01a50';
const RAPID_API_HOST = 'flights-sky.p.rapidapi.com';

/**
 * --- HELPER FUNCTIONS ---
 */
const getAirlineData = (name: string, code?: string): AirlineMeta => {
  const n = name.toLowerCase();
  const c = code?.toUpperCase();
  
  if (n.includes('indigo') || c === '6E') return { code: '6E', color: '#001b94', fullName: 'IndiGo' };
  if (n.includes('express') || c === 'IX') return { code: 'IX', color: '#d42e12', fullName: 'Air India Express' };
  if (n.includes('india') || c === 'AI') return { code: 'AI', color: '#ed1c24', fullName: 'Air India' };
  if (n.includes('vistara') || c === 'UK') return { code: 'UK', color: '#5f2653', fullName: 'Vistara' };
  if (n.includes('akasa') || c === 'QP') return { code: 'QP', color: '#ff6d22', fullName: 'Akasa Air' };
  return { code: c || 'G8', color: '#0f172a', fullName: name };
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "--:--";
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return "--:--"; }
};

/**
 * --- ATOMIC UI COMPONENTS ---
 */

const SavingsBadge = () => (
  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 animate-pulse">
    <CheckCircle2 size={10} strokeWidth={3} />
    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight">₹0 Convenience Fee</span>
  </div>
);

const UrgencyBadge = () => (
  <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md self-end">
    <Zap size={9} fill="currentColor" />
    <span className="text-[8px] font-black uppercase italic">Selling Fast</span>
  </div>
);

const ProgressIndicator = ({ current, total, low }: { current: number, total: number, low: boolean }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center w-full">
      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
      <span className={`text-[8px] font-black ${low ? 'text-rose-500' : 'text-indigo-500'}`}>{current} Seats</span>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${low ? 'bg-rose-500' : 'bg-indigo-600'}`}
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  </div>
);

/**
 * --- MAIN LIST COMPONENT ---
 */
export default function FlightList({ searchParams, onSelectFlight }: { searchParams: any, onSelectFlight: (f: Flight) => void }) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'direct' | 'cheapest'>('all');

  const fetchFlights = async () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.date) return;
    
    setLoading(true);
    const url = `https://${RAPID_API_HOST}/flights/search-one-way?fromEntityId=${searchParams.origin}&toEntityId=${searchParams.destination}&departDate=${searchParams.date}&market=IN&currency=INR`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      });

      const result = await response.json();
      
      // Transform RapidAPI structure to our local Flight interface
      if (result.status && result.data && result.data.itineraries) {
        const mappedFlights: Flight[] = result.data.itineraries.map((it: any) => {
          const leg = it.legs[0];
          const carrier = leg.carriers.marketing[0];
          
          return {
            id: it.id,
            airline: carrier.name,
            airlineCode: carrier.displayCode,
            flight_number: `${carrier.displayCode}-${leg.segments[0].flightNumber}`,
            origin: leg.origin.displayCode,
            destination: leg.destination.displayCode,
            stops: leg.stopCount,
            departure_time: leg.departure,
            arrival_time: leg.arrival,
            price: Math.round(it.price.raw),
            duration: Math.floor(leg.durationInMinutes / 60) + "h " + (leg.durationInMinutes % 60) + "m",
            available_seats: Math.floor(Math.random() * 10) + 1, // Mock data as API rarely provides live seat counts
            total_seats: 180
          };
        });
        setFlights(mappedFlights);
      }
    } catch (error) {
      console.error("API Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [searchParams.origin, searchParams.destination, searchParams.date]);

  /**
   * --- FILTERING LOGIC ---
   */
  const filteredFlights = useMemo(() => {
    let result = [...flights];
    if (activeFilter === 'direct') {
      result = result.filter(f => f.stops === 0);
    } else if (activeFilter === 'cheapest') {
      result = result.sort((a, b) => a.price - b.price);
    }
    return result;
  }, [flights, activeFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 px-6 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0" />
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Radar Active</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Fetching Best Fares from RapidAPI...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-1 space-y-6 mt-4">
      
      {/* HEADER & REFRESH */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Live Results</span>
        </div>
        <button 
          onClick={fetchFlights}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <RefreshCcw size={14} className="text-slate-400" />
        </button>
      </div>

      {/* QUICK FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`flex-none px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
            activeFilter === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100'
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveFilter('direct')}
          className={`flex-none px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
            activeFilter === 'direct' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100'
          }`}
        >
          Non-Stop
        </button>
        <button 
          onClick={() => setActiveFilter('cheapest')}
          className={`flex-none px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
            activeFilter === 'cheapest' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100'
          }`}
        >
          Cheapest
        </button>
      </div>

      {/* NO RESULTS STATE */}
      {filteredFlights.length === 0 && !loading && (
        <div className="bg-white rounded-[2.5rem] p-10 text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-slate-300" size={32} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase">No Flights Found</h3>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Try changing your search date or filters.</p>
        </div>
      )}

      {/* FLIGHT CARDS */}
      {filteredFlights.map((f, idx) => {
        const meta = getAirlineData(f.airline, f.airlineCode);
        const isSoldOut = f.available_seats <= 0;
        const isLow = f.available_seats <= 3;

        return (
          <div 
            key={f.id}
            onClick={() => !isSoldOut && onSelectFlight(f)}
            style={{ animationDelay: `${idx * 100}ms` }}
            className={`group animate-in fade-in slide-in-from-bottom-4 duration-500 ${isSoldOut ? 'opacity-50 pointer-events-none' : 'active:scale-[0.98]'}`}
          >
            {/* TOP SECTION */}
            <div className="bg-white rounded-t-[2.5rem] p-6 pb-4 border-t border-x border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl p-1.5 border border-slate-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://pics.avs.io/200/100/${meta.code}.png`} 
                      className="w-full h-full object-contain" 
                      alt={meta.code}
                      onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/40?text=✈️' }} 
                    />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase text-slate-900 leading-none">{meta.fullName}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{f.flight_number}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <SavingsBadge />
                  {isLow && <UrgencyBadge />}
                </div>
              </div>

              {/* ROUTE BOX */}
              <div className="grid grid-cols-7 items-center gap-2 mb-4">
                <div className="col-span-2">
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Origin</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{f.origin}</p>
                  <p className="text-[11px] font-bold text-indigo-600 mt-1">{formatTime(f.departure_time)}</p>
                </div>

                <div className="col-span-3 flex flex-col items-center">
                  <div className="w-full h-px bg-slate-100 relative mb-3">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      <Plane size={14} className="text-slate-300 rotate-90" />
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.duration}</span>
                  <div className="mt-2 px-2 py-0.5 rounded-full bg-slate-50 text-[7px] font-black text-slate-400 border uppercase">
                    {f.stops === 0 ? 'Non-Stop' : `${f.stops} Stop`}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Dest</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{f.destination}</p>
                  <p className="text-[11px] font-bold text-indigo-600 mt-1">{formatTime(f.arrival_time)}</p>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="relative h-6 bg-white border-x border-slate-100 flex items-center px-4">
              <div className="absolute -left-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100 shadow-inner" />
              <div className="absolute -right-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100 shadow-inner" />
              <div className="w-full border-t-2 border-dashed border-slate-100 opacity-50" />
            </div>

            {/* BOTTOM SECTION */}
            <div className="bg-white rounded-b-[2.5rem] p-6 pt-3 border-b border-x border-slate-100 shadow-xl shadow-slate-200/40">
              
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><TrendingDown size={14} className="text-slate-400" /></div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Others</p>
                    <p className="text-xs font-bold text-slate-400 line-through">₹{(f.price + PLATFORM_FEE_SAVINGS).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-emerald-500 uppercase">Discount Applied</p>
                  <p className="text-xs font-black text-emerald-600">-₹{PLATFORM_FEE_SAVINGS}</p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-900 leading-none">Instant Booking</p>
                      <p className="text-[8px] text-slate-400 mt-1">Direct via Skyscanner</p>
                    </div>
                  </div>
                  <ProgressIndicator current={f.available_seats} total={f.total_seats} low={isLow} />
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">Net</span>
                    <span className="text-xs font-black text-slate-900">₹</span>
                   <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
  {(f.price + 200).toLocaleString()}
</span>

                  </div>
                  <button className="h-8 px-4 bg-slate-900 text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-200 group-hover:bg-indigo-700 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest">Select</span>
                    <ChevronRight size={10} />
                  </button>
                </div>
              </div>

              {/* BARCODE DECO */}
              <div className="mt-6 pt-4 border-t border-slate-50 flex flex-col items-center gap-2">
                <div className="flex gap-[2px] h-4 opacity-10">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="bg-black rounded-full" style={{ width: `${(i % 5) + 1}px` }} />
                  ))}
                </div>
                <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em]">External API Verification</p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="py-10 text-center space-y-4">
        <div className="flex justify-center gap-6 opacity-30">
          <ShieldAlert size={18} />
          <Navigation size={18} />
          <ArrowRightLeft size={18} />
        </div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">RapidAPI Data Node: {RAPID_API_HOST}</p>
      </div>
    </div>
  );
}