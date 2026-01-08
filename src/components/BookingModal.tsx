import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight } from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Handle Razorpay window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

type BookingModalProps = {
  flight: Flight;
  onClose: () => void;
  onBookingComplete: () => void;
};

export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Automatically fetch today's date for the record
  const today = new Date().toISOString().split('T')[0];

  // State matching your specific Passenger type (no birth date)
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      passport_number: ''
    }
  ]);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleNumPassengersChange = (num: number) => {
    setNumPassengers(num);
    const updated = [...passengers];
    while (updated.length < num) {
      updated.push({ first_name: '', last_name: '', email: '', phone: '', passport_number: '' });
    }
    while (updated.length > num) {
      updated.pop();
    }
    setPassengers(updated);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const totalPrice = flight.price * numPassengers;

    const options = {
      key: "rzp_test_S1BdtCVZVrDIDS",
      amount: totalPrice * 100, 
      currency: "INR",
      name: "TripuraFly",
      description: `Flight: ${flight.origin} to ${flight.destination}`,
      handler: async function (response: any) {
        await finalizeBooking(response.razorpay_payment_id);
      },
      prefill: {
        name: `${passengers[0].first_name} ${passengers[0].last_name}`,
        email: passengers[0].email,
        contact: passengers[0].phone
      },
      theme: { color: "#4f46e5" },
      modal: { ondismiss: () => setLoading(false) }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const finalizeBooking = async (paymentId: string) => {
    try {
      const bookingReference = 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const totalPrice = flight.price * numPassengers;
      setBookingRef(bookingReference);

      // 1. Insert ALL details into bookings (Snapshotting the API data)
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          flight_id: String(flight.id), // Store API ID as text
          booking_reference: bookingReference,
          status: 'confirmed',
          total_passengers: numPassengers,
          total_price: totalPrice,
          payment_id: paymentId,
          booking_date: today,
          // API Data Persistence
          airline: flight.airline,
          flight_number: flight.flight_number,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Insert Passengers
      const passengersWithBookingId = passengers.map(p => ({
        ...p,
        booking_id: booking.id
      }));

      const { error: passengersError } = await supabase
        .from('passengers')
        .insert(passengersWithBookingId);

      if (passengersError) throw passengersError;

      // Show success splash screen instead of immediate close
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Success Splash Screen View
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 mb-8">Pack your bags, your adventure begins.</p>
        
        <div className="w-full max-w-sm bg-slate-50 rounded-[2rem] p-6 mb-8 border-2 border-dashed border-slate-200 relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-slate-200" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-slate-200" />
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Ref</span>
            <span className="font-mono font-bold text-indigo-600">{bookingRef}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-y border-slate-200">
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900">{flight.origin}</p>
              <p className="text-[10px] font-bold text-slate-400">DEPARTURE</p>
            </div>
            <Plane className="text-slate-300" size={20} />
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{flight.destination}</p>
              <p className="text-[10px] font-bold text-slate-400">ARRIVAL</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs font-bold text-slate-600">
             <span>{numPassengers} Traveler{numPassengers > 1 ? 's' : ''}</span>
             <span>{flight.airline}</span>
          </div>
        </div>

        <button 
          onClick={() => { onBookingComplete(); onClose(); }}
          className="w-full max-w-sm bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-[1000] transition-all">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Mobile Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 md:hidden" />

        {/* Header */}
        <div className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Secure Payment Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 space-y-8">
          
          {/* Flight Ticket Summary */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex justify-between items-center mb-8">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <p className="text-[10px] font-black uppercase opacity-60">Airline</p>
                <p className="font-bold text-sm">{flight.airline} <span className="opacity-60">#{flight.flight_number}</span></p>
              </div>
              <div className="text-right">
                <CalendarIcon size={20} className="ml-auto mb-1 opacity-60" />
                <p className="text-xs font-bold">{new Date(flight.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <h4 className="text-3xl font-black tracking-tighter">{flight.origin}</h4>
                <p className="text-indigo-200 text-[10px] font-black uppercase mt-1">Departure</p>
              </div>
              <div className="flex flex-col items-center flex-1 opacity-40">
                <div className="w-full border-t-2 border-dashed border-white/50 relative">
                  <Plane size={16} className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-90" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <h4 className="text-3xl font-black tracking-tighter">{flight.destination}</h4>
                <p className="text-indigo-200 text-[10px] font-black uppercase mt-1">Arrival</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border-2 border-rose-100 text-sm font-bold flex gap-3 items-center animate-shake">
              <Info size={20} /> {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-10">
            {/* Passenger Count Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Group Size</label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNumPassengersChange(n)}
                    className={`py-4 rounded-2xl font-black transition-all border-2 ${
                      numPassengers === n 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' 
                      : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {n} {n === 1 ? 'Pax' : 'Pax'}
                  </button>
                ))}
              </div>
            </div>

            {/* Passenger Forms */}
            <div className="space-y-8">
              {passengers.map((p, i) => (
                <div key={i} className="group space-y-5 p-6 rounded-[2.5rem] bg-slate-50/50 border-2 border-slate-50 transition-all hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-lg group-hover:bg-indigo-600 transition-colors">
                      {i + 1}
                    </span>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Traveler Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 ml-1">FIRST NAME</p>
                      <input required placeholder="Enter first name" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-all" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 ml-1">LAST NAME</p>
                      <input required placeholder="Enter last name" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-all" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 ml-1">EMAIL ADDRESS</p>
                      <input required type="email" placeholder="email@example.com" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-all" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 ml-1">PHONE NUMBER</p>
                      <input required type="tel" placeholder="+91 ..." className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-all" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <p className="text-[10px] font-black text-slate-400 ml-1">PASSPORT (OPTIONAL)</p>
                      <input placeholder="Passport Number" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 transition-all" value={p.passport_number} onChange={e => handlePassengerChange(i, 'passport_number', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Checkout Button */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 -mx-6 md:-mx-10 px-6 md:px-10 py-6 flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Payable</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-400">₹</span>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{(flight.price * numPassengers).toLocaleString()}</h3>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-2 uppercase">Includes GST</p>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all disabled:bg-slate-300 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 group"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}