import { useEffect, useState } from 'react';
import { 
  Ticket, Plane, Calendar, Users, CheckCircle, XCircle, MapPin, 
  IndianRupee, ArrowRight, ShieldCheck, RefreshCcw, 
  Wallet, Clock, Phone, Mail, ChevronRight, AlertCircle, 
  Headphones, Info, ExternalLink, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TechnicalNotice from './TechnicalNotice';

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={20} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      {/* --- MOBILE HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 pt-12 pb-6 border-b border-slate-50">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Your Journey</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">My Bookings</h2>

            
          </div>
          <div className="flex flex-col items-end">
            
             <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black">
               {bookings.length} TRIPS
             </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-10">
        {/* --- TICKET CARDS --- */}
        {bookings.length > 0 ? (
          <div className="space-y-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="relative group active:scale-[0.98] transition-transform duration-200">
                {/* Background Shadow Glow */}
                <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-[3rem] -z-10" />
                
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                  
                  {/* Top Bar: Airline & Status */}
                  <div className="px-6 py-4 flex justify-between items-center border-b border-dashed border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                        <Zap size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Flight Number</p>
                        <p className="text-xs font-black text-slate-900">{booking.flight_number}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                      booking.status === 'confirmed' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {booking.status}
                    </div>
                  </div>

                  {/* Main Journey Section */}
                  <div className="p-6">
                    <div className="flex justify-between items-center relative mb-8 px-2">
                      <div className="flex-1">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{booking.origin}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Departure</p>
                      </div>

                      <div className="flex flex-col items-center justify-center px-4">
                        <div className="w-12 h-px bg-slate-200 relative mb-1">
                          <Plane size={12} className="absolute -top-1.5 right-0 text-indigo-600 rotate-90" />
                        </div>
                        <span className="text-[8px] font-black text-slate-300 uppercase">Non-Stop</span>
                      </div>

                      <div className="flex-1 text-right">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{booking.destination}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Arrival</p>
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50 p-4 rounded-3xl">
                         <div className="flex items-center gap-2 mb-1">
                            <Calendar size={12} className="text-indigo-600" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Date</span>
                         </div>
                         <p className="text-xs font-black text-slate-800">
                           {new Date(booking.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                         </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-3xl">
                         <div className="flex items-center gap-2 mb-1">
                            <Users size={12} className="text-indigo-600" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Travelers</span>
                         </div>
                         <p className="text-xs font-black text-slate-800">{booking.total_passengers} Pax</p>
                      </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="flex justify-between items-end pt-5 border-t border-slate-50">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-slate-900">₹</span>
                          <span className="text-xl font-black text-slate-900">{booking.total_price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking Ref</p>
                        <p className="text-[11px] font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                          {booking.booking_reference}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perforation Notches */}
                <div className="absolute left-[-10px] top-[60px] w-5 h-10 bg-[#FDFDFF] rounded-r-full border-y border-r border-slate-100" />
                <div className="absolute right-[-10px] top-[60px] w-5 h-10 bg-[#FDFDFF] rounded-l-full border-y border-l border-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-10 text-center border-2 border-dashed border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Ticket size={32} />
             </div>
             <p className="text-sm font-black text-slate-900">No trips booked yet</p>
             <p className="text-xs font-bold text-slate-400 mt-1">Your flight history will appear here.</p>
          </div>
        )}

        {/* --- REFUND POLICY (MOBILE TABS) --- */}
        <div className="space-y-5 pt-4">
           <div className="flex items-center gap-2 px-2">
              <RefreshCcw size={16} className="text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Refund Policy</h3>
           </div>

           <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Clock size={16} /></div>
                   <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                     Refunds are processed <span className="text-white font-black underline underline-offset-4 decoration-indigo-500">within 72 working hours</span> after receipt from the airline.
                   </p>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Wallet size={16} /></div>
                   <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                     All booking cancellations are credited to the <span className="text-indigo-400 font-black">UPI/Bank Transfer</span> and cannot be withdrawn to bank accounts.
                   </p>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><ShieldCheck size={16} /></div>
                   <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                     Failed payments/bookings are refunded to the original source within 7-10 working days.
                   </p>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Pro Tip</p>
                <p className="text-[10px] font-medium text-slate-400">Refunds to credit cards may take up to 72 working hours due to banking procedures.</p>
              </div>
           </div>
        </div>

        {/* --- CUSTOMER SUPPORT CARDS --- */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-2">
              <Headphones size={16} className="text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Support Center</h3>
           </div>

           <div className="grid grid-cols-1 gap-3">
              <a href="tel:9366159066" className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm active:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Phone size={22} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">24/7 Helpline</p>
                    <p className="text-base font-black text-slate-900 tracking-tight">+91 9366159066</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"><ChevronRight size={18} /></div>
              </a>

              <a href="mailto:tripurafly.helpdesk@gmail.com" className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm active:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600"><Mail size={22} /></div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Official Email</p>
                    <p className="text-xs font-black text-slate-900 truncate">tripurafly.helpdesk@gmail.com</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"><ChevronRight size={18} /></div>
              </a>
           </div>
        </div>

        {/* --- APP FOOTER --- */}
        <div className="py-10 text-center space-y-2">
           <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full">
              <ShieldCheck size={14} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Encrypted TripuraFly Portal</span>
           </div>
           <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em]">Designed for Seamless Travel</p>
        </div>
      </div>
    </div>
  );
}