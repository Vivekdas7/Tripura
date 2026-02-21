import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall, Wallet, QrCode,
  Download, Camera, Share2, Copy, ExternalLink, ArrowDownCircle, ChevronDown,
  MapPin, Luggage, PlaneTakeoff, PlaneLanding
} from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('review');
  
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

  const validateStep = () => {
    if (currentStep === 'passengers') {
      const isValid = passengers.every(p => p.first_name && p.last_name && p.email && p.phone);
      if (!isValid) {
        setError('Please fill all passenger details');
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
    try {
      const bookingReference = 'TF' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const totalPrice = selectedFare.price * numPassengers;
      setBookingRef(bookingReference);

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

      setCurrentStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PAYMENT UTILS ---
  const upiId = "9366159066@ptaxis"; 
  const totalPrice = selectedFare.price * numPassengers;
  const upiString = `upi://pay?pa=${upiId}&pn=TripuraFly&am=${totalPrice}&cu=INR&tn=${bookingRef}`;

  const openPaymentApp = () => {
    window.location.href = upiString;
  };

  // --- SUB-COMPONENTS ---
  const ProgressHeader = () => (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-50">
      {[
        { id: 'review', label: 'Flight' },
        { id: 'passengers', label: 'Travelers' },
        { id: 'payment', label: 'Payment' }
      ].map((s, idx) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
            currentStep === s.id ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'
          }`}>
            {idx + 1}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${currentStep === s.id ? 'text-slate-900' : 'text-slate-300'}`}>
            {s.label}
          </span>
          {idx < 2 && <ChevronRight size={12} className="text-slate-200 mx-2" />}
        </div>
      ))}
    </div>
  );

  // --- FINAL PAYMENT VIEW ---
  if (currentStep === 'payment') {
    return (
      <div className="fixed inset-0 bg-slate-50 z-[2000] flex flex-col overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto w-full p-6 space-y-6 pb-24">
          <div className="flex justify-between items-center pt-4">
             <button onClick={() => setCurrentStep('passengers')} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
                <ChevronDown size={20} className="rotate-90" />
             </button>
             <h2 className="text-lg font-black italic uppercase">Checkout</h2>
             <div className="w-10" />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 text-center border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payable Amount</p>
             <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">₹{totalPrice.toLocaleString()}</h1>
             <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                <Ticket size={12} /> ID: {bookingRef}
             </div>
          </div>

          <div className="space-y-3">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Payment App</p>
             {[
               { name: 'PhonePe', logo: 'https://imgs.search.brave.com/oFcAskGSLx-cRhKZMZVmQsTe6UV_M9Iruwi3MleRLk4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzUwLzEvcGhvbmVw/ZS1sb2dvLXBuZ19z/ZWVrbG9nby01MDcy/MDIucG5n', bgColor: 'bg-purple-50' },
               { name: 'Google Pay', logo: 'https://img.icons8.com/color/48/google-pay.png', bgColor: 'bg-blue-50' },
               { name: 'Paytm', logo: 'https://img.icons8.com/color/48/paytm.png', bgColor: 'bg-sky-50' }
             ].map((app) => (
               <button key={app.name} onClick={openPaymentApp} className="w-full bg-white border-2 border-slate-100 p-5 rounded-3xl flex items-center justify-between hover:border-indigo-600 transition-all group active:scale-95">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${app.bgColor} rounded-2xl flex items-center justify-center p-2`}>
                       <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                       <p className="font-black text-slate-900">{app.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">Instant Confirmation</p>
                    </div>
                 </div>
                 <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
               </button>
             ))}
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-8 text-center text-white">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Or Scan QR Code</p>
             <div className="bg-white p-4 rounded-[2.5rem] inline-block mb-6">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`} alt="UPI QR" className="w-40 h-40" />
             </div>
             <p className="text-[11px] font-medium text-slate-400 px-6">Scan and pay ₹{totalPrice.toLocaleString()} via any UPI app</p>
          </div>

          <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-[2.5rem] p-6 space-y-4 text-center">
             <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg"><MessageSquare size={18} fill="currentColor" /></div>
                <p className="text-xs font-black text-emerald-900 uppercase">Step 2: Verification</p>
             </div>
             <p className="text-[12px] font-bold text-emerald-800 leading-relaxed">Send payment screenshot to WhatsApp for your <span className="font-black underline">E-Ticket & PNR</span>.</p>
             
             <div className="grid grid-cols-1 gap-3">
               <a href={`https://wa.me/919366159066?text=Payment Done for Ref: ${bookingRef}. Amount: ₹${totalPrice}. Sending Screenshot...`} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">
                  Send to WhatsApp <ArrowRight size={16} />
               </a>
               
               <button 
                 onClick={onBookingComplete} 
                 className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest"
               >
                  I've Already Paid <CheckCircle2 size={16} />
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- REVIEW & PASSENGERS VIEW ---
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1000] flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#F8FAFC] w-full max-w-2xl md:rounded-[3.5rem] rounded-t-[3.5rem] flex flex-col h-[92vh] md:h-auto md:max-h-[90vh] overflow-hidden shadow-2xl">
        
        <div className="shrink-0 bg-white">
          <div className="px-8 pt-8 pb-4 flex justify-between items-center">
            <div>
               <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Confirm Booking</h2>
               <div className={`flex items-center gap-2 mt-1 ${timeLeft < 120 ? 'text-rose-500' : 'text-indigo-600'}`}>
                 <Clock size={12} className="animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Fare Locked: {formatTime(timeLeft)}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><X size={20} /></button>
          </div>
          <ProgressHeader />
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar pb-32">
          {currentStep === 'review' && (
            <>
              <div className="bg-indigo-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div><p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">{flight.airline}</p><p className="text-sm font-bold opacity-70">{flight.flight_number}</p></div>
                    <div className="text-right"><p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Travel Date</p><p className="text-sm font-bold opacity-70">{new Date(flight.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p></div>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1"><h3 className="text-3xl font-black italic tracking-tighter uppercase">{flight.origin}</h3><p className="text-[10px] font-bold opacity-60 uppercase">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                    <div className="flex flex-col items-center gap-1 flex-1"><div className="w-full h-[2px] bg-indigo-400 relative"><Plane size={14} className="absolute left-1/2 -translate-x-1/2 -top-1.5 fill-indigo-900" /></div><span className="text-[8px] font-black uppercase tracking-widest text-indigo-300 mt-1">Non-stop</span></div>
                    <div className="flex-1 text-right"><h3 className="text-3xl font-black italic tracking-tighter uppercase">{flight.destination}</h3><p className="text-[10px] font-bold opacity-60 uppercase">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex justify-between gap-2">
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl"><Luggage size={14} className="text-indigo-300" /><p className="text-[9px] font-black uppercase">{selectedFare.checkin_baggage} Check-in</p></div>
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl"><Briefcase size={14} className="text-indigo-300" /><p className="text-[9px] font-black uppercase">{selectedFare.cabin_baggage} Cabin</p></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fare Selection</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fares.map((fare) => (
                    <button key={fare.type} onClick={() => setSelectedFare(fare)} className={`p-5 rounded-[2rem] border-2 text-left transition-all ${selectedFare.type === fare.type ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-50' : 'border-slate-100 bg-white'}`}>
                      <div className="flex justify-between items-start mb-2"><p className={`text-[10px] font-black uppercase tracking-widest ${selectedFare.type === fare.type ? 'text-indigo-600' : 'text-slate-400'}`}>{fare.type}</p>{selectedFare.type === fare.type && <CheckCircle2 size={16} className="text-indigo-600" />}</div>
                      <p className="text-2xl font-black text-slate-900 italic">₹{fare.price.toLocaleString()}</p>
                      <div className="mt-4 space-y-1.5">{fare.features.map(feat => (<div key={feat} className="flex items-center gap-2"><Zap size={10} className="text-amber-500" fill="currentColor" /><span className="text-[9px] font-bold text-slate-500 uppercase">{feat}</span></div>))}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Total Travelers</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => handleNumPassengersChange(n)} className={`flex-1 py-4 rounded-2xl font-black text-[11px] transition-all ${numPassengers === n ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' : 'bg-white border border-slate-100 text-slate-400'}`}>
                      {n} {n === 1 ? 'Adult' : 'Adults'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 'passengers' && (
            <div className="space-y-6">
               <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100"><Info size={18} className="text-indigo-600" /><p className="text-[11px] font-bold text-indigo-900 leading-tight">Names must match Government ID (Aadhar/Passport) to avoid boarding denial.</p></div>
               {passengers.map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black">0{i+1}</div><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Traveler {i+1}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase ml-2">First Name</p><input required placeholder="eg. JOHN" className="w-full p-4 bg-slate-50 rounded-2xl text-[11px] font-bold uppercase border-none focus:ring-2 focus:ring-indigo-500/20" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} /></div>
                    <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase ml-2">Last Name</p><input required placeholder="eg. DOE" className="w-full p-4 bg-slate-50 rounded-2xl text-[11px] font-bold uppercase border-none focus:ring-2 focus:ring-indigo-500/20" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} /></div>
                  </div>
                  <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase ml-2">Contact</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-2xl text-[11px] font-bold border-none" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                    <input required type="tel" placeholder="WhatsApp Number" className="w-full p-4 bg-slate-50 rounded-2xl text-[11px] font-bold border-none" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                  </div></div>
                </div>
               ))}
            </div>
          )}
          {error && <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600"><AlertCircle size={18} /><p className="text-[11px] font-black uppercase">{error}</p></div>}
        </div>

        <div className="shrink-0 bg-white border-t border-slate-100 p-6 md:p-8 flex items-center justify-between gap-6 shadow-2xl">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
            <p className="text-3xl font-black text-slate-950 italic tracking-tighter">₹{totalPrice.toLocaleString()}</p>
          </div>
          <button onClick={nextStep} disabled={loading || isExpired} className="flex-1 max-w-[200px] bg-slate-950 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>{currentStep === 'review' ? 'Review Info' : 'Pay Now'} <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}