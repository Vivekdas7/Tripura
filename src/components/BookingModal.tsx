import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall,
  QrCode, ExternalLink, Copy, Check, Loader2
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
  
  // State Management
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [selectedFare, setSelectedFare] = useState<FareOption>(
    flight.fare_options?.[0] || { type: 'Value', price: flight.price, baggage: '15kg Check-in' }
  );
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(900);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([
    { first_name: '', last_name: '', email: '', phone: '', passport_number: '', date_of_birth: undefined }
  ]);

  const fares = flight.fare_options || [
    { type: 'Value', price: flight.price, baggage: '15kg Check-in' },
    { type: 'SME', price: Math.round(flight.price * 1.15), baggage: '25kg + Free Meal' },
    { type: 'Flexi', price: Math.round(flight.price * 1.25), baggage: '15kg + Free Change' }
  ];

  // UPI Configuration
  const UPI_ID = "9366159066@ptaxis"; 
  const MERCHANT_NAME = "VIVEK DAS";
  const TOTAL_AMOUNT = selectedFare.price * numPassengers;
  
  // UPI Intent URL for Mobile Redirect
  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${TOTAL_AMOUNT}&cu=INR`;

  // --- TIMER LOGIC ---
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

  // --- REAL-TIME LISTENER (THE TRIGGER) ---
  useEffect(() => {
    if (!currentBookingId) return;

    // Listen to changes in the 'bookings' table for THIS specific booking ID
    const channel = supabase
      .channel(`booking_update_${currentBookingId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'bookings', 
          filter: `id=eq.${currentBookingId}` 
        },
        (payload) => {
          // If the admin changes status to 'confirmed' or marks 'is_fulfilled' to true
          if (payload.new.status === 'confirmed' || payload.new.is_fulfilled === true) {
            setBookingRef(payload.new.booking_reference);
            setShowSuccess(true);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBookingId]);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- INITIALIZE BOOKING (Step 1) ---
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    setLoading(true);

    try {
      const tempRef = 'TF' + Math.random().toString(36).substring(2, 7).toUpperCase();
      
      // Insert booking as 'pending'
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          flight_id: String(flight.id),
          booking_reference: tempRef,
          status: 'pending', // Awaiting manual admin confirmation
          total_passengers: numPassengers,
          total_price: TOTAL_AMOUNT,
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

      // Insert passengers
      const passengersData = passengers.map(p => ({
        booking_id: booking.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        phone: p.phone
      }));

      const { error: passengersError } = await supabase.from('passengers').insert(passengersData);
      if (passengersError) throw passengersError;

      setCurrentBookingId(booking.id);
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Payment Verified!</h2>
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-2 mb-8">Booking Ref: {bookingRef}</p>
        
        <div className="w-full max-w-sm bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl text-left">
           <div className="flex gap-2 items-center mb-4">
              <Zap size={18} className="text-amber-300" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Issuing Ticket</p>
           </div>
           <p className="text-xs font-bold text-indigo-50 leading-relaxed">
             Our team has confirmed your payment. Your PNR and E-Ticket are being generated and will be sent to WhatsApp/Email within 5 minutes.
           </p>
        </div>
        
        <button onClick={() => { onBookingComplete(); onClose(); }} className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-2xl font-black mt-10 uppercase tracking-widest text-xs">Close</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl md:rounded-[3.5rem] rounded-t-[3.5rem] flex flex-col h-[92vh] md:h-auto md:max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="shrink-0 bg-white px-8 pt-10 pb-4 flex justify-between items-center">
           <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none">
                {step === 'details' ? 'Guest Details' : 'UPI Payment'}
              </h2>
              <div className={`flex items-center gap-2 mt-2 ${timeLeft < 120 ? 'text-rose-500' : 'text-indigo-600'}`}>
                 <Clock size={12} className={timeLeft < 120 ? 'animate-pulse' : ''} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Expires in: {formatTime(timeLeft)}</span>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar pb-32">
          
          {step === 'details' ? (
            <>
              {/* FARES SELECTION */}
              <div className="grid grid-cols-1 gap-2">
                {fares.map((fare) => (
                  <button
                    key={fare.type}
                    onClick={() => setSelectedFare(fare)}
                    className={`p-5 rounded-[2rem] border-2 text-left transition-all flex justify-between items-center ${
                      selectedFare.type === fare.type ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{fare.type} Bundle</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{fare.baggage}</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">₹{fare.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>

              {/* GUEST SELECTOR */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => handleNumPassengersChange(n)} className={`min-w-[70px] py-4 rounded-2xl font-black text-xs transition-colors ${numPassengers === n ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{n} Guest</button>
                ))}
              </div>

              {/* INPUT FORMS */}
              <form id="booking-form" onSubmit={handleInitiatePayment} className="space-y-6">
                {passengers.map((p, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Passenger 0{i+1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input required placeholder="First Name" className="p-4 bg-white rounded-xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                      <input required placeholder="Last Name" className="p-4 bg-white rounded-xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                    </div>
                    <input required type="tel" placeholder="WhatsApp (For Ticket)" className="w-full p-4 bg-white rounded-xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                    <input required type="email" placeholder="Email Address" className="w-full p-4 bg-white rounded-xl text-xs font-bold border border-transparent focus:border-indigo-600 outline-none" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                  </div>
                ))}
              </form>
            </>
          ) : (
            /* REAL-TIME PAYMENT STEP */
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 py-4">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full">
                  <Loader2 size={12} className="animate-spin" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]">Waiting for payment...</p>
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">₹{TOTAL_AMOUNT.toLocaleString()}</h3>
              </div>

              {/* QR CODE DISPLAY */}
              <div className="relative mx-auto w-72 h-72 bg-white border-[6px] border-slate-900 rounded-[3.5rem] p-6 shadow-2xl overflow-hidden group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiIntentUrl)}`} 
                  alt="UPI QR" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <QrCode size={40} className="text-slate-900" />
                </div>
              </div>

              <div className="grid gap-3">
                {/* DIRECT UPI APP LINK (FOR MOBILE) */}
                <a 
                  href={upiIntentUrl}
                  className="flex md:hidden items-center justify-center gap-3 w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
                >
                  <Smartphone size={18} /> Open UPI App
                </a>

                {/* UPI ID COPY BUTTON */}
                <button 
                  onClick={copyToClipboard}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group active:scale-95 transition-all"
                >
                  <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">VPA ID</p>
                    <p className="text-xs font-bold text-slate-700">{UPI_ID}</p>
                  </div>
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-slate-300 group-hover:text-indigo-600" />}
                </button>

                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4 items-start">
                   <div className="p-2 bg-emerald-500 rounded-lg text-white">
                      <ShieldCheck size={16} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Live Auto-Detection</p>
                      <p className="text-[11px] font-bold text-emerald-700/80 leading-relaxed">
                        Stay on this screen after paying. Our system will automatically detect the transaction and confirm your flight.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 bg-white border-t border-slate-100 p-8 flex flex-col gap-4 shadow-[0_-20px_60px_rgba(0,0,0,0.08)]">
          {step === 'details' ? (
            <>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                  <p className="text-3xl font-black text-slate-900">₹{TOTAL_AMOUNT.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase">Secure</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-300">INC. GST & SURCHARGE</p>
                </div>
              </div>
              <button 
                form="booking-form"
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-[0.98] transition-transform"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Continue to Payment'}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 py-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</span>
              </div>
              <button 
                onClick={() => setStep('details')}
                className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-200 pb-0.5 hover:text-rose-500 transition-colors"
              >
                Cancel and edit info
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}