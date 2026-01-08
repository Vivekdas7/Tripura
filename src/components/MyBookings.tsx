import { useEffect, useState } from 'react';
import { Ticket, Plane, Calendar, Users, CheckCircle, XCircle, MapPin, IndianRupee, ArrowRight, MoreVertical } from 'lucide-react';
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Premium Header */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Trips</h2>
          <div className="bg-indigo-50 p-2 rounded-2xl text-indigo-600">
            <Ticket size={24} />
          </div>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
          You have {bookings.length} active bookings
        </p>
      </div>

      <div className="px-6 space-y-8">
        {bookings.map((booking) => (
          <div key={booking.id} className="relative animate-in slide-in-from-bottom-4 duration-500">
            
            {/* The Main Ticket Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
              
              {/* Airline & Status Bar */}
              <div className="px-8 py-5 flex justify-between items-center border-b border-dashed border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">
                    {booking.airline.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Airline</p>
                    <p className="text-xs font-bold text-slate-800">{booking.airline}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Journey Path */}
              <div className="p-8">
                <div className="flex justify-between items-center relative mb-8">
                  <div className="z-10 bg-white">
                    <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{booking.origin}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Departure</p>
                  </div>

                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                    <div className="w-full border-t-2 border-dashed border-slate-100 absolute top-1/2" />
                    <div className="bg-white px-3 z-20">
                      <Plane className="text-indigo-600 rotate-90" size={20} />
                    </div>
                  </div>

                  <div className="z-10 bg-white text-right">
                    <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{booking.destination}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Arrival</p>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-slate-50 p-4 rounded-3xl">
                    <Calendar className="text-indigo-600 mb-2" size={16} />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Date</p>
                    <p className="text-xs font-bold text-slate-800">
                      {new Date(booking.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl">
                    <Users className="text-indigo-600 mb-2" size={16} />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Passengers</p>
                    <p className="text-xs font-bold text-slate-800">{booking.total_passengers} Pax</p>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-end pt-2">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Paid</p>
                    <div className="flex items-center gap-1">
                      <IndianRupee size={14} className="text-slate-900 font-black" />
                      <span className="text-2xl font-black text-slate-900 leading-none">
                        {booking.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ref Number</p>
                    <p className="text-xs font-mono font-bold text-indigo-600 tracking-wider">
                      {booking.booking_reference}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aesthetic Ticket Perforation (Notches) */}
            <div className="absolute left-[-8px] top-[72px] w-4 h-8 bg-[#F8FAFC] rounded-r-full shadow-inner" />
            <div className="absolute right-[-8px] top-[72px] w-4 h-8 bg-[#F8FAFC] rounded-l-full shadow-inner" />
          </div>
        ))}
      </div>
    </div>
  );
}