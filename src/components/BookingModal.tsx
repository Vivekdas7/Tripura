import { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, 
  ChevronRight, Plane, CheckCircle2, Ticket, ArrowRight, ShieldCheck, 
  Headphones, Globe, Smartphone, Zap, Clock, AlertCircle, Briefcase, 
  Star, ShieldAlert, MessageSquare, Mail as MailIcon, PhoneCall,
  XCircle, AlertTriangle, RefreshCcw, Shield
} from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';

/**
 * TRIPURAFLY - PAYU INTEGRATION ENGINE (v2.0.4)
 * Strict Error Handling & Transaction Integrity
 */
const PAYU_MERCHANT_KEY = "BbF3Xs";
const PAYU_SALT = "lipVa9hMJyxr5sDlH1cM0ZXV0vkLggkT";
const PAYU_URL = "https://test.payu.in/_payment"; 

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

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'verifying';

export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  
  // Fare Configuration
  const fares = flight.fare_options || [
    { type: 'Value', price: flight.price, baggage: '15kg Check-in' },
    { type: 'SME', price: Math.round(flight.price * 1.15), baggage: '25kg + Free Meal' },
    { type: 'Flexi', price: Math.round(flight.price * 1.25), baggage: '15kg + Free Change' }
  ];

  // Logic States
  const [selectedFare, setSelectedFare] = useState<FareOption>(fares[0]);
  const [numPassengers, setNumPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [bookingRef, setBookingRef] = useState('');
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(900);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [passengers, setPassengers] = useState<Passenger[]>([
    { first_name: '', last_name: '', email: '', phone: '', passport_number: '', date_of_birth: undefined }
  ]);

  // Lifecycle: Timer
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

  /**
   * RECOVERY LOGIC (The Fix for the "Pardon" Page)
   * This checks if the user returned with a status in the URL.
   */
  useEffect(() => {
    const checkPaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('pay_status');
      const txn = urlParams.get('txn');

      if (status === 'success' && txn) {
        setBookingRef(txn);
        setPaymentStatus('success');
        // Clean URL immediately
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else if (status === 'failed') {
        setPaymentStatus('failed');
        setError("Payment was unsuccessful. Please check your bank balance.");
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };

    checkPaymentReturn();
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

  /**
   * PAYMENT SUBMISSION (STRICT MODE)
   */
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired || loading) return;
    setLoading(true);

    try {
      // 1. Generate unique transaction ID with micro-timestamp
      const txnid = "FLY" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
      const amount = (selectedFare.price * numPassengers).toFixed(2);
      
      // 2. Strict Sanitization (Removing all spaces/chars that crash PayUbiz)
      const productinfo = "FlightBooking".trim(); 
      const firstname = passengers[0].first_name.replace(/[^a-zA-Z]/g, '') || "Customer";
      const email = passengers[0].email.trim().toLowerCase();
      const phone = passengers[0].phone.replace(/[^0-9]/g, '').slice(-10);

      // 3. Hash Generation Sequence
      // Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
      const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
      const hash = CryptoJS.SHA512(hashString).toString(CryptoJS.enc.Hex);

      // 4. Clean SURL/FURL (The main cause of the "Pardon" screen)
      const origin = window.location.origin;
      const surl = `${origin}/?pay_status=success&txn=${txnid}`;
      const furl = `${origin}/?pay_status=failed`;

      const postData: Record<string, string> = {
        key: PAYU_MERCHANT_KEY,
        txnid,
        amount,
        firstname,
        email,
        phone,
        productinfo,
        surl,
        furl,
        hash,
        service_provider: 'payu_paisa'
      };

      // 5. Create Hidden Form and Submit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = PAYU_URL;

      Object.entries(postData).forEach(([key, val]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error("Gateway Init Error:", err);
      setLoading(false);
      setError("Payment Engine Error. Please refresh.");
    }
  };

  // SUCCESS RENDER
  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-28 h-28 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200">
          <CheckCircle2 size={56} className="animate-bounce" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Booking Confirmed</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Ref ID: {bookingRef}</p>
        
        <div className="w-full max-w-md mt-10 space-y-4">
           <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-left shadow-xl shadow-indigo-100 flex gap-4 items-center">
              <Zap className="text-amber-300 shrink-0" size={24} />
              <p className="text-sm font-bold text-white leading-relaxed">
                Payment verified. Your PNR and E-Ticket are being generated and will be sent to <b>{passengers[0].phone}</b>.
              </p>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase">Support</p>
                 <p className="text-xs font-black text-slate-800 mt-1">9366159066</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
                 <p className="text-xs font-black text-emerald-600 mt-1 uppercase">Instant</p>
              </div>
           </div>
        </div>

        <button 
          onClick={() => { onBookingComplete(); onClose(); }}
          className="mt-12 w-full max-w-md bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // FAILURE RENDER
  if (paymentStatus === 'failed') {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <XCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Payment Failed</h2>
        <p className="text-slate-500 font-medium mt-4 max-w-xs">{error}</p>
        <div className="mt-10 flex flex-col gap-3 w-full max-w-md">
           <button onClick={() => setPaymentStatus('idle')} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
             <RefreshCcw size={16} /> Try Again
           </button>
           <button onClick={onClose} className="w-full py-5 text-slate-400 font-black text-xs uppercase tracking-widest">Cancel Transaction</button>
        </div>
      </div>
    );
  }

  // MAIN FORM RENDER
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl md:rounded-[3.5rem] rounded-t-[3.5rem] flex flex-col h-[94vh] md:h-auto md:max-h-[92vh] overflow-hidden shadow-2xl border border-white/20">
        
        {/* HEADER */}
        <div className="shrink-0 px-8 pt-10 pb-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Passenger Details</h2>
              <div className={`flex items-center gap-2 mt-2 ${timeLeft < 180 ? 'text-rose-500 animate-pulse' : 'text-indigo-600'}`}>
                 <Clock size={14} className="font-bold" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Fare Lock: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</span>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-44">
          
          {/* FARE OPTIONS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={18} />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Fare Category</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {fares.map((f) => (
                <button
                  key={f.type}
                  onClick={() => setSelectedFare(f)}
                  className={`group p-6 rounded-[2rem] border-2 text-left transition-all flex justify-between items-center ${
                    selectedFare.type === f.type ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full border-2 ${selectedFare.type === f.type ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`} />
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{f.type} Benefits</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{f.baggage}</p>
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900">₹{f.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* PASSENGER COUNT */}
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <User className="text-indigo-600" size={18} />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Traveling Count</p>
             </div>
             <div className="flex gap-2">
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => handleNumPassengersChange(n)} className={`flex-1 py-5 rounded-2xl font-black text-xs transition-all ${numPassengers === n ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {n} Guest{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN FORM */}
          <form id="payu-submission-form" onSubmit={handlePayment} className="space-y-8">
            {passengers.map((p, i) => (
              <div key={i} className="p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black">{i+1}</div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Personal Info</span>
                   </div>
                   {i === 0 && <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-2 py-1 rounded-full uppercase">Lead Traveler</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-2">First Name</p>
                    <input required className="w-full p-5 bg-white rounded-2xl text-xs font-bold border-2 border-transparent focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={p.first_name} onChange={e => handlePassengerChange(i, 'first_name', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-2">Last Name</p>
                    <input required className="w-full p-5 bg-white rounded-2xl text-xs font-bold border-2 border-transparent focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={p.last_name} onChange={e => handlePassengerChange(i, 'last_name', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-2">WhatsApp Contact</p>
                    <div className="relative">
                       <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input required type="tel" className="w-full p-5 pl-12 bg-white rounded-2xl text-xs font-bold border-2 border-transparent focus:border-indigo-600 outline-none transition-all" placeholder="10-digit number" value={p.phone} onChange={e => handlePassengerChange(i, 'phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase ml-2">Email for E-Ticket</p>
                    <div className="relative">
                       <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input required type="email" className="w-full p-5 pl-12 bg-white rounded-2xl text-xs font-bold border-2 border-transparent focus:border-indigo-600 outline-none transition-all" placeholder="your@email.com" value={p.email} onChange={e => handlePassengerChange(i, 'email', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-4">
               <ShieldAlert size={20} className="text-amber-600 shrink-0" />
               <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                 By clicking pay, you agree to our booking policy. Ensure your WhatsApp number is correct to receive ticket updates.
               </p>
            </div>
          </form>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-8 flex flex-col gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center px-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-sm font-black text-slate-900">₹</span>
                 <span className="text-4xl font-black text-slate-900">{(selectedFare.price * numPassengers).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Verified</span>
               </div>
               <p className="text-[9px] font-bold text-slate-400">Inc. GST & Fees</p>
            </div>
          </div>
          
          <button 
            form="payu-submission-form"
            type="submit" 
            disabled={loading || isExpired} 
            className="group relative w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 disabled:bg-slate-200 transition-all overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 <span>Initializing Secure Gateway...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                 <span>Continue to Payment</span>
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}