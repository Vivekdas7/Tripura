import { useState, useEffect } from 'react';
import { 
  Users, Search, Calendar, Phone, ShieldCheck, 
  PlaneTakeoff, CheckCircle2, Clock, AlertCircle, RefreshCw,
  Mail, Ticket, Download, Filter, ChevronRight, X, 
  ArrowUpRight, IndianRupee, Hash, Briefcase
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- TYPES ---
interface Passenger {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  passport_number: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  status: string;
  total_price: number;
  total_passengers: number;
  fare_type: string;
  payment_id: string;
  created_at: string; // The "Booked On" Time
  passengers: Passenger[];
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    setErrorLog(null);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          passengers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setBookings(data as Booking[]);
      
    } catch (err: any) {
      console.error("Database Error:", err);
      setErrorLog(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  // --- LOGIC: ADVANCED FILTERING ---
  const filtered = bookings.filter(b => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      b.booking_reference?.toLowerCase().includes(search) ||
      b.airline?.toLowerCase().includes(search) ||
      b.passengers?.[0]?.first_name?.toLowerCase().includes(search) ||
      b.passengers?.[0]?.last_name?.toLowerCase().includes(search) ||
      b.payment_id?.toLowerCase().includes(search)
    );
    
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // --- UI: STATS CALCULATION ---
  const totalRevenue = filtered.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
  const confirmedCount = filtered.filter(b => b.status === 'confirmed').length;

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-ping absolute" />
        <RefreshCw className="text-blue-500 animate-spin relative z-10" size={40} />
      </div>
      <p className="text-slate-500 font-black text-[10px] tracking-[0.5em] uppercase mt-8 animate-pulse">Synchronizing Global Manifest</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pb-20 selection:bg-blue-500/30">
      
      {/* --- SIDE NAVIGATION BAR (SIMULATED) --- */}
      <div className="fixed left-0 top-0 h-full w-20 bg-[#0F172A] border-r border-slate-800 hidden xl:flex flex-col items-center py-8 gap-8 z-[60]">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <div className="flex flex-col gap-6 mt-10">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl cursor-pointer"><Users size={20} /></div>
          <div className="p-3 text-slate-500 hover:text-white transition-colors cursor-pointer"><Ticket size={20} /></div>
          <div className="p-3 text-slate-500 hover:text-white transition-colors cursor-pointer"><Briefcase size={20} /></div>
        </div>
      </div>

      {/* --- TOP HEADER --- */}
      <div className="bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 p-6 sticky top-0 z-50 ml-0 xl:ml-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              TripuraFly <span className="text-blue-500 italic font-medium text-lg">Commander</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Agartala Terminal Server Active</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                className="w-full sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="PNR, Passenger, Payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-2xl outline-none focus:border-blue-500 transition-all cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Logs</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 ml-0 xl:ml-20">
        
        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<IndianRupee />} color="text-emerald-500" />
          <StatCard title="Confirmed PNRs" value={confirmedCount} icon={<CheckCircle2 />} color="text-blue-500" />
          <StatCard title="Total Passengers" value={filtered.reduce((a, b) => a + b.total_passengers, 0)} icon={<Users />} color="text-orange-500" />
          <StatCard title="Today's Load" value={filtered.length} icon={<ArrowUpRight />} color="text-purple-500" />
        </div>

        {/* --- MAIN TABLE --- */}
        <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Live Booking Ledger</h3>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-xl transition-all border border-white/5">
              <Download size={14} /> Export Manifest
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="p-6">Lead Passenger</th>
                  <th className="p-6">Flight & Route</th>
                  <th className="p-6">Booking Date/Time</th>
                  <th className="p-6">Booking Ref</th>
                  <th className="p-6">Price</th>
                  <th className="p-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-500/[0.03] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-400 border border-white/5 shadow-inner">
                          {b.passengers?.[0]?.first_name?.charAt(0) || <Users size={16}/>}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                            {b.passengers?.[0]?.first_name} {b.passengers?.[0]?.last_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500">
                             <span className="flex items-center gap-1"><Mail size={10} /> {b.passengers?.[0]?.email?.substring(0, 15)}...</span>
                             {b.passengers?.[0]?.phone && <span className="flex items-center gap-1"><Phone size={10} /> {b.passengers[0].phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{b.airline}</p>
                      <div className="flex items-center gap-2 text-sm font-black text-white mt-1">
                        <span>{b.origin}</span>
                        <PlaneTakeoff size={12} className="text-slate-600" />
                        <span>{b.destination}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{b.flight_number}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-200">
                            {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] font-bold text-blue-500/80 italic">
                             Booked at: {new Date(b.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <Hash size={14} className="text-blue-500" />
                        {b.booking_reference}
                      </div>
                      <div className={`mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest w-fit px-2 py-0.5 rounded ${
                        b.status === 'confirmed' ? 'text-emerald-500' : 'text-orange-500'
                      }`}>
                        {b.status}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black text-white italic">₹{b.total_price?.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{b.fare_type}</p>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => setSelectedBooking(b)}
                        className="p-3 bg-slate-800 hover:bg-blue-600 rounded-xl text-slate-400 hover:text-white transition-all transform hover:scale-110"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- MODAL: PASSENGER MANIFEST --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={() => setSelectedBooking(null)} />
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-[3rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Flight Manifest</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-8">Ref: {selectedBooking.booking_reference}</p>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              {selectedBooking.passengers?.map((p, idx) => (
                <div key={idx} className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Users size={60} />
                  </div>
                  <p className="text-[10px] font-black text-blue-500 mb-2 uppercase">Passenger {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Name</p>
                      <p className="text-sm font-bold text-white">{p.first_name} {p.last_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Passport</p>
                      <p className="text-sm font-bold text-white">{p.passport_number || 'DOMESTIC / NONE'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Contact Information</p>
                      <p className="text-sm font-bold text-white">{p.email} • {p.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                Confirm Reservation
              </button>
              <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all">
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENT: STAT CARD ---
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-[#0F172A] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white tracking-tighter">{value}</h4>
    </div>
  );
}