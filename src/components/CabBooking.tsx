import { useState, useEffect } from 'react';
import { 
  Car, MapPin, Navigation, Clock, ShieldCheck, 
  Smartphone, Phone, Mail, ChevronRight, Zap, 
  Sparkles, Bell, ArrowRight, Heart,
  Headphones
} from 'lucide-react';

export default function CabBooking() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Data for the moving cards
  const cabTypes = [
    { icon: <Zap className="text-amber-500" />, label: 'Mini', desc: 'Affordable daily rides' },
    { icon: <Car className="text-indigo-600" />, label: 'Prime SUV', desc: 'Spacious for families' },
    { icon: <Sparkles className="text-purple-500" />, label: 'Luxury', desc: 'Premium travel experience' },
    { icon: <Navigation className="text-emerald-500" />, label: 'Intercity', desc: 'Outstation trips made easy' },
    { icon: <Clock className="text-rose-500" />, label: 'Rentals', desc: 'Hire by the hour' },
  ];

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setIsSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-10 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <div className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />
        
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 animate-bounce">
            <Car size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Coming Soon</span>
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
            TripuraFly <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Cabs
            </span>
          </h1>
          
          <p className="text-slate-500 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
            We're building the fastest way to get around your city. Stay tuned for the launch!
          </p>
        </div>
      </div>

      {/* --- INFINITE MOVING CARDS --- */}
      <div className="relative py-10 overflow-hidden">
        {/* Gradient Overlays for Fade Effect */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FDFDFF] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FDFDFF] to-transparent z-10" />

        <div className="flex w-fit animate-infinite-scroll">
          {/* Duplicate the list to create a seamless loop */}
          {[...cabTypes, ...cabTypes].map((item, idx) => (
            <div 
              key={idx} 
              className="w-48 mx-3 shrink-0 bg-white p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-1">{item.label}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- NOTIFY FORM --- */}
      <div className="px-6 mt-6">
        <div className="bg-slate-900 rounded-[3rem] p-8 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 opacity-10 rotate-12">
            <MapPin size={120} className="text-white" />
          </div>

          {!isSubscribed ? (
            <form onSubmit={handleNotify} className="relative z-10 space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight">Get Notified First</h3>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-5 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
                Notify Me <Bell size={16} />
              </button>
            </form>
          ) : (
            <div className="relative z-10 text-center py-6 animate-in zoom-in">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white">You're on the list!</h3>
              <p className="text-slate-400 text-xs mt-2">We'll let you know the moment we go live.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- SUPPORT & CONTACT --- */}
      <div className="px-6 mt-12 space-y-6">
        <div className="flex items-center gap-2">
          <Headphones size={18} className="text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Help Center</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <a href="tel:9366159066" className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Phone size={22} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">TripuraFly Care</p>
                <p className="text-base font-black text-slate-900 tracking-tight">9366159066</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </a>

          <a href="mailto:tripurafly.helpdesk@gmail.com" className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600"><Mail size={22} /></div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase">Support Email</p>
                <p className="text-xs font-black text-slate-900 truncate">tripurafly.helpdesk@gmail.com</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </a>
        </div>
      </div>

      {/* --- BRAND FOOTER --- */}
      <div className="mt-16 text-center space-y-4 px-6">
        <div className="flex justify-center gap-6">
           <Smartphone size={20} className="text-slate-300" />
           <Navigation size={20} className="text-slate-300" />
           <Heart size={20} className="text-slate-300" />
        </div>
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Stay Connected with TripuraFly Portal</p>
      </div>

      {/* CSS Animation Logic */}
      <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
}