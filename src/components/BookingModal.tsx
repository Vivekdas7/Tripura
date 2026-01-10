import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, Headphones, Globe, Smartphone, Zap, Clock, AlertCircle } from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  
  // Timer State (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      passport_number: '',
      date_of_birth: undefined
    }
  ]);

  // Handle 15-Minute Countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format time for the UI
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      updated.push({
        first_name: '', last_name: '', email: '', phone: '', passport_number: '',
        date_of_birth: undefined
      });
    }
    while (updated.length > num) {
      updated.pop();
    }
    setPassengers(updated);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;

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
        // Clear timer on successful payment trigger
        if (timerRef.current) clearInterval(timerRef.current);
        await finalizeBooking(response.razorpay_payment_id);
      },
      prefill: {
        name: `${passengers[0].first_name} ${passengers[0].last_name}`,
        email: passengers[0].email,
        contact: passengers[0].phone
      },
      theme: { color: "#4f46e5" },
      modal: { 
        ondismiss: () => setLoading(false) 
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const finalizeBooking = async (paymentId: string) => {
    try {
      const bookingReference = 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const totalPrice = flight.price * numPassengers;
      setBookingRef(bookingReference);

      // 1. Insert Master Booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          flight_id: String(flight.id),
          booking_reference: bookingReference,
          status: 'confirmed',
          total_passengers: numPassengers,
          total_price: totalPrice,
          payment_id: paymentId,
          booking_date: today,
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

      // 2. Insert ALL Passenger data directly from input fields
      const passengersData = passengers.map(p => ({
        booking_id: booking.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        phone: p.phone,
        passport_number: p.passport_number || null
      }));

      const { error: passengersError } = await supabase
        .from('passengers')
        .insert(passengersData);

      if (passengersError) throw passengersError;

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // SESSION EXPIRED VIEW
  if (isExpired) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[3000] flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Session Expired</h3>
          <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
            For your security, the booking session timed out after 15 minutes. Please restart your booking.
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 overflow-y-auto">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-100 animate-bounce">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Done!</h2>
        <p className="text-slate-500 font-medium mb-8">Traveler data successfully recorded.</p>
        <div className="w-full max-w-sm bg-slate-50 rounded-[2.5rem] p-6 mb-8 border-2 border-dashed border-slate-200 relative">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</span>
            <span className="font-mono font-bold text-indigo-600">{bookingRef}</span>
          </div>
          <div className="flex justify-between items-center py-6 border-y border-slate-200/60">
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900">{flight.origin}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">From</p>
            </div>
            <Plane className="text-indigo-600 opacity-30" size={24} />
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{flight.destination}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">To</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-indigo-600 rounded-2xl text-white text-left flex gap-3">
             <Smartphone size={20} className="shrink-0 text-amber-300" />
             <p className="text-[11px] font-bold leading-relaxed">
               Ticket & PNR will arrive on {passengers[0].phone} in 5-7 minutes.
             </p>
          </div>
        </div>
        <button 
          onClick={() => { onBookingComplete(); onClose(); }}
          className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          My Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-[1000]">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Timer Bar */}
        <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
           <div 
             className={`h-full transition-all duration-1000 ${timeLeft < 120 ? 'bg-rose-500' : 'bg-indigo-600'}`}
             style={{ width: `${(timeLeft / 900) * 100}%` }}
           />
        </div>

        <div className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h2>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={14} className={timeLeft < 120 ? 'text-rose-500' : 'text-indigo-500'} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${timeLeft < 120 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                Session Expires: {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-full active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
          
          <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
                <p className="text-[10px] font-black uppercase opacity-60">Airline</p>
                <p className="font-bold text-sm">{flight.airline} #{flight.flight_number}</p>
              </div>
              <p className="text-xs font-bold">{new Date(flight.departure_time).toDateString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1"><h4 className="text-3xl font-black tracking-tighter">{flight.origin}</h4></div>
              <Plane size={20} className="opacity-40 rotate-90" />
              <div className="flex-1 text-right"><h4 className="text-3xl font-black tracking-tighter">{flight.destination}</h4></div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-[1.5rem] p-5 border border-amber-100 flex gap-4 items-start">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                <Info size={20} />
             </div>
             <div>
                <p className="text-xs font-black text-amber-900 uppercase">Wait Time Policy</p>
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed mt-1">
                  Once paid, your PNR will be processed and sent to you via WhatsApp/Email within 5-7 minutes.
                </p>
             </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-10 pb-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Traveling Members</label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNumPassengersChange(n)}
                    className={`py-4 rounded-2xl font-black transition-all border-2 ${
                      numPassengers === n ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {passengers.map((p, i) => (
                <div key={i} className="space-y-5 p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                      {i + 1}
                    </span>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Direct Database Entry</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="First Name" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                    <input required placeholder="Last Name" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                    <input required type="email" placeholder="Email Address" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all md:col-span-2" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                    <input required type="tel" placeholder="Mobile Number" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all md:col-span-2" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <a href="tel:9366159066" className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Headphones size={20} /></div>
                  <div><p className="text-[9px] font-black text-slate-400 uppercase">Support</p><p className="text-sm font-black text-slate-900">9366159066</p></div>
               </a>
               <a href="mailto:tripurafly.helpdesk@gmail.com" className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600"><Mail size={20} /></div>
                  <div className="truncate"><p className="text-[9px] font-black text-slate-400 uppercase">Email</p><p className="text-[11px] font-black text-slate-900 truncate">tripurafly.helpdesk@gmail.com</p></div>
               </a>
            </div>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 -mx-6 md:-mx-10 px-6 md:px-10 py-6">
              <div className="flex justify-between items-end mb-4">
                <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Grand Total</p><h3 className="text-4xl font-black text-slate-900">₹{(flight.price * numPassengers).toLocaleString()}</h3></div>
                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full"><ShieldCheck size={14} className="text-emerald-600" /><span className="text-[9px] font-black text-emerald-600 uppercase">Secure</span></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                {loading ? 'Entering Data...' : 'Pay Securely Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}