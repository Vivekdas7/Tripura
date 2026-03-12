import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Calendar, Phone, ShieldCheck, Menu,
  PlaneTakeoff, CheckCircle2, Clock, AlertCircle, RefreshCw,
  Mail, Ticket, Download, Filter, ChevronRight, X, Trash2,
  ArrowUpRight, IndianRupee, Hash, Plane, LayoutDashboard,
  ExternalLink, Bell, Settings, CheckSquare, Square, Save, MessageSquare,
  UserCheck, CreditCard, MapPin, Info, Wallet, CalendarDays
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- INTERFACES ---
interface Passenger {
  id?: string;
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
  departure_time: string; // Ensure this matches your Supabase column
  status: string;
  total_price: number;
  total_passengers: number;
  created_at: string;
  is_fulfilled: boolean; 
  internal_note: string;
  payment_id?: string;
  passengers: Passenger[];
}

export default function MobileAdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending_action" | "fulfilled" | "awaiting_payment">("all");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'flight' | 'finance'>('dashboard');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`*, passengers (first_name, last_name, email, phone)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setBookings(data as Booking[]);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleFulfillment = async (id: string, currentState: boolean) => {
    const newStatus = !currentState ? 'confirmed' : 'pending_verification';
    const { error } = await supabase
      .from('bookings')
      .update({ is_fulfilled: !currentState, status: newStatus })
      .eq('id', id);

    if (!error) {
      const updated = bookings.map(b => b.id === id ? { ...b, is_fulfilled: !currentState, status: newStatus } : b);
      setBookings(updated);
      if (selectedBooking?.id === id) {
        setSelectedBooking({...selectedBooking, is_fulfilled: !currentState, status: newStatus});
      }
    }
  };

  // --- DELETE OPERATION ---
  const handleDeleteBooking = async (id: string) => {
    try {
      // Supabase RLS and Foreign Keys: Ensure 'passengers' are deleted or set to cascade
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookings(bookings.filter(b => b.id !== id));
      setSelectedBooking(null);
      setDeleteConfirm(null);
    } catch (err) {
      alert("Error deleting booking. Check database permissions.");
      console.error(err);
    }
  };

  const updateInternalNote = async (id: string, note: string) => {
    await supabase.from('bookings').update({ internal_note: note }).eq('id', id);
    setBookings(bookings.map(b => b.id === id ? { ...b, internal_note: note } : b));
  };

  const filteredData = useMemo(() => {
    return bookings.filter(b => {
      const passenger = b.passengers?.[0];
      const fullName = passenger ? `${passenger.first_name} ${passenger.last_name}`.toLowerCase() : "";
      const pnr = b.booking_reference?.toLowerCase() || "";
      const matchesSearch = pnr.includes(searchTerm.toLowerCase()) || fullName.includes(searchTerm.toLowerCase());
      if (filterStatus === "pending_action") return matchesSearch && !b.is_fulfilled;
      if (filterStatus === "fulfilled") return matchesSearch && b.is_fulfilled;
      if (filterStatus === "awaiting_payment") return matchesSearch && b.status === 'pending_verification';
      return matchesSearch;
    });
  }, [bookings, searchTerm, filterStatus]);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <LayoutDashboard size={16} className="text-white"/>
          </div>
          <span className="font-black uppercase tracking-tighter text-sm">CloudCommand</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleRefresh} className={`p-2 text-slate-500 rounded-full ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={20} />
          </button>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 rounded-full">
            <Menu size={24}/>
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <LayoutDashboard size={20} className="text-white"/>
              </div>
              <h1 className="font-bold text-slate-900 text-lg">Admin Panel</h1>
            </div>
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
          </div>
          
          <nav className="space-y-1 flex-1">
            <NavItem 
              icon={<LayoutDashboard size={18}/>} 
              label="Overview" 
              active={currentView === 'dashboard'} 
              onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<Plane size={18}/>} 
              label="Flight Details" 
              active={currentView === 'flight'} 
              onClick={() => { setCurrentView('flight'); setSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<Bell size={18}/>} 
              label="Alerts" 
              count={bookings.filter(b => b.status === 'pending_verification').length} 
              onClick={() => { setFilterStatus('awaiting_payment'); setCurrentView('dashboard'); setSidebarOpen(false); }}
            />
          </nav>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Node</p>
            </div>
            <p className="text-[11px] font-bold text-white">Tripura-IN-Hub</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER */}
          <section className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-blue-600 font-black text-[10px] mb-1 uppercase tracking-[0.2em]">Operational Dashboard</p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Booking <span className="text-slate-300 not-italic">Engine</span></h1>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
               <StatBox label="Awaiting Pay" value={bookings.filter(b => b.status === 'pending_verification').length} type="warning" />
               <StatBox label="To Issue" value={bookings.filter(b => !b.is_fulfilled).length} type="active" />
               <StatBox label="Fulfilled" value={bookings.filter(b => b.is_fulfilled).length} type="success" />
            </div>
          </section>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 outline-none shadow-sm"
                placeholder="Search PNR or Traveler Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1 p-1 bg-white rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar shadow-sm">
              <FilterBtn active={filterStatus === 'all'} label="All" onClick={() => setFilterStatus('all')} />
              <FilterBtn active={filterStatus === 'awaiting_payment'} label="Payments" onClick={() => setFilterStatus('awaiting_payment')} />
              <FilterBtn active={filterStatus === 'pending_action'} label="Pending" onClick={() => setFilterStatus('pending_action')} />
              <FilterBtn active={filterStatus === 'fulfilled'} label="Closed" onClick={() => setFilterStatus('fulfilled')} />
            </div>
          </div>

          {/* BOOKING LIST */}
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              filteredData.map((b) => {
                const p = b.passengers?.[0]; 
                return (
                  <div 
                    key={b.id} 
                    onClick={() => setSelectedBooking(b)}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                  >
                    {b.status === 'pending_verification' && (
                       <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 animate-pulse" />
                    )}

                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        b.is_fulfilled ? 'bg-emerald-50 text-emerald-600' : 
                        b.status === 'pending_verification' ? 'bg-amber-50 text-amber-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {b.is_fulfilled ? <CheckCircle2 size={24}/> : b.status === 'pending_verification' ? <Wallet size={24}/> : <Clock size={24}/>}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-black text-slate-900 truncate uppercase">
                            {p ? `${p.first_name} ${p.last_name}` : 'No Name'}
                          </h3>
                          <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">REF: {b.booking_reference}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          <span className="flex items-center gap-1 text-slate-600">{b.origin} → {b.destination}</span>
                          <span>•</span>
                          <span className="text-blue-600 flex items-center gap-1">
                            <CalendarDays size={10} /> {formatDateTime(b.departure_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                      <div className="text-left md:text-right">
                        <p className="text-xs font-black text-slate-900">₹{b.total_price.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{b.airline}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setDeleteConfirm(b.id); }}
                           className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                         >
                            <Trash2 size={18} />
                         </button>
                         <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION OVERLAY */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic">Confirm Deletion?</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">This will permanently remove the booking and all associated passenger data. This action cannot be undone.</p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button onClick={() => setDeleteConfirm(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                <button onClick={() => handleDeleteBooking(deleteConfirm)} className="py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-rose-200">Delete Now</button>
              </div>
           </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-xl bg-white h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[3rem] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
             
             <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Manifest Details</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PNR: {selectedBooking.booking_reference}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center"><X size={20}/></button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar pb-32">
                
                {/* Control Action Card */}
                <div className={`p-6 rounded-[2.5rem] border-2 shadow-sm ${
                  selectedBooking.is_fulfilled ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
                }`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${selectedBooking.is_fulfilled ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                      {selectedBooking.is_fulfilled ? <CheckSquare size={24}/> : <ShieldCheck size={24}/>}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-black text-slate-900 text-sm uppercase">Fulfillment Desk</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">
                        Manual Verification of payment and carrier ticketing status.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleFulfillment(selectedBooking.id, selectedBooking.is_fulfilled)}
                    className={`w-full py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all shadow-xl active:scale-95 ${
                      selectedBooking.is_fulfilled 
                        ? 'bg-white text-emerald-600 border-2 border-emerald-100' 
                        : 'bg-slate-900 text-white hover:bg-black'
                    }`}
                  >
                    {selectedBooking.is_fulfilled ? 'REVOKE CONFIRMATION' : 'ISSUE TICKET (FULFILL)'}
                  </button>
                </div>

                {/* Itinerary Summary */}
                <div className="space-y-4">
                  <SectionTitle icon={<Plane size={14}/>} title="Itinerary Information" />
                  <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden">
                     <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                           <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Origin</p>
                           <h3 className="text-3xl font-black italic">{selectedBooking.origin}</h3>
                        </div>
                        <Plane size={24} className="text-blue-500/30 rotate-90" />
                        <div className="text-right">
                           <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Destination</p>
                           <h3 className="text-3xl font-black italic">{selectedBooking.destination}</h3>
                        </div>
                     </div>
                     <div className="flex justify-between items-end relative z-10">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                           <Calendar size={14} className="text-blue-400"/>
                           <span className="text-[10px] font-black uppercase">{formatDateTime(selectedBooking.departure_time)}</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black uppercase text-blue-400 tracking-tighter">{selectedBooking.airline}</p>
                           <p className="text-xs font-bold">{selectedBooking.flight_number}</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                   <DetailCard label="Grand Total" value={`₹${selectedBooking.total_price.toLocaleString()}`} highlight />
                   <DetailCard label="Created On" value={new Date(selectedBooking.created_at).toLocaleDateString()} />
                </div>

                {/* Passengers */}
                <div className="space-y-4">
                  <SectionTitle icon={<Users size={14}/>} title="Passenger List" />
                  {selectedBooking.passengers.map((pass, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-slate-50 border-2 border-white text-slate-900 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm italic">{pass.first_name[0]}</div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{pass.first_name} {pass.last_name}</p>
                        <div className="flex flex-col mt-1 gap-1">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Mail size={12} className="text-blue-500"/> {pass.email}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Phone size={12} className="text-emerald-500"/> {pass.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Internal Notes */}
                <div className="space-y-3 pb-12">
                  <SectionTitle icon={<MessageSquare size={14}/>} title="Internal Admin Ops" />
                  <textarea 
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] p-5 text-[11px] font-bold focus:bg-white focus:border-blue-600 outline-none h-32 transition-all resize-none shadow-inner uppercase placeholder:italic"
                    placeholder="Log admin actions or ticketing notes here..."
                    defaultValue={selectedBooking.internal_note}
                    onBlur={(e) => updateInternalNote(selectedBooking.id, e.target.value)}
                  />
                  <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Persistence Enabled • Auto-Sync
                  </div>
                </div>

                {/* DANGER ZONE */}
                <div className="pt-6 border-t border-slate-100">
                   <button 
                     onClick={() => setDeleteConfirm(selectedBooking.id)}
                     className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-rose-100"
                   >
                     Destroy Record
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
const NavItem = ({ icon, label, active = false, count = 0, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
    <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
    {count > 0 && <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-lg">{count}</span>}
  </button>
);

const FilterBtn = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>{label}</button>
);

const StatBox = ({ label, value, type }: { label: string, value: number, type: 'active' | 'success' | 'warning' }) => {
  const styles = {
    active: 'text-blue-600 bg-blue-50 border-blue-100',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100 shadow-amber-100/50'
  };
  return (
    <div className={`px-5 py-3.5 rounded-[1.5rem] border shadow-sm min-w-[110px] ${styles[type]}`}>
      <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">{label}</p>
      <p className="text-xl font-black italic">{value}</p>
    </div>
  );
};

const SectionTitle = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 px-2">
    {icon} <span>{title}</span>
  </div>
);

const DetailCard = ({ label, value, highlight = false }: any) => (
  <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xs font-black ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</p>
  </div>
);