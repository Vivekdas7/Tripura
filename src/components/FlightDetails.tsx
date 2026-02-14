import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Configuration ---
const supabase = createClient(
  'https://twtpgsjwfqddbelcnfez.supabase.co', 
  'sb_publishable_iQ1bpIuPfO8Tgrqz5IxMsg_R-S59FcI'
);

interface FareOption {
  type: string;
  price: number;
}

interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  status: string;
  fare_options: FareOption[];
}

export default function FlightManager() {
  // --- States ---
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('2026-02-14');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDest, setFilterDest] = useState('');
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Helper: Notifications ---
  const showNotification = (text: string, isError = false) => {
    setStatusMsg({ text, isError });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // --- 1. READ (Fetch) ---
  const fetchFlights = useCallback(async () => {
    setLoading(true);
    const startOfDay = `${filterDate}T00:00:00Z`;
    const endOfDay = `${filterDate}T23:59:59Z`;

    let query = supabase
      .from('flights')
      .select('*')
      .gte('departure_time', startOfDay)
      .lte('departure_time', endOfDay);

    if (filterOrigin) query = query.ilike('origin', `%${filterOrigin}%`);
    if (filterDest) query = query.ilike('destination', `%${filterDest}%`);

    const { data, error } = await query.order('departure_time', { ascending: true });

    if (error) {
      showNotification("Cloud sync failed", true);
    } else {
      setFlights((data as Flight[]) || []);
    }
    setLoading(false);
  }, [filterDate, filterOrigin, filterDest]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  // --- 2. CREATE & UPDATE ---
  const handleSaveFlight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const flightPayload = {
      airline: formData.get('airline') as string,
      flight_number: formData.get('flight_number') as string,
      origin: (formData.get('origin') as string).toUpperCase(),
      destination: (formData.get('destination') as string).toUpperCase(),
      departure_time: formData.get('departure_time') as string,
      arrival_time: formData.get('arrival_time') as string,
      price: Number(formData.get('price')),
      available_seats: Number(formData.get('available_seats')),
      total_seats: 180,
      status: 'active',
      fare_options: editingFlight?.fare_options || [{ type: 'Saver', price: Number(formData.get('price')) }]
    };

    const request = editingFlight?.id 
      ? supabase.from('flights').update(flightPayload).eq('id', editingFlight.id).select()
      : supabase.from('flights').insert([flightPayload]).select();

    const { data, error } = await request;

    if (error) {
      showNotification(`Error: ${error.message}`, true);
    } else if (data && data.length > 0) {
      const updatedRow = data[0] as Flight;
      if (editingFlight?.id) {
        setFlights(prev => prev.map(f => f.id === editingFlight.id ? updatedRow : f));
        showNotification("Flight updated on radar");
      } else {
        setFlights(prev => [updatedRow, ...prev]);
        showNotification("New flight cleared for takeoff");
      }
      setIsModalOpen(false);
      setEditingFlight(null);
    }
  };

  // --- 3. DELETE ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("This will permanently remove this flight record. Proceed?")) return;
    
    const { error } = await supabase.from('flights').delete().eq('id', id);
    if (error) {
      showNotification("Could not delete record", true);
    } else {
      setFlights(prev => prev.filter(f => f.id !== id));
      showNotification("Flight scrubbed from system");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* Toast Notification (Floating Action Style) */}
      {statusMsg && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl text-white text-sm font-bold flex items-center gap-3 transition-all animate-in slide-in-from-top-full duration-300 ${statusMsg.isError ? 'bg-rose-500' : 'bg-slate-900'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${statusMsg.isError ? 'bg-white' : 'bg-emerald-400'}`}></div>
          {statusMsg.text}
        </div>
      )}

      {/* Glass Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 p-4 pb-6">
        <div className="max-w-xl mx-auto space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 italic">SKYPORT<span className="text-indigo-600">.</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Dashboard</p>
            </div>
            <button 
              onClick={() => { setEditingFlight(null); setIsModalOpen(true); }}
              className="bg-indigo-600 text-white h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <div className="flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-2 px-4 flex items-center gap-3 shadow-sm">
                <span className="text-[10px] font-black text-indigo-500 uppercase">Date</span>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0" />
            </div>
            <input 
              type="text" 
              placeholder="Origin (e.g CCU)" 
              value={filterOrigin} 
              onChange={e => setFilterOrigin(e.target.value)} 
              className="flex-shrink-0 w-32 bg-white border border-slate-200 rounded-2xl p-3 text-sm font-bold uppercase placeholder:text-slate-300 focus:border-indigo-500 focus:ring-0 transition-all shadow-sm" 
            />
            <input 
              type="text" 
              placeholder="Dest (e.g IXA)" 
              value={filterDest} 
              onChange={e => setFilterDest(e.target.value)} 
              className="flex-shrink-0 w-32 bg-white border border-slate-200 rounded-2xl p-3 text-sm font-bold uppercase placeholder:text-slate-300 focus:border-indigo-500 focus:ring-0 transition-all shadow-sm" 
            />
          </div>
        </div>
      </header>

      {/* Flight List Container */}
      <main className="max-w-xl mx-auto p-4 space-y-6 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Airspace...</p>
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-inner">
             <div className="text-4xl mb-4">☁️</div>
             <p className="text-slate-400 font-bold text-sm">No flights scheduled for this route.</p>
          </div>
        ) : (
          flights.map((f, idx) => f && (
            <div 
              key={f.id} 
              className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden group animate-in fade-in slide-in-from-bottom-6 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                      {f.airline.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{f.airline}</span>
                      <h3 className="text-lg font-black text-slate-800 leading-none">{f.flight_number}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 leading-none">₹{f.price.toLocaleString()}</div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full mt-2 inline-block ${f.available_seats < 20 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {f.available_seats} SEATS LEFT
                    </span>
                  </div>
                </div>

                {/* Route Visualizer */}
                <div className="flex items-center justify-between gap-6 py-4 bg-slate-50/50 rounded-3xl px-6 border border-slate-50">
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-800 leading-none">{f.origin}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Origin</div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center">
                     <div className="w-full h-[1.5px] bg-indigo-100 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-indigo-100 p-1 rounded-full text-indigo-500 transform rotate-45">
                           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                        </div>
                     </div>
                     <div className="text-[10px] font-black text-indigo-600 mt-3 tabular-nums">
                       {new Date(f.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-800 leading-none">{f.destination}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Dest</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => { setEditingFlight(f); setIsModalOpen(true); }} 
                    className="flex-[2] bg-indigo-50 text-indigo-600 font-black py-4 rounded-2xl active:bg-indigo-100 transition-colors text-xs uppercase tracking-widest"
                  >
                    Modify
                  </button>
                  <button 
                    onClick={() => handleDelete(f.id)} 
                    className="flex-1 bg-white text-rose-400 font-black py-4 rounded-2xl border border-rose-50 active:bg-rose-50 transition-colors text-xs uppercase tracking-widest"
                  >
                    Scrub
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Modern Bottom Sheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center transition-all">
          <div 
            className="bg-white w-full max-h-[92vh] sm:max-w-lg rounded-t-[3.5rem] sm:rounded-[3.5rem] p-8 relative shadow-2xl overflow-y-auto animate-in slide-in-from-bottom-full duration-500 ease-out"
          >
            {/* Modal Handle (Mobile Feel) */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-light text-2xl"
            >
              &times;
            </button>
            
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">
              {editingFlight ? 'Edit Flight' : 'Add Flight'}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Manual Override Console</p>
            
            <form onSubmit={handleSaveFlight} className="space-y-6 pb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Airline</label>
                  <input name="airline" defaultValue={editingFlight?.airline} placeholder="Indigo" className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Flight ID</label>
                  <input name="flight_number" defaultValue={editingFlight?.flight_number} placeholder="6E-202" className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Origin Port</label>
                  <input name="origin" defaultValue={editingFlight?.origin} placeholder="CCU" className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold uppercase focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" maxLength={3} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dest Port</label>
                  <input name="destination" defaultValue={editingFlight?.destination} placeholder="IXA" className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold uppercase focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" maxLength={3} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure Schedule</label>
                <input type="datetime-local" name="departure_time" defaultValue={editingFlight?.departure_time?.slice(0,16)} className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Schedule</label>
                <input type="datetime-local" name="arrival_time" defaultValue={editingFlight?.arrival_time?.slice(0,16)} className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fare (INR)</label>
                  <input type="number" name="price" defaultValue={editingFlight?.price} placeholder="0.00" className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inventory</label>
                  <input type="number" name="available_seats" defaultValue={editingFlight?.available_seats} placeholder="180" className="w-full p-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" required />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white p-5 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-slate-200 active:scale-95 transition-all mt-4 uppercase tracking-tighter"
              >
                Transmit Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSS For Hide Scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}