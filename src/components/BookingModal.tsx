import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall, Wallet, QrCode,
  Download, Camera, Share2, Copy, ExternalLink, ArrowDownCircle, Gift
} from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// --- Types & Interfaces ---
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

/**
 * TRIPURA FLY PREMIUM BOOKING MODAL
 * Includes: 
 * 1. Multi-passenger management
 * 2. Real-time timer logic
 * 3. UPI QR Generation
 * 4. Referral System integration (₹50 credit logic)
 * 5. WhatsApp manual verification flow
 */
export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  
  // Define Fare Tiers
  const fares = flight.fare_options || [
    { type: 'Sale', price: flight.price, baggage: '15kg Check-in' },
    { type: 'Value', price: Math.round(flight.price * 1.05), baggage: '15kg Check-in' },
    { type: 'SME', price: Math.round(flight.price * 1.15), baggage: '15kg + Free Meal' },
    { type: 'Flexi', price: Math.round(flight.price * 1.25), baggage: '15kg + Free Change' }
  ];

  // --- State Management ---
  const [selectedFare, setSelectedFare] = useState<FareOption>(fares[0]);
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(900); // 15 Minutes
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([
    { first_name: '', last_name: '', email: '', phone: '', passport_number: '', date_of_birth: undefined }
  ]);

  // --- Booking Timer Logic ---
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

  // --- Form Handlers ---
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

  // --- CORE BOOKING & REFERRAL LOGIC ---
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    setError('');
    setLoading(true);

    try {
      const bookingReference = 'TF' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const totalPrice = selectedFare.price * numPassengers;
      setBookingRef(bookingReference);

      // 1. Insert Booking Record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user?.id,
          flight_id: String(flight.id),
          booking_reference: bookingReference,
          status: 'pending_payment',
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

      // 2. Insert Passengers
      const passengersData = passengers.map(p => ({
        booking_id: booking.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        phone: p.phone
      }));

      const { error: passengersError } = await supabase.from('passengers').insert(passengersData);
      if (passengersError) throw passengersError;

      // 3. REFERRAL SYSTEM TRIGGER
      // Check if the user was referred by someone (stored in metadata via AuthContext)
      const referrerId = user?.user_metadata?.referred_by;
      if (referrerId) {
        await supabase.from('referrals').insert({
          referrer_id: referrerId,
          referred_user_id: user?.id,
          booking_id: booking.id,
          amount: 50,
          status: 'credited' // Automatically credit ₹50 to the friend
        });
      }

      if (timerRef.current) clearInterval(timerRef.current);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
      console.error("Booking Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- SUCCESS SCREEN (UPI + QR + WHATSAPP) ---
  if (showSuccess) {
    const totalPrice = selectedFare.price * numPassengers;
    const upiId = "9366159066@ptaxis"; 
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${upiId}%26pn=TripuraFly%26am=${totalPrice}%26cu=INR%26tn=${bookingRef}`;

    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center p-6 overflow-y-auto no-scrollbar pb-20">
        <div className="w-full max-w-md pt-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Reference Created</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Ref ID: {bookingRef}</p>
          </div>

          {/* QR CARD */}
          <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden text-center">
             <div className="bg-white p-5 rounded-[2.5rem] inline-block mb-6">
                <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Payable Amount</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">₹{totalPrice.toLocaleString()}</p>
             </div>
          </div>

          {/* REFERRAL NOTIFICATION IF APPLICABLE */}
          {user?.user_metadata?.referred_by && (
            <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-3 border border-indigo-100">
               <Gift className="text-indigo-600" size={20} />
               <p className="text-[10px] font-black text-indigo-900 uppercase">Friend Referral Applied: ₹50 Reward Triggered!</p>
            </div>
          )}

          {/* INSTRUCTIONS */}
          <div className="w-full bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2.5rem] p-6 space-y-5">
             <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
                  <Zap size={22} fill="currentColor" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1.5">Action Required</p>
                   <p className="text-sm font-black text-amber-900 italic tracking-tight">Manual Verification Flow</p>
                </div>
             </div>

             <div className="space-y-4 pl-1">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[11px] font-black text-amber-800 shrink-0">1</div>
                  <p className="text-[12px] font-bold text-amber-700 leading-relaxed">Scan QR and pay <span className="text-amber-900 font-black">₹{totalPrice.toLocaleString()}</span></p>
                </div>
                <div className="flex items-start gap-4 bg-white/50 p-3 rounded-2xl border border-amber-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">2</div>
                  <p className="text-[12px] font-black text-indigo-900 leading-relaxed italic">Take a screenshot of the payment success page.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[11px] font-black text-amber-800 shrink-0">3</div>
                  <p className="text-[12px] font-bold text-amber-700 leading-relaxed">Send screenshot to WhatsApp for PNR generation.</p>
                </div>
             </div>
          </div>

          {/* WHATSAPP ACTION */}
          <div className="space-y-4 pt-2">
             <a 
               href={`https://wa.me/919366159066?text=Payment Done for Ref: ${bookingRef}. Please verify and issue PNR.`} 
               target="_blank"
               className="flex flex-col items-center justify-center gap-1 w-full bg-[#25D366] text-white py-5 rounded-[2rem] shadow-xl active:scale-[0.97] transition-all"
             >
                <div className="flex items-center gap-2">
                  <MessageSquare size={20} className="fill-current" />
                  <span className="text-xs font-black uppercase tracking-widest">Share Receipt on WhatsApp</span>
                </div>
             </a>

             <button 
                onClick={() => { onBookingComplete(); onClose(); }} 
                className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors"
             >
                Back to Home
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM RENDER ---
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[1000] flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-[#F8FAFC] w-full max-w-2xl md:rounded-[3.5rem] rounded-t-[3.5rem] flex flex-col h-[94vh] md:h-auto md:max-h-[92vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        
        {/* MODAL HEADER */}
        <div className="shrink-0 bg-white px-8 pt-10 pb-6 flex justify-between items-center border-b border-slate-100">
           <div>
              <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-2">
                <Ticket size={20} className="text-indigo-600" /> Confirm Booking
              </h2>
              <div className={`flex items-center gap-2 mt-1 ${timeLeft < 120 ? 'text-rose-500' : 'text-indigo-600'}`}>
                 <Clock size={12} className={timeLeft < 120 ? 'animate-pulse' : ''} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Price Guarantee Ends: {formatTime(timeLeft)}</span>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-40">
          
          {/* FLIGHT MINI SUMMARY */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm">
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{flight.flight_number}</p>
                <div className="flex items-center gap-3">
                   <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">{flight.origin}</h4>
                   <ArrowRight size={16} className="text-indigo-400" />
                   <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">{flight.destination}</h4>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-900">{flight.airline}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(flight.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
             </div>
          </div>

          {/* FARE TIER SELECTION */}
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Select Fare Class</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fares.map((fare) => (
                  <button
                    key={fare.type}
                    onClick={() => setSelectedFare(fare)}
                    className={`p-5 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${
                      selectedFare.type === fare.type ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{fare.type}</p>
                    <p className="text-xl font-black text-slate-900 italic">₹{fare.price.toLocaleString()}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-2 flex items-center gap-1">
                      <Briefcase size={10} /> {fare.baggage}
                    </p>
                    {selectedFare.type === fare.type && (
                      <div className="absolute -right-2 -bottom-2 opacity-10">
                         <ShieldCheck size={60} />
                      </div>
                    )}
                  </button>
                ))}
             </div>
          </div>

          {/* PASSENGER SELECTION */}
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Number of Travellers</p>
             <div className="flex gap-2">
               {[1, 2, 3, 4].map(n => (
                 <button 
                  key={n} 
                  onClick={() => handleNumPassengersChange(n)} 
                  className={`flex-1 py-4 rounded-2xl font-black text-[11px] transition-all ${numPassengers === n ? 'bg-slate-900 text-white shadow-xl scale-[1.05]' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                 >
                   {n} Passenger{n > 1 ? 's' : ''}
                 </button>
               ))}
             </div>
          </div>

          {/* PASSENGER DETAILS FORM */}
          <form id="booking-form" onSubmit={handlePayment} className="space-y-8">
            {passengers.map((p, i) => (
              <div key={i} className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-[11px] font-black italic">P{i+1}</div>
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Traveller Information</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required placeholder="First Name" className="w-full p-5 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                  <input required placeholder="Last Name" className="w-full p-5 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                </div>
                
                <div className="relative group">
                  <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input required type="tel" placeholder="Mobile Number" className="w-full p-5 pl-12 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                </div>
                
                <div className="relative group">
                  <MailIcon size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input required type="email" placeholder="Email Address" className="w-full p-5 pl-12 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                </div>
              </div>
            ))}

            {/* ERROR DISPLAY */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                <AlertCircle size={18} />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 bg-white border-t border-slate-100 p-8 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-[1100]">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Total</p>
              <p className="text-4xl font-black text-slate-950 italic tracking-tighter">
                ₹{(selectedFare.price * numPassengers).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 mb-1 shadow-lg shadow-indigo-100">
                 <ShieldCheck size={10} />
                 <span className="text-[9px] font-black uppercase tracking-tighter">Secure Booking</span>
              </div>
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Taxes Included</p>
            </div>
          </div>
          
          <button 
            form="booking-form"
            type="submit" 
            disabled={loading || isExpired} 
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl disabled:opacity-40 transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 <span>Processing...</span>
              </div>
            ) : isExpired ? (
              "Price Expired"
            ) : (
              <>
                Initiate Payment <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}