import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall, Wallet, QrCode,
  Download, Camera, Share2, Copy, ExternalLink, ArrowDownCircle, ChevronDown,
  MapPin, Luggage, PlaneTakeoff, PlaneLanding, Shield, Sparkles
} from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * --- TYPES & INTERFACES ---
 */
type FareOption = {
  type: string;
  price: number;
  cabin_baggage: string;
  checkin_baggage: string;
  features: string[];
};

type BookingModalProps = {
  flight: Flight & { fare_options?: FareOption[] };
  onClose: () => void;
  onBookingComplete: () => void;
};

type Step = 'review' | 'passengers' | 'payment';

/**
 * --- MAIN COMPONENT ---
 */
export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('review');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // MATCH PRICING LOGIC: FlightList uses (price + 200)
  const adjustedBasePrice = flight.price + 200;

  const fares: FareOption[] = flight.fare_options || [
    { 
      type: 'Economy Saver', 
      price: adjustedBasePrice, 
      cabin_baggage: '7kg', 
      checkin_baggage: '15kg',
      features: ['Standard Seat', 'Free Web Check-in', 'Zero Platform Fee']
    },
    { 
      type: 'Flexi Plus', 
      price: adjustedBasePrice + 1200, 
      cabin_baggage: '7kg', 
      checkin_baggage: '25kg',
      features: ['Free Seat Selection', 'Zero Cancellation Fee', 'Priority Boarding']
    }
  ];

  const [selectedFare, setSelectedFare] = useState<FareOption>(fares[0]);
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([
    { first_name: '', last_name: '', email: '', phone: '', passport_number: '', date_of_birth: undefined }
  ]);

  /**
   * --- EFFECTS ---
   */
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

  // Scroll to top on step change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * --- HANDLERS ---
   */
  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value.toUpperCase() };
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

  const validateStep = () => {
    if (currentStep === 'passengers') {
      const isValid = passengers.every(p => p.first_name.trim() && p.last_name.trim() && p.email.trim() && p.phone.trim());
      if (!isValid) {
        setError('Please fill all passenger details correctly');
        return false;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep === 'review') setCurrentStep('passengers');
      else if (currentStep === 'passengers') handleBookingInit();
    }
  };

  const handleBookingInit = async () => {
    setLoading(true);
    setError('');
    try {
      const bookingReference = 'TF' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const totalPrice = selectedFare.price * numPassengers;
      
      // FIX: Ensure departure_time and arrival_time are formatted as ISO strings
      // If flight.departure_time is already an ISO string from RapidAPI, use it directly.
      const depTime = new Date(flight.departure_time).toISOString();
      const arrTime = new Date(flight.arrival_time).toISOString();

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
          departure_time: depTime, // FIX APPLIED HERE
          arrival_time: arrTime,   // FIX APPLIED HERE
          fare_type: selectedFare.type
        })
        .select().single();

      if (bookingError) throw bookingError;

      const passengersData = passengers.map(p => ({
        booking_id: booking.id,
        first_name: p.first_name.trim(),
        last_name: p.last_name.trim(),
        email: p.email.trim(),
        phone: p.phone.trim()
      }));

      const { error: passengersError } = await supabase.from('passengers').insert(passengersData);
      if (passengersError) throw passengersError;

      setBookingRef(bookingReference);
      setCurrentStep('payment');
    } catch (err: any) {
      console.error("Booking Error:", err);
      setError(err.message || 'Failed to initialize booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * --- PAYMENT UTILS ---
   */
  const upiId = "9366159066@ptaxis"; 
  const totalPrice = selectedFare.price * numPassengers;
  const upiString = `upi://pay?pa=${upiId}&pn=EasyMyBook&am=${totalPrice}&cu=INR&tn=${bookingRef}`;

  const openPaymentApp = () => {
    window.location.href = upiString;
  };

  /**
   * --- SUB-COMPONENTS ---
   */
  const ProgressHeader = () => (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-50 sticky top-0 z-20">
      {[
        { id: 'review', label: 'Flight' },
        { id: 'passengers', label: 'Travelers' },
        { id: 'payment', label: 'Payment' }
      ].map((s, idx) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
            currentStep === s.id || (idx === 0 && currentStep === 'passengers') || (idx <= 1 && currentStep === 'payment')
            ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100' 
            : 'bg-slate-100 text-slate-400'
          }`}>
            {idx + 1}
          </div>
          <span className={`hidden sm:block text-[10px] font-black uppercase tracking-tighter ${currentStep === s.id ? 'text-slate-900' : 'text-slate-300'}`}>
            {s.label}
          </span>
          {idx < 2 && <div className="w-4 h-[1px] bg-slate-100 mx-2" />}
        </div>
      ))}
    </div>
  );

  /**
   * --- FINAL PAYMENT VIEW ---
   */
  if (currentStep === 'payment') {
    return (
      <div className="fixed inset-0 bg-[#F8FAFC] z-[2000] flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500">
        <div className="max-w-md mx-auto w-full p-6 space-y-6 pb-24">
          <div className="flex justify-between items-center pt-4">
             <button onClick={() => setCurrentStep('passengers')} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100">
                <ChevronDown size={20} className="rotate-90 text-slate-900" />
             </button>
             <div className="text-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Secure Checkout</h2>
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-tight flex items-center gap-1 justify-center">
                   <ShieldCheck size={10} /> 256-bit SSL Encrypted
                </p>
             </div>
             <div className="w-10" />
          </div>

          <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200/50 text-center border border-slate-50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Total Amount</p>
             <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter relative z-10">₹{totalPrice.toLocaleString()}</h1>
             <div className="mt-6 inline-flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest relative z-10">
                <QrCode size={14} className="text-indigo-400" /> REF: {bookingRef}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment App</p>
                <span className="flex items-center gap-1 text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Instant</span>
             </div>
             
             {[
               { name: 'PhonePe', logo: 'https://images.seeklogo.com/logo-png/50/1/phonepe-logo-png_seeklogo-507202.png', bgColor: 'bg-purple-50' },
               { name: 'Google Pay', logo: 'https://img.icons8.com/color/48/google-pay.png', bgColor: 'bg-blue-50' },
               { name: 'Paytm', logo: 'https://img.icons8.com/color/48/paytm.png', bgColor: 'bg-sky-50' }
             ].map((app) => (
               <button key={app.name} onClick={openPaymentApp} className="w-full bg-white border border-slate-100 p-5 rounded-[2.5rem] flex items-center justify-between hover:border-indigo-600 transition-all group active:scale-95 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${app.bgColor} rounded-2xl flex items-center justify-center p-2.5 shadow-inner`}>
                       <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                       <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{app.name}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Fast & Secure</p>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ChevronRight size={14} />
                 </div>
               </button>
             ))}
          </div>

          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-center text-white shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8">Scan QR to Pay</p>
             <div className="bg-white p-6 rounded-[3rem] inline-block mb-8 shadow-inner ring-8 ring-white/5">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`} alt="UPI QR" className="w-44 h-44" />
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-indigo-300">
                  <ShieldCheck size={14} />
                  <p className="text-[9px] font-black uppercase tracking-widest">Verified Merchant</p>
                </div>
                <p className="text-[11px] font-medium text-slate-400 px-6 leading-relaxed italic">"Please do not close this window while the transaction is processing"</p>
             </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-8 space-y-6 text-center shadow-lg shadow-emerald-100/20">
             <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl rotate-3"><MessageSquare size={22} fill="currentColor" /></div>
                <div className="text-left">
                   <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">Final Step Required</p>
                   <p className="text-[9px] font-bold text-emerald-600 uppercase">Verification via WhatsApp</p>
                </div>
             </div>
             <p className="text-[12px] font-bold text-emerald-800 leading-relaxed px-2">Send payment screenshot to WhatsApp for your <span className="font-black underline decoration-emerald-400 decoration-2">E-Ticket & PNR</span>.</p>
             
             <div className="space-y-3">
               <a href={`https://wa.me/919366159066?text=Payment Done for Ref: ${bookingRef}. Amount: ₹${totalPrice}. Sending Screenshot...`} target="_blank" className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all">
                  Upload Screenshot <ArrowRight size={16} />
               </a>
               
               <button 
                 onClick={onBookingComplete} 
                 className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all"
               >
                  I've Already Paid <CheckCircle2 size={16} />
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * --- REVIEW & PASSENGERS VIEW ---
   */
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[1000] flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-[#F8FAFC] w-full max-w-2xl md:rounded-[4rem] rounded-t-[4rem] flex flex-col h-[94vh] md:h-auto md:max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
        
        {/* MODAL HEADER */}
        <div className="shrink-0 bg-white shadow-sm relative z-30">
          <div className="px-8 pt-10 pb-4 flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-2">
                 {currentStep === 'review' ? 'Review Trip' : 'Traveler Details'}
                 <Sparkles size={18} className="text-indigo-600" />
               </h2>
               <div className={`flex items-center gap-2 mt-1.5 ${timeLeft < 120 ? 'text-rose-500' : 'text-indigo-600'}`}>
                 <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                 <span className="text-[10px] font-black uppercase tracking-[0.15em]">Fare Secured: {formatTime(timeLeft)}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner border border-slate-100">
              <X size={22} />
            </button>
          </div>
          <ProgressHeader />
        </div>

        {/* SCROLLABLE CONTENT */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 no-scrollbar pb-40">
          
          {currentStep === 'review' && (
            <>
              {/* TICKET CARD */}
              <div className="bg-indigo-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">{flight.airline}</p>
                       <p className="text-xs font-bold text-white/80">{flight.flight_number}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Departure Date</p>
                       <p className="text-sm font-bold text-white italic">{new Date(flight.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-6">
                    <div className="flex-1">
                       <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-1">{flight.origin}</h3>
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 flex-1 pt-2">
                       <div className="w-full h-[1px] bg-white/20 relative flex justify-center">
                          <div className="absolute -top-3 px-3 bg-indigo-900">
                             <Plane size={20} className="text-indigo-400 rotate-90" />
                          </div>
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Direct Flight</span>
                    </div>

                    <div className="flex-1 text-right">
                       <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-1">{flight.destination}</h3>
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                         <Luggage size={18} className="text-indigo-400" />
                         <div>
                            <p className="text-[8px] font-black text-indigo-300 uppercase">Check-in</p>
                            <p className="text-[11px] font-black uppercase text-white">{selectedFare.checkin_baggage}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                         <Briefcase size={18} className="text-indigo-400" />
                         <div>
                            <p className="text-[8px] font-black text-indigo-300 uppercase">Cabin</p>
                            <p className="text-[11px] font-black uppercase text-white">{selectedFare.cabin_baggage}</p>
                         </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* FARE OPTIONS */}
              <div className="space-y-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Choose Your Fare</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fares.map((fare) => (
                    <button key={fare.type} onClick={() => setSelectedFare(fare)} className={`p-6 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group ${selectedFare.type === fare.type ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                      {selectedFare.type === fare.type && (
                         <div className="absolute top-4 right-6 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 size={14} strokeWidth={3} />
                         </div>
                      )}
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedFare.type === fare.type ? 'text-indigo-600' : 'text-slate-400'}`}>{fare.type}</p>
                      <p className="text-3xl font-black text-slate-900 italic tracking-tighter">₹{fare.price.toLocaleString()}</p>
                      
                      <div className="mt-6 space-y-2.5">
                        {fare.features.map(feat => (
                          <div key={feat} className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PASSENGER COUNT */}
              <div className="space-y-5">
                <div className="flex items-center justify-between px-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Travelers</p>
                   <span className="text-[9px] font-black text-indigo-600 uppercase italic">Max 4 Seats</span>
                </div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => handleNumPassengersChange(n)} className={`flex-1 py-5 rounded-3xl font-black text-xs italic transition-all ${numPassengers === n ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                      {n} {n === 1 ? 'ADULT' : 'ADULTS'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 'passengers' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
               <div className="flex items-start gap-4 bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100/50">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                     <ShieldCheck size={20} />
                  </div>
                  <div>
                     <p className="text-xs font-black text-indigo-950 uppercase tracking-tight">Identity Verification</p>
                     <p className="text-[10px] font-bold text-indigo-600/80 mt-1 leading-relaxed">Please ensure passenger names match their Official IDs. Incorrect names may result in denied boarding or heavy change fees.</p>
                  </div>
               </div>

               {passengers.map((p, i) => (
                <div key={i} className="p-8 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6 relative group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center text-xs font-black italic shadow-lg">0{i+1}</div>
                       <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Traveler {i+1}</p>
                    </div>
                    {p.first_name && p.last_name && <CheckCircle2 size={20} className="text-emerald-500 animate-in zoom-in" />}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">First Name</p>
                       <input 
                         required 
                         placeholder="E.G. JOHN" 
                         className="w-full p-5 bg-slate-50 rounded-[2rem] text-xs font-black uppercase border-2 border-transparent focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all placeholder:text-slate-300" 
                         value={p.first_name} 
                         onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} 
                       />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Last Name</p>
                       <input 
                         required 
                         placeholder="E.G. DOE" 
                         className="w-full p-5 bg-slate-50 rounded-[2rem] text-xs font-black uppercase border-2 border-transparent focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all placeholder:text-slate-300" 
                         value={p.last_name} 
                         onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} 
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contact Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          required 
                          type="email" 
                          placeholder="Email Address" 
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[2rem] text-xs font-bold border-none focus:ring-2 focus:ring-indigo-500/10" 
                          value={p.email} 
                          onChange={e => handlePassengerChange(i, 'email', e.target.value)} 
                        />
                      </div>
                      <div className="relative">
                        <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          required 
                          type="tel" 
                          placeholder="WhatsApp Number" 
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[2rem] text-xs font-bold border-none focus:ring-2 focus:ring-indigo-500/10" 
                          value={p.phone} 
                          onChange={e => handlePassengerChange(i, 'phone', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
               ))}
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex items-center gap-4 text-rose-600 animate-in shake duration-500">
               <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
               </div>
               <p className="text-[11px] font-black uppercase tracking-tight leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 bg-white border-t border-slate-50 p-8 md:p-10 flex items-center justify-between gap-8 shadow-[0_-20px_40px_rgba(0,0,0,0.03)] z-30">
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Grand Total</p>
            <p className="text-3xl font-black text-slate-900 italic tracking-tighter">₹{totalPrice.toLocaleString()}</p>
          </div>
          
          <div className="flex-1 flex items-center gap-4">
             {currentStep === 'passengers' && (
                <button 
                  onClick={() => setCurrentStep('review')}
                  className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100"
                >
                   <ChevronDown size={24} className="rotate-90" />
                </button>
             )}
             
             <button 
               onClick={nextStep} 
               disabled={loading || isExpired} 
               className="flex-1 bg-slate-950 text-white h-14 sm:h-16 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
             >
               {loading ? (
                 <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="italic">Processing...</span>
                 </div>
               ) : (
                 <>
                   <span>{currentStep === 'review' ? 'Continue' : 'Proceed to Payment'}</span>
                   <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}