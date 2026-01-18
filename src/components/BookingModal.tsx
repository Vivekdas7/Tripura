import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall, Wallet, QrCode,
  Download, Camera, Share2, Copy, ExternalLink, ArrowDownCircle
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
    { type: 'Sale', price: flight.price, baggage: '15kg Check-in' },
    
  ];

  const [selectedFare, setSelectedFare] = useState<FareOption>(fares[0]);
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);
  
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          status: 'pending_verification',
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

  // --- PAYMENT SUCCESS SCREEN ---
  if (showSuccess) {
    const totalPrice = selectedFare.price * numPassengers;
    const upiId = "9366159066@ptaxis"; 
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${upiId}%26pn=TripuraFly%26am=${totalPrice}%26cu=INR%26tn=${bookingRef}`;

    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center p-6 overflow-y-auto no-scrollbar pb-20">
        <div className="w-full max-w-md pt-8 space-y-6">
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <QrCode size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Scan to Pay</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Ref ID: {bookingRef}</p>
          </div>

          {/* QR CARD */}
          <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl shadow-indigo-100 relative overflow-hidden text-center">
             <div className="bg-white p-5 rounded-[2.5rem] inline-block mb-6 shadow-xl">
                <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Total Amount</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">₹{totalPrice.toLocaleString()}</p>
             </div>
          </div>

          {/* STEP BY STEP INSTRUCTIONS */}
          <div className="w-full bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2.5rem] p-6 space-y-5 text-left">
             <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200 animate-pulse">
                  <Zap size={22} fill="currentColor" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1.5">Action Required</p>
                   <p className="text-sm font-black text-amber-900 italic tracking-tight">How to complete booking?</p>
                </div>
             </div>

             <div className="space-y-4 pl-1">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[11px] font-black text-amber-800 shrink-0 mt-0.5">1</div>
                  <p className="text-[12px] font-bold text-amber-700 leading-relaxed">
                    Complete the payment of <span className="text-amber-900 font-black">₹{totalPrice.toLocaleString()}</span> using any UPI App.
                  </p>
                </div>
                <div className="flex items-start gap-4 bg-white/50 p-3 rounded-2xl border border-amber-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shrink-0 mt-0.5">2</div>
                  <p className="text-[12px] font-black text-indigo-900 leading-relaxed italic">
                    IMPORTANT: Take a <span className="underline decoration-2">Screenshot</span> of your successful payment page now.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-[11px] font-black text-amber-800 shrink-0 mt-0.5">3</div>
                  <p className="text-[12px] font-bold text-amber-700 leading-relaxed">
                    Click the Green button below to send that screenshot to our WhatsApp.
                  </p>
                </div>
             </div>
          </div>

          {/* WHATSAPP ACTION */}
          <div className="space-y-4 pt-2">
             <a 
               href={`https://wa.me/919366159066?text=Payment Done for Ref: ${bookingRef}. Sending Screenshot...`} 
               target="_blank"
               className="flex flex-col items-center justify-center gap-1 w-full bg-[#25D366] text-white py-5 rounded-[2rem] shadow-xl shadow-green-100 active:scale-[0.97] transition-all"
             >
                <div className="flex items-center gap-2">
                  <MessageSquare size={20} className="fill-current" />
                  <span className="text-xs font-black uppercase tracking-widest">I have paid (WhatsApp)</span>
                </div>
                <p className="text-[8px] font-black text-white/70 uppercase">Send Screenshot in Chat</p>
             </a>

             <button 
                onClick={() => { onBookingComplete(); onClose(); }} 
                className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors"
             >
                Check Status in My Bookings
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[1000] flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-[#F8FAFC] w-full max-w-2xl md:rounded-[3.5rem] rounded-t-[3.5rem] flex flex-col h-[94vh] md:h-auto md:max-h-[92vh] overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="shrink-0 bg-white px-8 pt-10 pb-6 flex justify-between items-center border-b border-slate-100">
           <div>
              <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-2">
                <User size={20} className="text-indigo-600" /> Traveller Details
              </h2>
              <div className={`flex items-center gap-2 mt-1 ${timeLeft < 120 ? 'text-rose-500' : 'text-indigo-600'}`}>
                 <Clock size={12} className="animate-spin-slow" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Time Remaining: {formatTime(timeLeft)}</span>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-40">
          
          {/* TIER SELECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fares.map((fare) => (
              <button
                key={fare.type}
                onClick={() => setSelectedFare(fare)}
                className={`p-5 rounded-[2rem] border-2 text-left transition-all ${
                  selectedFare.type === fare.type ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-50' : 'border-slate-100 bg-white'
                }`}
              >
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{fare.type}</p>
                <p className="text-xl font-black text-slate-900 italic">₹{fare.price.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 opacity-50">
                  <Briefcase size={10} />
                  <p className="text-[8px] font-bold text-slate-500 uppercase">15 kg of check-in baggage</p>
                </div>
              </button>
            ))}
          </div>

          {/* PASSENGER COUNT */}
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">How many guests?</p>
             <div className="flex gap-2">
               {[1, 2, 3, 4].map(n => (
                 <button 
                  key={n} 
                  onClick={() => handleNumPassengersChange(n)} 
                  className={`flex-1 py-4 rounded-2xl font-black text-[11px] transition-all ${numPassengers === n ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.05]' : 'bg-white border border-slate-100 text-slate-400'}`}
                 >
                   0{n}
                 </button>
               ))}
             </div>
          </div>

          {/* DYNAMIC FORMS */}
          <form id="booking-form" onSubmit={handlePayment} className="space-y-8">
            {passengers.map((p, i) => (
              <div key={i} className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-[11px] font-black italic">0{i+1}</div>
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Guest Information</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required placeholder="First Name" className="w-full p-5 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                  <input required placeholder="Last Name" className="w-full p-5 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                </div>
                
                <div className="relative group">
                  <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input required type="tel" placeholder="WhatsApp Number" className="w-full p-5 pl-12 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                </div>
                
                <div className="relative group">
                  <MailIcon size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input required type="email" placeholder="Email Address" className="w-full p-5 pl-12 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                </div>
              </div>
            ))}

            {/* TRUST BANNER */}
            <div className="p-8 bg-indigo-900 rounded-[3rem] shadow-2xl shadow-indigo-100 flex items-center gap-6 relative overflow-hidden group">
               <ShieldCheck size={120} className="absolute -right-5 -top-5 text-white/5 rotate-12" />
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-md">
                  <ShieldCheck size={28} className="text-indigo-300" />
               </div>
               <div className="space-y-1 relative z-10">
                 <p className="text-[10px] font-black text-white uppercase tracking-widest">SkySecure™ Booking</p>
                 <p className="text-[11px] font-bold text-indigo-100/70 leading-relaxed italic">
                   Expert manual verification for every ticket. PNR issued within minutes of payment confirmation.
                 </p>
               </div>
            </div>
          </form>
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 bg-white border-t border-slate-100 p-8 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-[1100]">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fare</p>
              <p className="text-4xl font-black text-slate-950 italic tracking-tighter">
                ₹{(selectedFare.price * numPassengers).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 mb-1 shadow-sm shadow-emerald-100">
                 <Zap size={10} fill="currentColor" />
                 <span className="text-[9px] font-black uppercase tracking-tighter">Best Price</span>
              </div>
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Inc. Taxes</p>
            </div>
          </div>
          
          <button 
            form="booking-form"
            type="submit" 
            disabled={loading || isExpired} 
            className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-300 disabled:opacity-40 transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 <span>Verifying...</span>
              </div>
            ) : (
              <>
                Confirm Booking <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}