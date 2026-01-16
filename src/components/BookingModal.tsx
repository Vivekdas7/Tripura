import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall, Wallet, QrCode
} from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  // UPDATED: Now creates a pending booking and moves to Payment QR screen
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    setError('');
    setLoading(true);

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
          status: 'pending_verification', // New Status for Admin to see
          total_passengers: numPassengers,
          total_price: totalPrice,
          airline: flight.airline,
          flight_number: flight.flight_number,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          fare_type: selectedFare.type,
          is_fulfilled: false
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

      if (timerRef.current) clearInterval(timerRef.current);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN (NOW THE PAYMENT QR VIEW)
  if (showSuccess) {
    const totalPrice = selectedFare.price * numPassengers;
    // Replace with your actual UPI ID
    const upiId = "9366159066@ptaxis"; 
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${upiId}%26pn=TripuraFly%26am=${totalPrice}%26cu=INR%26tn=${bookingRef}`;

    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center p-6 text-center overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md pt-8 space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-4">
              <QrCode size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Scan & Pay</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Ref ID: {bookingRef}</p>
          </div>

          {/* QR CODE CARD */}
          <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl shadow-indigo-200 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
             
             <div className="bg-white p-4 rounded-[2rem] inline-block mb-6">
                <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
             </div>

             <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Total Amount</p>
                <p className="text-4xl font-black text-white italic">₹{totalPrice.toLocaleString()}</p>
             </div>

             <div className="flex justify-center gap-4 mt-6 opacity-60">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" className="h-4 grayscale invert" alt="UPI" />
                <img src="https://cdn.worldvectorlogo.com/logos/google-pay-2.svg" className="h-4 grayscale invert" alt="GPay" />
                <img src="https://cdn.worldvectorlogo.com/logos/phonepe-1.svg" className="h-4 grayscale invert" alt="PhonePe" />
             </div>
          </div>
          
          <div className="w-full bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2.5rem] p-6 space-y-4 text-left">
             <div className="flex gap-3">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                  <Zap size={18} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">How to complete?</p>
                   <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                     1. Pay using any UPI App.<br/>
                     2. Your payment is verified automatically via Ref ID.<br/>
                     3. Ticket will be sent to <strong>{passengers[0].phone}</strong> via WhatsApp.
                   </p>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Need Help?</p>
             <div className="flex flex-col gap-2">
               <a href={`https://wa.me/919366159066?text=Payment Done for Ref: ${bookingRef}`} className="flex items-center justify-center gap-3 p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 transition-transform active:scale-95">
                  <MessageSquare size={18} className="fill-current" />
                  <span className="text-xs font-black uppercase tracking-widest">I have paid (WhatsApp)</span>
               </a>
             </div>
          </div>
          
          <button 
            onClick={() => { onBookingComplete(); onClose(); }} 
            className="w-full text-slate-400 py-4 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
          >
            Check Status Later
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl md:rounded-[3rem] rounded-t-[3rem] flex flex-col h-[92vh] md:h-auto md:max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="shrink-0 bg-white px-6 pt-8 pb-4 flex justify-between items-center border-b border-slate-50">
           <div>
              <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">Traveller Info</h2>
              <div className={`flex items-center gap-2 mt-1 ${timeLeft < 120 ? 'text-rose-500' : 'text-indigo-600'}`}>
                 <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${timeLeft < 120 ? 'bg-rose-500' : 'bg-indigo-600'}`} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Time Remaining: {formatTime(timeLeft)}</span>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
          
          {/* FARES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {fares.map((fare) => (
              <button
                key={fare.type}
                onClick={() => setSelectedFare(fare)}
                className={`p-4 rounded-3xl border-2 text-left transition-all ${
                  selectedFare.type === fare.type ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-50 bg-slate-50/30'
                }`}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{fare.type}</p>
                <p className="text-lg font-black text-slate-900 italic">₹{fare.price.toLocaleString()}</p>
                <p className="text-[9px] font-bold text-slate-500 mt-1 leading-none">{fare.baggage}</p>
              </button>
            ))}
          </div>

          {/* PASSENGER COUNT */}
          <div className="space-y-3">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Number of Guests</p>
             <div className="flex gap-2">
               {[1, 2, 3, 4].map(n => (
                 <button key={n} onClick={() => handleNumPassengersChange(n)} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${numPassengers === n ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{n}</button>
               ))}
             </div>
          </div>

          {/* FORMS */}
          <form id="booking-form" onSubmit={handlePayment} className="space-y-6">
            {passengers.map((p, i) => (
              <div key={i} className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm text-indigo-600">0{i+1}</div>
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Guest Information</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input required placeholder="First Name" className="p-4 bg-white rounded-2xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none transition-all shadow-sm" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                  <input required placeholder="Last Name" className="p-4 bg-white rounded-2xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none transition-all shadow-sm" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                </div>
                <input required type="tel" placeholder="WhatsApp Number" className="w-full p-4 bg-white rounded-2xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none transition-all shadow-sm" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                <input required type="email" placeholder="Email Address" className="w-full p-4 bg-white rounded-2xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none transition-all shadow-sm" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
              </div>
            ))}

            {/* DISCLAIMER */}
            <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 space-y-4">
               <div className="flex gap-3">
                  <ShieldCheck size={18} className="text-indigo-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">Safe & Trusted Booking</p>
                    <p className="text-[11px] font-bold text-indigo-800/70 leading-relaxed">
                      Your booking is encrypted. Our experts will manually issue your PNR within minutes for the lowest price guarantee.
                    </p>
                  </div>
               </div>
            </div>
          </form>
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 bg-white border-t border-slate-100 p-6 md:p-8 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
              <p className="text-3xl font-black text-slate-900 italic">₹{(selectedFare.price * numPassengers).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full mb-1">
                 <ShieldCheck size={12} className="text-emerald-600" />
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Verified</span>
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Secure Manual Flow</p>
            </div>
          </div>
          <button 
            form="booking-form"
            type="submit" 
            disabled={loading || isExpired} 
            className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Generating QR...' : (
              <>
                Confirm Booking <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}