import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plane, Calendar, MapPin, Plus, Edit2, Trash2, 
  X, ChevronRight, AlertCircle, CheckCircle2, ArrowRightLeft
} from 'lucide-react';

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
        showNotification("Flight radar updated");
      } else {
        setFlights(prev => [updatedRow, ...prev]);
        showNotification("New flight cleared");
      }
      setIsModalOpen(false);
      setEditingFlight(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this flight?")) return;
    const { error } = await supabase.from('flights').delete().eq('id', id);
    if (error) showNotification("Delete failed", true);
    else {
      setFlights(prev => prev.filter(f => f.id !== id));
      showNotification("Record scrubbed");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F8FAFC] overflow-hidden text-slate-900 font-sans">
      
      {/* --- FLOATING NOTIFICATION --- */}
      {statusMsg && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all animate-in slide-in-from-top-full ${statusMsg.isError ? 'bg-rose-600' : 'bg-slate-900'}`}>
          {statusMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-400" />}
          {statusMsg.text}
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex-none bg-white border-b border-slate-100 px-6 pt-12 pb-6 shadow-sm z-30">
        <div className="max-w-2xl mx-auto flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tighter italic">SKYPORT<span className="text-blue-600">.</span></h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory Management</p>
          </div>
          <button 
            onClick={() => { setEditingFlight(null); setIsModalOpen(true); }}
            className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-100 active:scale-90 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>

        {/* --- FILTERS --- */}
        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          <div className="flex-shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" />
            <input 
              type="date" 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
              className="bg-transparent text-[11px] font-black uppercase outline-none"
            />
          </div>
          <div className="flex-shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-2">
            <MapPin size={14} className="text-slate-400" />
            <input 
              placeholder="ORG" 
              value={filterOrigin} 
              onChange={e => setFilterOrigin(e.target.value.toUpperCase())}
              className="bg-transparent text-[11px] font-black uppercase w-12 outline-none"
            />
          </div>
          <div className="flex-shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-2">
            <ArrowRightLeft size={14} className="text-slate-400" />
            <input 
              placeholder="DEST" 
              value={filterDest} 
              onChange={e => setFilterDest(e.target.value.toUpperCase())}
              className="bg-transparent text-[11px] font-black uppercase w-12 outline-none"
            />
          </div>
        </div>
      </header>

      {/* --- MAIN SCROLL AREA --- */}
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-40 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Frequencies...</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
               <Plane size={40} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No Active Flights Found</p>
            </div>
          ) : (
            flights.map((f) => (
              <div key={f.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xs uppercase">
                      {f.airline.substring(0,2)}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">{f.airline}</p>
                      <h3 className="text-lg font-black tracking-tighter">{f.flight_number}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black tracking-tighter text-slate-900">₹{f.price.toLocaleString()}</p>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${f.available_seats < 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {f.available_seats} Seats Open
                    </span>
                  </div>
                </div>

                {/* VISUAL ROUTE */}
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-50">
                  <div className="flex-1 text-center">
                    <p className="text-xl font-black leading-none mb-1">{f.origin}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(f.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="flex-[1.5] flex flex-col items-center">
                    <div className="w-full h-px bg-slate-200 relative">
                      <Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-300" />
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xl font-black leading-none mb-1">{f.destination}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(f.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => { setEditingFlight(f); setIsModalOpen(true); }}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Manage
                  </button>
                  <button 
                    onClick={() => handleDelete(f.id)}
                    className="p-4 bg-rose-50 text-rose-600 rounded-2xl active:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- MODAL / BOTTOM SHEET --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all">
          <div className="bg-white w-full max-h-[94dvh] overflow-y-auto rounded-t-[3.5rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out no-scrollbar sm:max-w-lg">
            
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-8" />

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter">{editingFlight ? 'Modify' : 'New Flight'}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aviation Logistics System</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveFlight} className="space-y-6 pb-20">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Airline" name="airline" defaultValue={editingFlight?.airline} placeholder="Indigo" />
                <Input label="Flight No" name="flight_number" defaultValue={editingFlight?.flight_number} placeholder="6E-212" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Origin (IATA)" name="origin" defaultValue={editingFlight?.origin} placeholder="CCU" maxLength={3} />
                <Input label="Dest (IATA)" name="destination" defaultValue={editingFlight?.destination} placeholder="IXA" maxLength={3} />
              </div>

              <Input label="Departure" name="departure_time" type="datetime-local" defaultValue={editingFlight?.departure_time?.slice(0,16)} />
              <Input label="Arrival" name="arrival_time" type="datetime-local" defaultValue={editingFlight?.arrival_time?.slice(0,16)} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Base Price (₹)" name="price" type="number" defaultValue={editingFlight?.price} />
                <Input label="Inventory" name="available_seats" type="number" defaultValue={editingFlight?.available_seats} />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-100 active:scale-95 transition-all uppercase tracking-tighter">
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// --- Internal Input Component ---
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-sm outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-200" 
        {...props} 
      />
    </div>
  );
}