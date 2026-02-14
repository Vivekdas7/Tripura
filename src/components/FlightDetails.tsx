import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plane, Calendar, MapPin, Plus, Edit2, Trash2, 
  X, ChevronRight, AlertCircle, CheckCircle2, ArrowRightLeft, 
  Clock, Copy, Trash, CheckSquare, Square, Filter, ChevronDown,
  LayoutGrid, ListFilter, ShieldCheck, Zap
} from 'lucide-react';

/**
 * --- DATABASE CONFIGURATION ---
 */
const supabase = createClient(
  'https://twtpgsjwfqddbelcnfez.supabase.co', 
  'sb_publishable_iQ1bpIuPfO8Tgrqz5IxMsg_R-S59FcI'
);

/**
 * --- TYPES & INTERFACES ---
 */
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
 * --- UTILITIES ---
 */
const formatTimeDirectly = (dbString: string) => {
  if (!dbString) return "--:--";
  try {
    const timePart = dbString.includes('T') ? dbString.split('T')[1] : dbString.split(' ')[1];
    return timePart.substring(0, 5);
  } catch (e) {
    return "--:--";
  }
};

const calculateDuration = (dep: string, arr: string) => {
  try {
    const d = new Date(dep).getTime();
    const a = new Date(arr).getTime();
    const diff = Math.abs(a - d) / (1000 * 60);
    const h = Math.floor(diff / 60);
    const m = Math.floor(diff % 60);
    return `${h}h ${m}m`;
  } catch { return "N/A"; }
};

/**
 * --- MAIN COMPONENT ---
 */
export default function FlightManager() {
  // Data States
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('2026-02-14');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDest, setFilterDest] = useState('');
  
  // Selection & Action States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Partial<Flight> | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // --- NOTIFICATIONS ---
  const showNotification = (text: string, isError = false) => {
    setStatusMsg({ text, isError });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // --- FETCHING DATA ---
  const fetchFlights = useCallback(async () => {
    setLoading(true);
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

  // --- ACTIONS: CREATE / UPDATE ---
  const handleSaveFlight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
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

    // If editingFlight has an ID, it's an update. Otherwise, a new record.
    const request = editingFlight?.id 
      ? supabase.from('flights').update(flightPayload).eq('id', editingFlight.id).select()
      : supabase.from('flights').insert([flightPayload]).select();

    const { data, error } = await request;

    if (error) {
      showNotification(`Error: ${error.message}`, true);
    } else {
      fetchFlights();
      setIsModalOpen(false);
      setEditingFlight(null);
      showNotification(editingFlight?.id ? "Radar Updated" : "New Entry Authorized");
    }
  };

  // --- ACTION: DUPLICATE ---
  const handleDuplicate = (f: Flight) => {
    // We remove the ID so the form treats it as a NEW entry with existing data
    const { id, ...dupeData } = f;
    setEditingFlight(dupeData);
    setIsModalOpen(true);
    showNotification("Record Duplicated");
  };

  // --- ACTIONS: DELETE & BULK DELETE ---
  const handleDelete = async (ids: string[]) => {
    const noun = ids.length > 1 ? "flights" : "flight";
    if (!window.confirm(`Permanently scrub ${ids.length} ${noun}?`)) return;

    const { error } = await supabase.from('flights').delete().in('id', ids);
    
    if (error) {
      showNotification("Decommissioning failed", true);
    } else {
      setFlights(prev => prev.filter(f => !ids.includes(f.id)));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      showNotification(`${ids.length} entries removed`);
    }
  };

  // --- SELECTION HELPERS ---
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === flights.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(flights.map(f => f.id)));
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F8FAFC] overflow-hidden text-slate-900 font-sans select-none">
      
      {/* STATUS OVERLAY */}
      {statusMsg && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-[2rem] shadow-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 transition-all animate-in slide-in-from-top-full duration-500 ${statusMsg.isError ? 'bg-rose-600' : 'bg-slate-900'}`}>
          {statusMsg.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} className="text-emerald-400" />}
          {statusMsg.text}
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex-none bg-white border-b border-slate-100 px-6 pt-10 pb-6 shadow-sm z-30">
        <div className="max-w-2xl mx-auto flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <h1 className="text-3xl font-black tracking-tighter italic">SKYPORT<span className="text-blue-600">.</span></h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ops Center / Global Fleet</p>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
                className={`p-4 rounded-2xl transition-all ${isSelectionMode ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}
            >
                <ListFilter size={20} />
            </button>
            <button 
                onClick={() => { setEditingFlight(null); setIsModalOpen(true); }}
                className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-100 active:scale-90 transition-all"
            >
                <Plus size={22} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* --- DYNAMIC FILTER BAR --- */}
        {!isSelectionMode ? (
          <div className="max-w-2xl mx-auto flex gap-3 overflow-x-auto no-scrollbar pb-1">
            <FilterInput icon={<Calendar size={14}/>} type="date" value={filterDate} onChange={setFilterDate} />
            <FilterInput icon={<MapPin size={14}/>} placeholder="ORG" value={filterOrigin} onChange={setFilterOrigin} />
            <FilterInput icon={<ArrowRightLeft size={14}/>} placeholder="DEST" value={filterDest} onChange={setFilterDest} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4">
                <button onClick={selectAll} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg">
                    {selectedIds.size === flights.length ? 'Deselect All' : 'Select All'}
                </button>
                <p className="text-[11px] font-black">{selectedIds.size} Selected</p>
            </div>
            <div className="flex gap-2">
                <button 
                    disabled={selectedIds.size === 0}
                    onClick={() => handleDelete(Array.from(selectedIds))}
                    className="flex items-center gap-2 bg-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                    <Trash size={14} /> Bulk Delete
                </button>
                <button onClick={() => setIsSelectionMode(false)} className="p-2"><X size={20} /></button>
            </div>
          </div>
        )}
      </header>

      {/* --- MAIN LIST --- */}
      <main className="flex-1 overflow-y-auto px-6 pt-8 pb-48 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-[4px] border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing with Frequencies</p>
             </div>
          ) : flights.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-12">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Plane size={32} className="text-slate-200" />
               </div>
               <h3 className="text-lg font-black tracking-tight mb-2">No Data Streams</h3>
               <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[200px] mx-auto uppercase">Try adjusting your filters or creating a new route entry</p>
            </div>
          ) : (
            flights.map((f, idx) => (
              <div 
                key={f.id} 
                onClick={() => isSelectionMode && toggleSelect(f.id)}
                className={`relative transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both ${isSelectionMode ? 'cursor-pointer' : ''}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* SELECTION CHECKBOX (Overlay) */}
                {isSelectionMode && (
                    <div className={`absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${selectedIds.has(f.id) ? 'bg-blue-600 border-blue-600 text-white scale-110' : 'bg-white border-slate-200 shadow-sm'}`}>
                        {selectedIds.has(f.id) && <CheckCircle2 size={16} strokeWidth={3} />}
                    </div>
                )}

                {/* CARD BODY */}
                <div className={`bg-white rounded-[3.5rem] border border-slate-100 p-8 shadow-sm transition-all relative overflow-hidden ${selectedIds.has(f.id) ? 'translate-x-6 opacity-60' : 'hover:shadow-xl hover:shadow-slate-200/50'}`}>
                  
                  {/* Decorative Gradient Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-50 text-blue-600 rounded-[1.8rem] flex flex-col items-center justify-center border border-slate-100 shadow-inner">
                        <span className="text-[14px] font-black leading-none">{f.airline.substring(0,2).toUpperCase()}</span>
                        <div className="w-4 h-0.5 bg-blue-200 mt-1 rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">{f.airline}</p>
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none">{f.flight_number}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 mb-2">
                         <span className="text-xs font-black text-slate-400">₹</span>
                         <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none">{f.price.toLocaleString()}</p>
                      </div>
                      <span className={`text-[9px] font-black px-4 py-2 rounded-2xl uppercase inline-block border ${f.available_seats < 10 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {f.available_seats} / {f.total_seats} Seats
                      </span>
                    </div>
                  </div>

                  {/* VIRTUALIZED ROUTE BOX */}
                  <div className="grid grid-cols-7 items-center gap-2 bg-slate-50/70 p-7 rounded-[2.5rem] border border-slate-100/50 mb-8 relative">
                    <div className="col-span-2 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">DEP</p>
                      <p className="text-3xl font-black tracking-tighter mb-2">{f.origin}</p>
                      <div className="flex items-center justify-center gap-1.5 text-blue-600">
                          <Clock size={12} strokeWidth={3} />
                          <p className="text-xs font-black uppercase">{formatTimeDirectly(f.departure_time)}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex flex-col items-center">
                      <div className="w-full flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-slate-200" />
                          <Plane size={18} className="text-blue-300 rotate-90 shrink-0" />
                          <div className="h-px flex-1 bg-slate-200" />
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{calculateDuration(f.departure_time, f.arrival_time)}</p>
                    </div>

                    <div className="col-span-2 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">ARR</p>
                      <p className="text-3xl font-black tracking-tighter mb-2">{f.destination}</p>
                      <div className="flex items-center justify-center gap-1.5 text-blue-600">
                          <p className="text-xs font-black uppercase">{formatTimeDirectly(f.arrival_time)}</p>
                          <Clock size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </div>

                  {/* ACTION BAR */}
                  {!isSelectionMode && (
                    <div className="flex gap-3 relative z-10">
                      <button 
                        onClick={() => { setEditingFlight(f); setIsModalOpen(true); }}
                        className="flex-1 bg-slate-900 text-white py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-all shadow-xl shadow-slate-200"
                      >
                        Modify Data
                      </button>
                      <button 
                        onClick={() => handleDuplicate(f)}
                        className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.8rem] flex items-center justify-center active:bg-blue-100 transition-all border border-blue-100"
                        title="Duplicate Flight"
                      >
                        <Copy size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete([f.id])}
                        className="w-16 h-16 bg-rose-50 text-rose-600 rounded-[1.8rem] flex items-center justify-center active:bg-rose-100 transition-all border border-rose-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- MODAL SYSTEM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all animate-in fade-in duration-300">
          <div className="bg-white w-full max-h-[96dvh] overflow-y-auto rounded-t-[4rem] sm:rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-full duration-700 ease-out no-scrollbar sm:max-w-lg">
            
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />

            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tighter italic">
                    {editingFlight?.id ? 'MOD' : 'AUTH'}<span className="text-blue-600">.</span>
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-none">Flight Log Verification</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center transition-all hover:bg-slate-100 active:rotate-90"
              >
                <X size={26} />
              </button>
            </div>
            
            <form onSubmit={handleSaveFlight} className="space-y-8 pb-12">
              <div className="grid grid-cols-2 gap-5">
                <ModernInput label="Airline Brand" name="airline" defaultValue={editingFlight?.airline} placeholder="Indigo" required />
                <ModernInput label="Registration #" name="flight_number" defaultValue={editingFlight?.flight_number} placeholder="6E-202" required />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <ModernInput label="Launch Point" name="origin" defaultValue={editingFlight?.origin} placeholder="CCU" maxLength={3} required />
                <ModernInput label="Landing Zone" name="destination" defaultValue={editingFlight?.destination} placeholder="DEL" maxLength={3} required />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <ModernInput 
                    label="Departure (Schedule)" 
                    name="departure_time" 
                    type="datetime-local" 
                    defaultValue={editingFlight?.departure_time?.replace(' ', 'T').slice(0,16)} 
                    required
                />
                <ModernInput 
                    label="Arrival (Target)" 
                    name="arrival_time" 
                    type="datetime-local" 
                    defaultValue={editingFlight?.arrival_time?.replace(' ', 'T').slice(0,16)} 
                    required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <ModernInput label="Unit Price (₹)" name="price" type="number" defaultValue={editingFlight?.price} required />
                <ModernInput label="Inventory" name="available_seats" type="number" defaultValue={editingFlight?.available_seats} required />
              </div>

              <div className="pt-4">
                  <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-blue-200 active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center gap-3">
                    <Zap size={20} fill="currentColor" />
                    {editingFlight?.id ? 'Apply Modifications' : 'Launch Route'}
                  </button>
                  <p className="text-center text-[9px] font-black text-slate-300 uppercase mt-6 tracking-[0.2em]">Data encrypted via Skyport v2.6.1</p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CSS FOR NO SCROLLBAR */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(0.4);
            opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

/**
 * --- SUB-COMPONENTS ---
 */

function FilterInput({ icon, ...props }: any) {
    return (
        <div className="flex-shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-inner">
            <span className="text-blue-500">{icon}</span>
            <input 
                {...props}
                className="bg-transparent text-[11px] font-black uppercase outline-none placeholder:text-slate-300 w-16 sm:w-20"
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
}

function ModernInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-3">{label}</label>
      <input 
        className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-black text-sm outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-200 shadow-inner" 
        {...props} 
      />
    </div>
  );
}