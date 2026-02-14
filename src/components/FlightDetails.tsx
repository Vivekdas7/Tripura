import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plane, Calendar, MapPin, Plus, Edit2, Trash2, 
  X, ChevronRight, AlertCircle, CheckCircle2, ArrowRightLeft, Clock
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

/**
 * FIXED: Helper to show time exactly as stored in DB without Timezone shifts
 */
const formatTimeDirectly = (dbString: string) => {
  if (!dbString) return "--:--";
  try {
    // If string is "2026-02-14T10:30:00", this takes the "10:30" part
    const timePart = dbString.includes('T') ? dbString.split('T')[1] : dbString.split(' ')[1];
    return timePart.substring(0, 5);
  } catch (e) {
    return "--:--";
  }
};

export default function FlightManager() {
  // --- States ---
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('2026-02-14');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDest, setFilterDest] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const showNotification = (text: string, isError = false) => {
    setStatusMsg({ text, isError });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    // Use simple date strings for range to avoid TZ issues in query
    const startOfDay = `${filterDate} 00:00:00`;
    const endOfDay = `${filterDate} 23:59:59`;

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

  const handleSaveFlight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Convert datetime-local "YYYY-MM-DDTHH:mm" to "YYYY-MM-DD HH:mm:ss" for Supabase
    const dep = (formData.get('departure_time') as string).replace('T', ' ');
    const arr = (formData.get('arrival_time') as string).replace('T', ' ');

    const flightPayload = {
      airline: formData.get('airline') as string,
      flight_number: formData.get('flight_number') as string,
      origin: (formData.get('origin') as string).toUpperCase(),
      destination: (formData.get('destination') as string).toUpperCase(),
      departure_time: dep,
      arrival_time: arr,
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
      fetchFlights(); // Refresh to ensure data consistency
      setIsModalOpen(false);
      setEditingFlight(null);
      showNotification(editingFlight ? "Radar Updated" : "Flight Cleared");
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
      
      {statusMsg && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all animate-in slide-in-from-top-full ${statusMsg.isError ? 'bg-rose-600' : 'bg-slate-900'}`}>
          {statusMsg.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-400" />}
          {statusMsg.text}
        </div>
      )}

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

        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto no-scrollbar pb-2">
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

      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-40 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : flights.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
               <Plane size={40} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No Flights Found</p>
            </div>
          ) : (
            flights.map((f) => (
              <div key={f.id} className="bg-white rounded-[3rem] border border-slate-100 p-7 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xs">
                      {f.airline.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{f.airline}</p>
                      <h3 className="text-xl font-black tracking-tighter">{f.flight_number}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tighter text-slate-900">₹{f.price.toLocaleString()}</p>
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase inline-block mt-2 ${f.available_seats < 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {f.available_seats} Seats Left
                    </span>
                  </div>
                </div>

                {/* UPDATED: Visual Route using formatTimeDirectly */}
                <div className="grid grid-cols-3 items-center gap-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-black tracking-tighter mb-1">{f.origin}</p>
                    <div className="flex items-center justify-center gap-1 text-indigo-600">
                        <Clock size={10} strokeWidth={3} />
                        <p className="text-[11px] font-black uppercase">{formatTimeDirectly(f.departure_time)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-full h-[2px] bg-slate-200 relative mb-2">
                      <Plane size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-300 rotate-90" />
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Non-Stop</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-black tracking-tighter mb-1">{f.destination}</p>
                    <div className="flex items-center justify-center gap-1 text-indigo-600">
                        <p className="text-[11px] font-black uppercase">{formatTimeDirectly(f.arrival_time)}</p>
                        <Clock size={10} strokeWidth={3} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setEditingFlight(f); setIsModalOpen(true); }}
                    className="flex-1 bg-slate-900 text-white py-4.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Edit Logistics
                  </button>
                  <button 
                    onClick={() => handleDelete(f.id)}
                    className="w-14 h-14 bg-rose-50 text-rose-600 rounded-[1.5rem] flex items-center justify-center active:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white w-full max-h-[94dvh] overflow-y-auto rounded-t-[3.5rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full no-scrollbar sm:max-w-lg">
            
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-8" />

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter">{editingFlight ? 'Edit Flight' : 'New Flight'}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">System Entry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveFlight} className="space-y-6 pb-12">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Airline Name" name="airline" defaultValue={editingFlight?.airline} placeholder="Air India" required />
                <Input label="Flight Number" name="flight_number" defaultValue={editingFlight?.flight_number} placeholder="AI-102" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Origin (IATA)" name="origin" defaultValue={editingFlight?.origin} placeholder="CCU" maxLength={3} required />
                <Input label="Destination (IATA)" name="destination" defaultValue={editingFlight?.destination} placeholder="DEL" maxLength={3} required />
              </div>

              <Input 
                label="Departure (Local Time)" 
                name="departure_time" 
                type="datetime-local" 
                defaultValue={editingFlight?.departure_time?.replace(' ', 'T').slice(0,16)} 
                required
              />
              <Input 
                label="Arrival (Local Time)" 
                name="arrival_time" 
                type="datetime-local" 
                defaultValue={editingFlight?.arrival_time?.replace(' ', 'T').slice(0,16)} 
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Ticket Price (₹)" name="price" type="number" defaultValue={editingFlight?.price} required />
                <Input label="Initial Seats" name="available_seats" type="number" defaultValue={editingFlight?.available_seats} required />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all uppercase tracking-tighter">
                {editingFlight ? 'Update Flight' : 'Authorize Flight'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
        }
      `}</style>
    </div>
  );
}

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