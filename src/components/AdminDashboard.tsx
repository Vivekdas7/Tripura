import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Calendar, Phone, ShieldCheck, Menu,
  PlaneTakeoff, CheckCircle2, Clock, AlertCircle, RefreshCw,
  Mail, Ticket, Download, Filter, ChevronRight, X, 
  ArrowUpRight, IndianRupee, Hash, Plane, LayoutDashboard,
  ExternalLink, Bell, Settings, CheckSquare, Square, Save, MessageSquare,
  UserCheck, CreditCard, MapPin, Info, Wallet // Added Wallet icon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- UPDATED INTERFACES ---
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
  status: string; // Will now handle 'pending_verification'
  total_price: number;
  total_passengers: number;
  created_at: string;
  is_fulfilled: boolean; 
  internal_note: string;
  payment_id?: string; // Added field for manual payment ref
  passengers: Passenger[];
}

export default function MobileAdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // UPDATED: Added "awaiting_payment" filter
  const [filterStatus, setFilterStatus] = useState<"all" | "pending_action" | "fulfilled" | "awaiting_payment">("all");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          passengers (
            first_name,
            last_name,
            email,
            phone
          )
        `)
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

  // UPDATED: Toggle status to 'confirmed' when fulfilled
  const toggleFulfillment = async (id: string, currentState: boolean) => {
    const newStatus = !currentState ? 'confirmed' : 'pending_verification';
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        is_fulfilled: !currentState,
        status: newStatus 
      })
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
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-orange-500/30">
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Plane className="text-white" size={16} />
          </div>
          <span className="font-black italic text-white tracking-tighter text-lg">TRIPURA<span className="text-orange-500">FLY</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className={`p-2 text-slate-400 ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={20} />
          </button>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400"><Menu /></button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#0F172A] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-xl">
                <Plane size={20} className="text-white"/>
              </div>
              <div>
                <span className="font-black text-white italic block leading-none">ADMIN</span>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Portal v2.0</span>
              </div>
            </div>
            <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
          </div>
          
          <nav className="space-y-1.5 flex-1">
            <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active />
            <NavItem icon={<Users size={18}/>} label="Passenger Manifest" />
            <NavItem icon={<Bell size={18}/>} label="System Alerts" count={bookings.filter(b => b.status === 'pending_verification').length} />
            <NavItem icon={<CreditCard size={18}/>} label="Payments" />
            <div className="pt-4 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-4">Management</div>
            <NavItem icon={<Settings size={18}/>} label="Portal Settings" />
          </nav>

          <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 mt-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Server Status</p>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
            <p className="text-xs font-bold text-slate-300 italic">TripuraFly-Cloud-Alpha</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          
          {/* WELCOME SECTION */}
          <section className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">Control <span className="text-orange-500">Center</span></h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                <Clock size={12} className="text-orange-500" /> Operational Overview — {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric'})}
              </p>
            </div>
            <div className="flex gap-3">
               <StatBox label="Verify" value={bookings.filter(b => b.status === 'pending_verification').length} color="text-amber-500" />
               <StatBox label="Active" value={bookings.filter(b => !b.is_fulfilled).length} color="text-orange-500" />
               <StatBox label="Done" value={bookings.filter(b => b.is_fulfilled).length} color="text-emerald-500" />
            </div>
          </section>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input 
                className="w-full bg-[#0F172A] border border-white/10 rounded-[1.5rem] py-5 pl-12 pr-4 text-sm font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-slate-600"
                placeholder="Search by PNR or Passenger Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 p-1.5 bg-[#0F172A] rounded-[1.5rem] border border-white/5 overflow-x-auto no-scrollbar">
              <FilterBtn active={filterStatus === 'all'} label="All" onClick={() => setFilterStatus('all')} />
              <FilterBtn active={filterStatus === 'awaiting_payment'} label="Verify Pay" onClick={() => setFilterStatus('awaiting_payment')} />
              <FilterBtn active={filterStatus === 'pending_action'} label="To Issue" onClick={() => setFilterStatus('pending_action')} />
              <FilterBtn active={filterStatus === 'fulfilled'} label="Done" onClick={() => setFilterStatus('fulfilled')} />
            </div>
          </div>

          {/* LIST VIEW */}
          <div className="space-y-4 relative">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 w-full bg-[#0F172A] animate-pulse rounded-3xl border border-white/5" />)}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-20 text-center bg-[#0F172A] rounded-[3rem] border border-dashed border-white/10">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Search size={32} />
                </div>
                <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">No manifests found</h3>
                <p className="text-slate-500 text-xs font-bold mt-2">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:grid grid-cols-5 px-8 py-4 text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">
                  <div>Status</div>
                  <div>Primary Passenger</div>
                  <div>Flight Route</div>
                  <div>Request Date</div>
                  <div className="text-right">Management</div>
                </div>

                {filteredData.map((b) => {
                  const p = b.passengers?.[0]; 
                  return (
                    <div 
                      key={b.id} 
                      className={`group grid grid-cols-1 lg:grid-cols-5 items-center p-6 rounded-[2.5rem] border transition-all duration-500 ${
                        b.is_fulfilled 
                          ? 'bg-emerald-500/[0.02] border-emerald-500/10 hover:border-emerald-500/30' 
                          : b.status === 'pending_verification' 
                            ? 'bg-amber-500/[0.02] border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                            : 'bg-[#0F172A] border-white/5 hover:border-orange-500/30 hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center justify-between lg:block mb-6 lg:mb-0">
                        <button 
                          onClick={() => toggleFulfillment(b.id, b.is_fulfilled)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            b.is_fulfilled 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                              : b.status === 'pending_verification'
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 animate-pulse'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {b.is_fulfilled ? <CheckSquare size={14}/> : b.status === 'pending_verification' ? <Wallet size={14}/> : <Square size={14}/>}
                          {b.is_fulfilled ? 'Booked' : b.status === 'pending_verification' ? 'Check Pay' : 'Pending'}
                        </button>
                        <span className="lg:hidden text-[10px] font-black text-slate-600">#{b.booking_reference}</span>
                      </div>

                      {/* Passenger Profile */}
                      <div className="mb-6 lg:mb-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-xs font-black ${b.status === 'pending_verification' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-orange-500'}`}>
                            {p ? p.first_name[0] : '?'}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">
                              {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Hash size={10} className="text-orange-500" />
                              <span className="text-[10px] text-slate-500 font-bold uppercase">{b.booking_reference}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flight Route */}
                      <div className="mb-6 lg:mb-0">
                        <div className="flex items-center gap-3 text-xs font-black text-white italic">
                          <span className="text-slate-400">{b.origin}</span>
                          <div className="flex flex-col items-center">
                             <Plane size={10} className="text-orange-500 rotate-90" />
                             <div className="w-8 h-[1px] bg-slate-800" />
                          </div>
                          <span className="text-indigo-400">{b.destination}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-black mt-1.5 uppercase tracking-tighter">{b.airline} — {b.flight_number}</p>
                      </div>

                      {/* Timestamp */}
                      <div className="hidden lg:block">
                        <p className="text-xs font-bold text-slate-400">{new Date(b.created_at).toLocaleDateString('en-GB')}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">{new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>

                      {/* Action */}
                      <div className="flex justify-end gap-2">
                         <button 
                          onClick={() => setSelectedBooking(b)}
                          className={`flex-1 lg:flex-none h-12 px-6 lg:w-12 lg:px-0 rounded-2xl flex items-center justify-center transition-all border ${b.status === 'pending_verification' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-orange-600 hover:text-white'}`}
                         >
                           <span className="lg:hidden text-xs font-black uppercase tracking-widest mr-3">Manage Manifest</span>
                           <ChevronRight size={18}/>
                         </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </main>

      {/* DETAIL DRAWER */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-lg bg-[#0F172A] h-full flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500">
             
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/30">
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Manifest Details</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-[0.2em]">Ref ID: {selectedBooking.booking_reference}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="w-12 h-12 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"><X size={20}/></button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                
                {/* Fulfillment Control */}
                <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${selectedBooking.status === 'pending_verification' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-gradient-to-br from-slate-900 to-slate-950 border-white/5'}`}>
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      {selectedBooking.status === 'pending_verification' ? <Wallet size={80} className="text-amber-500" /> : <ShieldCheck size={80} className="text-orange-500" />}
                   </div>
                   <div className="relative z-10">
                     <p className={`text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2 ${selectedBooking.status === 'pending_verification' ? 'text-amber-500' : 'text-orange-500'}`}>
                       {selectedBooking.status === 'pending_verification' ? <Wallet size={14}/> : <ShieldCheck size={14}/>} 
                       {selectedBooking.status === 'pending_verification' ? 'Awaiting Payment' : 'Booking Fulfillment'}
                     </p>
                     <h4 className="text-white text-lg font-black italic mb-2 tracking-tight">
                        {selectedBooking.status === 'pending_verification' ? 'Verify UPI/Bank Credit' : 'External Verification'}
                     </h4>
                     <p className="text-xs text-slate-500 mb-8 font-bold leading-relaxed max-w-[80%]">
                       {selectedBooking.status === 'pending_verification' 
                        ? 'Check your business account for a credit matching the amount below. Once confirmed, finalize to issue ticket.'
                        : 'By toggling this, you confirm that tickets have been issued via the airline portal.'}
                     </p>
                     
                     <button 
                      onClick={() => toggleFulfillment(selectedBooking.id, selectedBooking.is_fulfilled)}
                      className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                        selectedBooking.is_fulfilled 
                          ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30' 
                          : selectedBooking.status === 'pending_verification'
                            ? 'bg-amber-500 text-black shadow-2xl shadow-amber-500/20'
                            : 'bg-orange-600 text-white shadow-2xl shadow-orange-600/30'
                      }`}
                     >
                       {selectedBooking.is_fulfilled ? <UserCheck size={18}/> : <Clock size={18}/>}
                       {selectedBooking.is_fulfilled ? 'BOOKING FINALIZED' : 'VERIFY & ISSUE TICKET'}
                     </button>
                   </div>
                </div>

                {/* Passenger Contact Info */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14}/> Passenger Manifest ({selectedBooking.passengers?.length || 0})
                  </p>
                  
                  {selectedBooking.passengers && selectedBooking.passengers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedBooking.passengers.map((pass, idx) => (
                        <div key={idx} className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                           <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                              <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center font-black">{pass.first_name[0]}</div>
                              <div>
                                <p className="text-sm font-black text-white uppercase italic">{pass.first_name} {pass.last_name}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Traveller {idx + 1}</p>
                              </div>
                           </div>
                           <DetailItem icon={<Mail size={14}/>} label="Email Address" value={pass.email} />
                           <DetailItem icon={<Phone size={14}/>} label="Contact (WhatsApp)" value={pass.phone || 'Not Provided'} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
                      <AlertCircle size={20} className="text-red-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-red-500">Error: No passenger data fetched from DB.</p>
                    </div>
                  )}
                </div>

                {/* Flight Route Details */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14}/> Itinerary Information
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Origin</p>
                      <p className="text-lg font-black text-white italic">{selectedBooking.origin}</p>
                    </div>
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Destination</p>
                      <p className="text-lg font-black text-indigo-400 italic">{selectedBooking.destination}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Carrier</p>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">{selectedBooking.airline} - {selectedBooking.flight_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Payment Amount</p>
                      <p className="text-xs font-black text-emerald-500 underline decoration-emerald-500/30 underline-offset-4">₹{selectedBooking.total_price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Internal Notes Section */}
                <div className="pb-10">
                   <p className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                     <MessageSquare size={14}/> Admin Internal Remarks
                   </p>
                   <div className="relative group">
                      <textarea 
                        className="w-full bg-slate-950 border border-white/10 rounded-[2rem] p-8 text-sm text-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none h-44 transition-all resize-none shadow-inner placeholder:text-slate-700"
                        placeholder="Log internal details here (e.g., 'Payment received on Google Pay @ 2:30 PM')..."
                        defaultValue={selectedBooking.internal_note}
                        onBlur={(e) => updateInternalNote(selectedBooking.id, e.target.value)}
                      />
                      <div className="absolute bottom-6 left-8 flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Live Autosave
                      </div>
                   </div>
                </div>

             </div>
          </div>
        </div>
      )}

      <div className="h-20 lg:hidden" />
    </div>
  );
}

// --- SUB-COMPONENTS (Keep the same) ---
const NavItem = ({ icon, label, active = false, count = 0 }: any) => (
  <button className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${active ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
    <div className="flex items-center gap-3">{icon}<span className={active ? 'italic font-black tracking-tight' : ''}>{label}</span></div>
    {count > 0 && <span className="w-5 h-5 bg-amber-500 text-black text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg">{count}</span>}
  </button>
);

const FilterBtn = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`whitespace-nowrap px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${active ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30 translate-y-[-2px]' : 'text-slate-500 hover:text-slate-300'}`}>{label}</button>
);

const StatBox = ({ label, value, color }: any) => (
  <div className="bg-[#0F172A] border border-white/5 px-6 py-3 rounded-2xl min-w-[100px] shadow-sm">
    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xl font-black italic ${color}`}>{value}</p>
  </div>
);

const DetailItem = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-4">
    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">{label}</p>
      <p className="text-xs font-bold text-white truncate lowercase">{value}</p>
    </div>
  </div>
);