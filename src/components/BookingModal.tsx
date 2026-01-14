import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall
} from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type FareOption = {
  type: string;
  price: number;
  baggage: string;
};

type BookingModalProps = {
  flight: Flight & { fare_options?: FareOption[] };
  onClose: () => void;
  onBookingComplete: () => void;
};

export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  
  const fares = flight.fare_options || [
    { type: 'Value', price: flight.price, baggage: '15kg Check-in' },
    { type: 'SME', price: Math.round(flight.price * 1.15), baggage: '25kg + Free Meal' },
    { type: 'Flexi', price: Math.round(flight.price * 1.25), baggage: '15kg + Free Change' }
  ];

  const [selectedFare, setSelectedFare] = useState<FareOption>(fares[0]);
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(900);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([
    { first_name: '', last_name: '', email: '', phone: '', passport_number: '', date_of_birth: undefined }
  ]);

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

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
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
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
      updated.push({ first_name: '', last_name: '', email: '', phone: '', passport_number: '', date_of_birth: undefined });
    }
    while (updated.length > num) updated.pop();
    setPassengers(updated);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    setError('');
    setLoading(true);

    const totalPrice = selectedFare.price * numPassengers;

    const options = {
      key: "rzp_test_S3FjWJ4FfvIzCb", 
      amount: totalPrice * 100, 
      currency: "INR",
      name: "TripuraFly",
      description: `${selectedFare.type} Fare Booking`,
      handler: async function (response: any) {
        if (timerRef.current) clearInterval(timerRef.current);
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
      const totalPrice = selectedFare.price * numPassengers;
      setBookingRef(bookingReference);

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
          airline: flight.airline,
          flight_number: flight.flight_number,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          fare_type: selectedFare.type
        })
        .select().single();

      if (bookingError) throw bookingError;

      const passengersData = passengers.map(p => ({
        booking_id: booking.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        phone: p.phone
      }));

      const { error: passengersError } = await supabase.from('passengers').insert(passengersData);
      if (passengersError) throw passengersError;
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Payment Successful!</h2>
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-2 mb-8">Ref ID: {bookingRef}</p>
        
        <div className="w-full max-w-sm bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-6 space-y-6">
           <div className="bg-indigo-600 p-5 rounded-[1.8rem] flex flex-col gap-3 text-left shadow-lg shadow-indigo-100">
              <div className="flex gap-2 items-center">
                 <Zap size={18} className="text-amber-300" />
                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Confirmation Pending</p>
              </div>
              <p className="text-xs font-bold text-indigo-50 leading-relaxed">
                Your PNR and E-Ticket will be sent to your mobile number and email address within 5-7 minutes.
              </p>
           </div>

           <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Support Contacts</p>
              <div className="flex flex-col gap-2">
                <a href="tel:9366159066" className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                   <PhoneCall size={14} className="text-indigo-600" />
                   <span className="text-xs font-black text-slate-700">9366159066</span>
                </a>
                <a href="mailto:tripurafly.helpdesk@gmail.com" className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 text-left">
                   <MailIcon size={14} className="text-indigo-600" />
                   <span className="text-[10px] font-black text-slate-700 truncate">tripurafly.helpdesk@gmail.com</span>
                </a>
              </div>
           </div>
        </div>
        
        <button onClick={() => { onBookingComplete(); onClose(); }} className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-2xl font-black mt-8 uppercase tracking-widest text-xs">Finish</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl md:rounded-[3rem] rounded-t-[3rem] flex flex-col h-[92vh] md:h-auto md:max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="shrink-0 bg-white px-6 pt-8 pb-4 flex justify-between items-center border-b border-slate-50">
           <div>
              <h2 className="text-xl font-black text-slate-900">Passenger Info</h2>
              <div className={`flex items-center gap-2 mt-1 ${timeLeft < 120 ? 'text-rose-500' : 'text-indigo-600'}`}>
                 <Clock size={12} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Session: {formatTime(timeLeft)}</span>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
          
          {/* FARES */}
          <div className="grid grid-cols-1 gap-2">
            {fares.map((fare) => (
              <button
                key={fare.type}
                onClick={() => setSelectedFare(fare)}
                className={`p-4 rounded-3xl border-2 text-left transition-all flex justify-between items-center ${
                  selectedFare.type === fare.type ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-50'
                }`}
              >
                <div>
                  <p className="text-xs font-black text-slate-900">{fare.type} Fare</p>
                  <p className="text-[10px] font-bold text-slate-400">{fare.baggage}</p>
                </div>
                <p className="text-md font-black text-slate-900">₹{fare.price.toLocaleString()}</p>
              </button>
            ))}
          </div>

          {/* PASSENGER COUNT */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => handleNumPassengersChange(n)} className={`min-w-[60px] py-3 rounded-2xl font-black text-xs ${numPassengers === n ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{n} Guest</button>
            ))}
          </div>

          {/* FORMS */}
          <form id="booking-form" onSubmit={handlePayment} className="space-y-6">
            {passengers.map((p, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest 0{i+1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <input required placeholder="First Name" className="p-4 bg-white rounded-xl text-xs font-bold" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                  <input required placeholder="Last Name" className="p-4 bg-white rounded-xl text-xs font-bold" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                </div>
                <input required type="tel" placeholder="Mobile (WhatsApp)" className="w-full p-4 bg-white rounded-xl text-xs font-bold" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                <input required type="email" placeholder="Email Address" className="w-full p-4 bg-white rounded-xl text-xs font-bold" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
              </div>
            ))}

            {/* DISCLAIMER & SUPPORT BLOCK */}
            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-4">
               <div className="flex gap-3">
                  <Info size={18} className="text-amber-600 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none">Important Disclaimer</p>
                    <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                      For budget friendliness, seats are <span className="underline">auto-assigned</span> by the airline. 
                      Your PNR and E-Ticket will be delivered via WhatsApp and Email within 5-7 minutes of payment.
                    </p>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-amber-200/50 space-y-3">
                  <p className="text-[9px] font-black text-amber-800/60 uppercase">Need Assistance?</p>
                  <div className="flex flex-wrap gap-4">
                     <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-amber-600" />
                        <span className="text-[10px] font-black text-amber-800">9366159066</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <MailIcon size={12} className="text-amber-600" />
                        <span className="text-[10px] font-black text-amber-800">tripurafly.helpdesk@gmail.com</span>
                     </div>
                  </div>
               </div>
            </div>
          </form>
        </div>

        {/* STICKY FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 flex flex-col gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Final Amount</p>
              <p className="text-3xl font-black text-slate-900">₹{(selectedFare.price * numPassengers).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
               <ShieldCheck size={12} className="text-emerald-600" />
               <span className="text-[9px] font-black text-emerald-600 uppercase">Secure</span>
            </div>
          </div>
          <button 
            form="booking-form"
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ₹${(selectedFare.price * numPassengers).toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
