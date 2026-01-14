import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Smartphone, Zap, Clock, AlertCircle, PhoneCall, Mail as MailIcon,
  QrCode, Copy, Check, Loader2, Sparkles, IndianRupee
} from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type FareOption = { type: string; price: number; baggage: string; };

type BookingModalProps = {
  flight: Flight & { fare_options?: FareOption[] };
  onClose: () => void;
  onBookingComplete: () => void;
};

export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  
  // --- STATE ---
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [selectedFare, setSelectedFare] = useState<FareOption>(
    flight.fare_options?.[0] || { type: 'Value', price: flight.price, baggage: '15kg Check-in' }
  );
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);

  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      first_name: '', last_name: '', email: '', phone: '',
      date_of_birth: undefined
    }
  ]);

  // --- UPI CONSTANTS ---
  const UPI_ID = "9366159066@ptaxis"; 
  const MERCHANT_NAME = "VIVEK DAS";
  const TOTAL_AMOUNT = selectedFare.price * numPassengers;
  
  // Generated Transaction ID to prevent confusion in Admin Dashboard
  const [transactionId] = useState(() => `TXN${Math.floor(100000 + Math.random() * 900000)}`);

  // STRICT UPI LINK: Includes Merchant Code (MC) and Transaction Ref (TR)
  // This ensures GPay/PhonePe/Paytm open instead of generic apps
  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${TOTAL_AMOUNT}&cu=INR&tr=${transactionId}&mc=0000&mode=02&purpose=00`;

  // --- TIMER ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- REAL-TIME VERIFICATION TRIGGER ---
  useEffect(() => {
    if (!currentBookingId) return;

    // SUBSCRIBE TO SUPABASE REALTIME
    const channel = supabase
      .channel(`realtime_booking_${currentBookingId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${currentBookingId}` },
        (payload) => {
          // If admin marks as 'confirmed' or 'is_fulfilled'
          if (payload.new.status === 'confirmed' || payload.new.is_fulfilled === true) {
            setBookingRef(payload.new.booking_reference);
            setShowSuccess(true);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentBookingId]);

  // --- HANDLERS ---
  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleInitiateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const generatedRef = 'TF' + Math.random().toString(36).substring(2, 7).toUpperCase();
      
      // 1. Save pending booking to Supabase
      const { data: booking, error: bError } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          flight_id: String(flight.id),
          booking_reference: generatedRef,
          status: 'pending', // Waiting for manual verify
          total_passengers: numPassengers,
          total_price: TOTAL_AMOUNT,
          airline: flight.airline,
          flight_number: flight.flight_number,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          internal_note: `UPI Transaction ID: ${transactionId}`, // Admin sees this
          is_fulfilled: false
        })
        .select().single();

      if (bError) throw bError;

      // 2. Save passengers
      const passengersData = passengers.map(p => ({
        booking_id: booking.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        phone: p.phone
      }));
      await supabase.from('passengers').insert(passengersData);

      setCurrentBookingId(booking.id);
      setStep('payment');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-200 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 italic">Flight Secured!</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 mb-10">Ref: {bookingRef}</p>
        
        <div className="w-full max-w-sm bg-slate-900 rounded-[3rem] p-8 text-left relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={60} className="text-white"/></div>
           <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Manifest Status</p>
           <p className="text-white text-sm font-bold leading-relaxed">
             Your payment has been verified in Realtime. We are now generating your PNR and E-Ticket. Check your WhatsApp in 5 minutes.
           </p>
        </div>
        
        <button onClick={() => { onBookingComplete(); onClose(); }} className="w-full max-w-sm bg-indigo-600 text-white py-6 rounded-3xl font-black mt-10 uppercase tracking-widest text-xs shadow-xl shadow-indigo-100">Go to My Bookings</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[1000] flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl md:rounded-[3.5rem] rounded-t-[3.5rem] flex flex-col h-[94vh] md:h-auto overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="px-8 pt-10 pb-6 flex justify-between items-center border-b border-slate-50">
           <div>
              <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">
                {step === 'details' ? 'Passenger Info' : 'UPI Verification'}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                 <div className={`w-2 h-2 rounded-full ${timeLeft < 300 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Session: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</span>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar pb-40">
          {step === 'details' ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Fare Type</p>
                {flight.fare_options?.map((fare) => (
                  <button key={fare.type} onClick={() => setSelectedFare(fare)} className={`w-full p-6 rounded-[2rem] border-2 transition-all flex justify-between items-center ${selectedFare.type === fare.type ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-50'}`}>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900">{fare.type} Bundle</p>
                      <p className="text-[10px] font-bold text-slate-400">{fare.baggage}</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">₹{fare.price}</p>
                  </button>
                ))}
              </div>

              <form id="booking-form" onSubmit={handleInitiateBooking} className="space-y-6">
                 {passengers.map((p, i) => (
                   <div key={i} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Primary Traveler</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="First Name" className="p-4 bg-white rounded-2xl text-xs font-bold border-transparent focus:border-indigo-600 outline-none" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                        <input required placeholder="Last Name" className="p-4 bg-white rounded-2xl text-xs font-bold border-transparent focus:border-indigo-600 outline-none" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                      </div>
                      <input required type="tel" placeholder="WhatsApp Number" className="w-full p-4 bg-white rounded-2xl text-xs font-bold outline-none" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                      <input required type="email" placeholder="Email Address" className="w-full p-4 bg-white rounded-2xl text-xs font-bold outline-none" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                   </div>
                 ))}
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="text-center bg-slate-50 py-8 rounded-[3rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter">₹{TOTAL_AMOUNT.toLocaleString()}</h3>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-100">
                    <Loader2 size={12} className="animate-spin text-indigo-600" />
                    <span className="text-[9px] font-black text-slate-600 uppercase">Awaiting Bank Signal</span>
                  </div>
               </div>

               {/* QR CODE */}
               <div className="mx-auto w-64 h-64 bg-white border-[8px] border-slate-900 rounded-[3.5rem] p-6 shadow-2xl relative group">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiIntentUrl)}`} className="w-full h-full object-contain" alt="UPI" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-widest">Scan with GPay / PhonePe</div>
               </div>

               {/* REDIRECTION BUTTONS */}
               <div className="space-y-3">
                  <a href={upiIntentUrl} className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    <Smartphone size={18} /> Open UPI Apps
                  </a>

                  <button onClick={copyUpi} className="w-full p-5 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex justify-between items-center group">
                    <div className="text-left">
                       <p className="text-[8px] font-black text-indigo-400 uppercase mb-0.5">Copy UPI ID</p>
                       <p className="text-xs font-bold text-indigo-900">{UPI_ID}</p>
                    </div>
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-indigo-300" />}
                  </button>
               </div>

               <div className="p-6 bg-slate-900 text-white rounded-[2.5rem] flex gap-4 items-start shadow-xl">
                  <ShieldCheck size={24} className="text-indigo-400 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                    <span className="text-white font-black uppercase">Realtime Active:</span> Stay on this page after payment. Once you pay in GPay/PhonePe, our dashboard will sync and this screen will change automatically.
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-50 p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
          {step === 'details' ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end px-2">
                 <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Final Price</p>
                   <p className="text-3xl font-black text-slate-900">₹{TOTAL_AMOUNT.toLocaleString()}</p>
                 </div>
                 <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black">0% TAX</div>
              </div>
              <button form="booking-form" type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Proceed to Payment'}
              </button>
            </div>
          ) : (
            <button onClick={() => setStep('details')} className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
              Cancel & Modify Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
}