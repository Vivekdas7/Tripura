import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Calendar, Phone, ShieldCheck, Menu,
  PlaneTakeoff, CheckCircle2, Clock, AlertCircle, RefreshCw,
  Mail, Ticket, Download, Filter, ChevronRight, X, 
  ArrowUpRight, IndianRupee, Hash, Plane, LayoutDashboard,
  ExternalLink, Bell, Settings, CheckSquare, Square, Save, MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- INTERFACES ---
interface Passenger {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

interface Booking {
  id: string;
  booking_reference: string;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  status: string;
  total_price: number;
  total_passengers: number;
  created_at: string;
  is_fulfilled: boolean; 
  internal_note: string;
  passengers: Passenger[];
}

export default function MobileAdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending_action" | "fulfilled">("all");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, passengers(*)')
      .order('created_at', { ascending: false });
    if (!error && data) setBookings(data);
    setLoading(false);
  };

  const toggleFulfillment = async (id: string, currentState: boolean) => {
    const { error } = await supabase.from('bookings').update({ is_fulfilled: !currentState }).eq('id', id);
    if (!error) {
      setBookings(bookings.map(b => b.id === id ? { ...b, is_fulfilled: !currentState } : b));
      if (selectedBooking?.id === id) setSelectedBooking({...selectedBooking, is_fulfilled: !currentState});
    }
  };

  const updateInternalNote = async (id: string, note: string) => {
    await supabase.from('bookings').update({ internal_note: note }).eq('id', id);
  };

  const filteredData = useMemo(() => {
    return bookings.filter(b => {
      const name = `${b.passengers?.[0]?.first_name} ${b.passengers?.[0]?.last_name}`.toLowerCase();
      const matchesSearch = b.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
      if (filterStatus === "pending_action") return matchesSearch && !b.is_fulfilled;
      if (filterStatus === "fulfilled") return matchesSearch && b.is_fulfilled;
      return matchesSearch;
    });
  }, [bookings, searchTerm, filterStatus]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans">
      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#0F172A] border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Plane className="text-orange-500" size={20} />
          <span className="font-black italic text-white tracking-tighter">TRIPURA<span className="text-orange-500">FLY</span></span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400"><Menu /></button>
      </header>

      {/* DESKTOP SIDEBAR / MOBILE DRAWER */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-64 bg-[#0F172A] border-r border-white/5 transform transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center"><Plane size={20} className="text-white"/></div>
              <span className="font-black text-white italic">ADMIN</span>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
          </div>
          
          <nav className="space-y-2 flex-1">
            <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active />
            <NavItem icon={<Users size={18}/>} label="Passengers" />
            <NavItem icon={<Bell size={18}/>} label="Notifications" />
          </nav>

          <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">System Status</p>
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <section className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Control <span className="text-orange-500">Center</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Bookings & Procurement</p>
          </section>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                className="w-full bg-[#0F172A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-orange-500 outline-none transition-all"
                placeholder="Search Passenger or PNR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <FilterBtn active={filterStatus === 'all'} label="All" onClick={() => setFilterStatus('all')} />
              <FilterBtn active={filterStatus === 'pending_action'} label="To Do" onClick={() => setFilterStatus('pending_action')} />
              <FilterBtn active={filterStatus === 'fulfilled'} label="Done" onClick={() => setFilterStatus('fulfilled')} />
            </div>
          </div>

          {/* RESPONSIVE LIST / TABLE */}
          <div className="space-y-4">
            {/* Table Header - Desktop Only */}
            <div className="hidden lg:grid grid-cols-5 p-6 bg-slate-900/40 rounded-t-3xl border border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <div>Fulfillment</div>
              <div>Passenger</div>
              <div>Route</div>
              <div>Time</div>
              <div className="text-right">Action</div>
            </div>

            {filteredData.map((b) => (
              <div 
                key={b.id} 
                className={`group relative grid grid-cols-1 lg:grid-cols-5 items-center p-5 md:p-6 rounded-3xl border transition-all duration-300 ${
                  b.is_fulfilled 
                    ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                    : 'bg-[#0F172A] border-white/5 hover:border-orange-500/30'
                }`}
              >
                {/* Mobile: Fulfillment Toggle Row */}
                <div className="flex items-center justify-between lg:block mb-4 lg:mb-0">
                  <button 
                    onClick={() => toggleFulfillment(b.id, b.is_fulfilled)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                      b.is_fulfilled ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 border border-white/5'
                    }`}
                  >
                    {b.is_fulfilled ? <CheckSquare size={14}/> : <Square size={14}/>}
                    {b.is_fulfilled ? 'Booked' : 'Unbooked'}
                  </button>
                  <span className="lg:hidden text-[10px] font-bold text-slate-500">{new Date(b.created_at).toLocaleDateString()}</span>
                </div>

                {/* Passenger Info */}
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-sm font-black text-white uppercase truncate">{b.passengers?.[0]?.first_name} {b.passengers?.[0]?.last_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash size={10} className="text-orange-500" />
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{b.booking_reference}</span>
                  </div>
                </div>

                {/* Route */}
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center gap-3 text-xs font-black text-white italic">
                    {b.origin} <PlaneTakeoff size={14} className="text-orange-500 animate-pulse"/> {b.destination}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{b.airline} {b.flight_number}</p>
                </div>

                {/* Time - Desktop Only */}
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-400">{new Date(b.created_at).toLocaleDateString()}</p>
                  <p className="text-[10px] text-blue-500 font-bold">{new Date(b.created_at).toLocaleTimeString()}</p>
                </div>

                {/* Open Panel Button */}
                <div className="flex justify-end">
                   <button 
                    onClick={() => setSelectedBooking(b)}
                    className="w-full lg:w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all border border-white/5"
                   >
                     <span className="lg:hidden text-xs font-bold mr-2">Manage Booking</span>
                     <ChevronRight size={18}/>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MOBILE FRIENDLY SIDE PANEL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-md bg-[#0F172A] h-full flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Manifest Detail</h2>
                <button onClick={() => setSelectedBooking(null)} className="p-2 bg-slate-800 rounded-lg"><X /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* STATUS TOGGLE SECTION */}
                <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 shadow-inner">
                   <p className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                     <ShieldCheck size={14}/> Fulfillment Status
                   </p>
                   <p className="text-xs text-slate-400 mb-6 font-bold leading-relaxed">
                     Switch this ON if you have completed the booking on an external airline portal.
                   </p>
                   <button 
                    onClick={() => toggleFulfillment(selectedBooking.id, selectedBooking.is_fulfilled)}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                      selectedBooking.is_fulfilled 
                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' 
                        : 'bg-slate-800 text-slate-500 border border-white/5'
                    }`}
                   >
                     {selectedBooking.is_fulfilled ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                     {selectedBooking.is_fulfilled ? 'BOOKED EXTERNALLY' : 'MARK AS COMPLETED'}
                   </button>
                </div>

                {/* INTERNAL REMARKS */}
                <div>
                   <p className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                     <MessageSquare size={14}/> Internal Remarks (Admin Only)
                   </p>
                   <div className="relative group">
                      <textarea 
                        className="w-full bg-slate-900 border border-white/5 rounded-[2rem] p-6 text-sm text-white focus:border-orange-500 outline-none h-40 transition-all resize-none"
                        placeholder="Write notes here... (e.g. Card used: HDFC, Agent: Rohit)"
                        defaultValue={selectedBooking.internal_note}
                        onBlur={(e) => updateInternalNote(selectedBooking.id, e.target.value)}
                      />
                      <div className="absolute bottom-4 right-6 text-[9px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">Autosave Active</div>
                   </div>
                </div>

                {/* PASSENGER DETAILS */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14}/> Contact Details
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <DetailCard label="Email Address" value={selectedBooking.passengers?.[0]?.email || 'N/A'} icon={<Mail size={14}/>} />
                    <DetailCard label="Phone Number" value={selectedBooking.passengers?.[0]?.phone || 'N/A'} icon={<Phone size={14}/>} />
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- UI COMPONENTS ---
const NavItem = ({ icon, label, active = false }: any) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
);

const FilterBtn = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-[#0F172A] text-slate-500 border border-white/5 hover:border-white/20'
    }`}
  >
    {label}
  </button>
);

const DetailCard = ({ label, value, icon }: any) => (
  <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
    <div className="text-orange-500">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-white uppercase">{value}</p>
    </div>
  </div>
);