import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Calendar, Phone, ShieldCheck, Menu,
  PlaneTakeoff, CheckCircle2, Clock, AlertCircle, RefreshCw,
  Mail, Ticket, Download, Filter, ChevronRight, X, 
  ArrowUpRight, IndianRupee, Hash, Plane, LayoutDashboard,
  ExternalLink, Bell, Settings, CheckSquare, Square, Save, MessageSquare,
  UserCheck, CreditCard, MapPin, Info, Wallet 
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
  departure_time: string;
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      {/* MOBILE HEADER - CLEAN WHITE */}
      <header className="lg:hidden flex items-center justify-end px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        
        <div className="flex item gap-1">
          <button onClick={handleRefresh} className={`p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={20} />
          </button>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Menu size={24}/>
          </button>
        </div>
      </header>

      {/* SIDEBAR - CLEAN LIGHT */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <LayoutDashboard size={20} className="text-white"/>
              </div>
              <h1 className="font-bold text-slate-900 text-lg">Admin Panel</h1>
            </div>
            <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-full" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
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
    label="Notifications" 
    count={bookings.filter(b => b.status === 'pending_verification').length} 
    onClick={() => { setFilterStatus('awaiting_payment'); setCurrentView('dashboard'); setSidebarOpen(false); }}
  />

  <NavItem 
    icon={<CreditCard size={18}/>} 
    label="Finance" 
    active={currentView === 'finance'} 
    onClick={() => { setCurrentView('finance'); setSidebarOpen(false); }} 
  />
</nav>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Server Operational</p>
            </div>
            <p className="text-xs font-medium text-slate-400">Node: Tripura-IN-01</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* WELCOME SECTION */}
          <section className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-blue-600 font-bold text-sm mb-1 uppercase tracking-widest">Dashboard Overview</p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Cloud <span className="text-slate-400 font-medium italic">Command</span></h1>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
               <StatBox label="Awaiting Pay" value={bookings.filter(b => b.status === 'pending_verification').length} type="warning" />
               <StatBox label="Pending Issue" value={bookings.filter(b => !b.is_fulfilled).length} type="active" />
               <StatBox label="Fulfilled" value={bookings.filter(b => b.is_fulfilled).length} type="success" />
            </div>
          </section>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none placeholder:text-slate-400 shadow-sm"
                placeholder="Search PNR or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1 p-1 bg-white rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar shadow-sm">
              <FilterBtn active={filterStatus === 'all'} label="All" onClick={() => setFilterStatus('all')} />
              <FilterBtn active={filterStatus === 'awaiting_payment'} label="Verify Pay" onClick={() => setFilterStatus('awaiting_payment')} />
              <FilterBtn active={filterStatus === 'pending_action'} label="To Issue" onClick={() => setFilterStatus('pending_action')} />
              <FilterBtn active={filterStatus === 'fulfilled'} label="Done" onClick={() => setFilterStatus('fulfilled')} />
            </div>
          </div>

          {/* LIST VIEW */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-28 w-full bg-white animate-pulse rounded-2xl border border-slate-200" />)}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Search size={40} className="text-slate-200 mx-auto mb-4" />
                <h3 className="text-slate-900 font-bold text-xl">No Records Found</h3>
                <p className="text-slate-400 text-sm mt-1">Try changing your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredData.map((b) => {
                  const p = b.passengers?.[0]; 
                  return (
                    <div 
                      key={b.id} 
                      onClick={() => setSelectedBooking(b)}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          b.is_fulfilled ? 'bg-emerald-50 text-emerald-600' : 
                          b.status === 'pending_verification' ? 'bg-amber-50 text-amber-600 animate-pulse' : 
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {b.is_fulfilled ? <CheckCircle2 size={24}/> : b.status === 'pending_verification' ? <Wallet size={24}/> : <Clock size={24}/>}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-[15px] font-bold text-slate-900 truncate uppercase tracking-tight">
                              {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">#{b.booking_reference}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1 font-bold text-slate-700">{b.origin} <Plane size={10} className="text-slate-300"/> {b.destination}</span>
                            <span>•</span>
                            <span className="uppercase">{b.airline} {b.flight_number}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <p className="text-xs font-bold text-slate-900">₹{b.total_price.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase">{new Date(b.created_at).toLocaleDateString('en-GB')}</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DETAIL MODAL - MOBILE FRIENDLY BOTTOM SHEET STYLE ON MOBILE */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-xl bg-white h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
             
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manifest Details</h2>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Ref: {selectedBooking.booking_reference}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors"><X size={20}/></button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                
                {/* Fulfillment Action Card */}
                <div className={`p-6 rounded-2xl border shadow-sm ${
                  selectedBooking.is_fulfilled ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
                }`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedBooking.is_fulfilled ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                      {selectedBooking.is_fulfilled ? <CheckSquare size={20}/> : <ShieldCheck size={20}/>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-base">Issue Ticket Control</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                        Confirm if the payment is received and the ticket is issued in the carrier portal.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleFulfillment(selectedBooking.id, selectedBooking.is_fulfilled)}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                      selectedBooking.is_fulfilled 
                        ? 'bg-white text-emerald-600 border border-emerald-200' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {selectedBooking.is_fulfilled ? 'REVERT TO PENDING' : 'MARK AS ISSUED (DONE)'}
                  </button>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <SectionTitle icon={<Users size={16}/>} title="Passenger Details" />
                    {selectedBooking.passengers.map((pass, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">{pass.first_name[0]}</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{pass.first_name} {pass.last_name}</p>
                          <div className="flex flex-col mt-1 space-y-1">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1"><Mail size={12}/> {pass.email}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1"><Phone size={12}/> {pass.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={<Plane size={16}/>} title="Itinerary Details" />
                    <div className="grid grid-cols-2 gap-3">
                      <DetailCard label="Route" value={`${selectedBooking.origin} → ${selectedBooking.destination}`} />
                      <DetailCard label="Flight" value={`${selectedBooking.airline} ${selectedBooking.flight_number}`} />
                      <DetailCard label="Price" value={`₹${selectedBooking.total_price.toLocaleString()}`} highlight />
                      <DetailCard label="Date" value={new Date(selectedBooking.created_at).toLocaleDateString()} />
                    </div>
                  </div>

                  <div className="space-y-3 pb-8">
                    <SectionTitle icon={<MessageSquare size={16}/>} title="Internal Admin Remarks" />
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none h-32 transition-all resize-none shadow-inner"
                      placeholder="Type admin notes here..."
                      defaultValue={selectedBooking.internal_note}
                      onBlur={(e) => updateInternalNote(selectedBooking.id, e.target.value)}
                    />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Changes saved automatically
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CLEAN UI SUB-COMPONENTS ---
const NavItem = ({ icon, label, active = false, count = 0 }: any) => (
  <button className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
    <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
    {count > 0 && <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg">{count}</span>}
  </button>
);

const FilterBtn = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>{label}</button>
);

const StatBox = ({ label, value, type }: { label: string, value: number, type: 'active' | 'success' | 'warning' }) => {
  const styles = {
    active: 'text-blue-600 bg-blue-50 border-blue-100',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100'
  };
  return (
    <div className={`px-5 py-3 rounded-2xl border shadow-sm min-w-[120px] ${styles[type]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">{label}</p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  );
};

const SectionTitle = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-1">
    {icon} <span>{title}</span>
  </div>
);

const DetailCard = ({ label, value, highlight = false }: any) => (
  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-bold ${highlight ? 'text-blue-600' : 'text-slate-700'}`}>{value}</p>
  </div>
);