import { useEffect, useState } from 'react';
import { 
  Ticket, Plane, Calendar, Users, CheckCircle, XCircle, MapPin, 
  IndianRupee, ArrowRight, ShieldCheck, RefreshCcw, 
  Wallet, Clock, Phone, Mail, ChevronRight, AlertCircle, 
  Headphones, Info, ExternalLink, Zap, Hash, QrCode
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type BookingWithFlight = {
  id: string;
  booking_reference: string;
  status: string;
  total_passengers: number;
  total_price: number;
  booking_date: string;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithFlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`id, booking_reference, status, total_passengers, total_price, booking_date, airline, flight_number, origin, destination, departure_time, arrival_time`)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={20} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* --- PREMIUM MOBILE HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-2xl px-6 pt-14 pb-6 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">My <span className="text-indigo-600">Trips</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {bookings.length} Active Manifests
            </p>
          </div>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Ticket size={22} />
          </div>
        </div>
      </div>

      <div className="px-5 mt-8 space-y-12">
        {/* --- BOARDING PASS LIST --- */}
        {bookings.length > 0 ? (
          <div className="space-y-10">
            {bookings.map((booking) => (
              <div key={booking.id} className="relative group overflow-visible">
                {/* BOARDING PASS CONTAINER */}
                <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                  
                  {/* Top Header Section */}
                  <div className={`px-6 py-4 flex justify-between items-center ${booking.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                        <Plane size={16} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest italic">{booking.airline}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">{booking.status}</span>
                    </div>
                  </div>

                  {/* Main Flight Info (Departure/Arrival) */}
                  <div className="p-7">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex-1">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{booking.origin}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Source</p>
                        <p className="text-sm font-black text-indigo-600 mt-2">{formatTime(booking.departure_time)}</p>
                      </div>

                      <div className="flex flex-col items-center justify-center px-4 pt-2">
                        <div className="flex items-center gap-2 opacity-20 mb-1">
                           <div className="w-1 h-1 rounded-full bg-slate-900" />
                           <div className="w-1 h-1 rounded-full bg-slate-900" />
                           <div className="w-1 h-1 rounded-full bg-slate-900" />
                        </div>
                        <Plane size={18} className="text-slate-300" />
                        <div className="flex items-center gap-2 opacity-20 mt-1">
                           <div className="w-1 h-1 rounded-full bg-slate-900" />
                           <div className="w-1 h-1 rounded-full bg-slate-900" />
                           <div className="w-1 h-1 rounded-full bg-slate-900" />
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{booking.destination}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Destination</p>
                        <p className="text-sm font-black text-indigo-600 mt-2">{formatTime(booking.arrival_time)}</p>
                      </div>
                    </div>

                    {/* Middle Info Grid */}
                    <div className="grid grid-cols-3 gap-2 py-5 border-y border-dashed border-slate-100">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Flight No.</p>
                          <p className="text-xs font-black text-slate-800">{booking.flight_number}</p>
                       </div>
                       <div className="space-y-1 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Date</p>
                          <p className="text-xs font-black text-slate-800">{new Date(booking.departure_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                       </div>
                       <div className="space-y-1 text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Pax</p>
                          <p className="text-xs font-black text-slate-800">0{booking.total_passengers} Adults</p>
                       </div>
                    </div>

                    {/* Bottom Barcode Style Ref */}
                    <div className="mt-6 flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-xl">
                             <QrCode size={24} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">PNR / Reference</p>
                            <p className="text-sm font-black text-slate-900 tracking-widest">{booking.booking_reference}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount Paid</p>
                          <p className="text-lg font-black text-slate-900">₹{booking.total_price.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Perforation Aesthetic Notches */}
                <div className="absolute left-[-10px] bottom-[110px] w-5 h-10 bg-[#F8FAFC] rounded-r-full border border-slate-100 shadow-inner z-10" />
                <div className="absolute right-[-10px] bottom-[110px] w-5 h-10 bg-[#F8FAFC] rounded-l-full border border-slate-100 shadow-inner z-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                <Plane size={40} />
             </div>
             <p className="text-lg font-black text-slate-900 italic uppercase">Clear Skies</p>
             <p className="text-xs font-bold text-slate-400 mt-2 max-w-[200px] mx-auto leading-relaxed">You don't have any upcoming trips at the moment.</p>
          </div>
        )}

        {/* --- AIRLINE POLICY SECTION --- */}
        <div className="space-y-6 pt-8">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={18} className="text-indigo-600" />
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Flight Policies</h3>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-8 space-y-8">
                {/* Cancellation Policy */}
                <div className="flex gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 text-rose-500"><XCircle size={24} /></div>
                   <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Cancellations</p>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                        Cancellations must be made at least <span className="text-rose-600">4 hours prior</span> to domestic flight departure. Standard airline fees + TripFly convenience fee applies.
                      </p>
                   </div>
                </div>

                {/* Refund Policy */}
                <div className="flex gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600"><RefreshCcw size={24} /></div>
                   <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Refund Timeline</p>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                        Refunds are credited to the <span className="text-amber-600">original source account</span> within 72 working hours after airline processing. No wallet conversions.
                      </p>
                   </div>
                </div>

                {/* No Show Policy */}
                <div className="flex gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 text-white"><Clock size={24} /></div>
                   <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">No-Show Terms</p>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                        Failure to check-in or board results in 100% forfeiture of the ticket fare. Only statutory taxes may be refundable.
                      </p>
                   </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-8 py-5 border-t border-slate-100">
                <div className="flex items-center gap-3">
                   <AlertCircle size={14} className="text-indigo-600" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Subject to Airline Specific Conditions</p>
                </div>
              </div>
           </div>
        </div>

        {/* --- CUSTOMER CARE TABS --- */}
        <div className="grid grid-cols-1 gap-4 pt-4">
           <a href="tel:9366159066" className="flex items-center gap-5 p-6 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100 active:scale-95 transition-all">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md"><Phone size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Instant Support</p>
                <p className="text-lg font-black text-white italic tracking-tight">+91 9366159066</p>
              </div>
              <ChevronRight size={20} className="text-white/40 ml-auto" />
           </a>

           <a href="mailto:tripurafly.helpdesk@gmail.com" className="flex items-center gap-5 p-6 bg-white border border-slate-200 rounded-[2rem] active:bg-slate-50 transition-all">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900"><Mail size={24} /></div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Helpdesk</p>
                <p className="text-xs font-black text-slate-900 truncate">tripurafly.helpdesk@gmail.com</p>
              </div>
           </a>
        </div>

        {/* --- FOOTER --- */}
        <div className="py-12 text-center">
           <div className="inline-flex items-center gap-2 grayscale opacity-40 mb-4">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">TripuraFly Secure</span>
           </div>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Version 2.0.4 Alpha</p>
        </div>
      </div>
    </div>
  );
}