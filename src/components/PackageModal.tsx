import React from 'react';
import { X, Calendar, MapPin, CheckCircle2, Phone, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface Package {
  title: string;
  img: string;
  tag: string;
  price: string;
  duration: string;
  features: string[];
}

interface PackageModalProps {
  pkg: Package;
  onClose: () => void;
  onConfirmSubmit: (pkg: Package) => void;
}

const PackageModal = ({ pkg, onClose, onConfirmSubmit }: PackageModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Animated Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[3.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 ease-out max-h-[96vh] flex flex-col border-t border-white/20">
        
        {/* Visual Header */}
        <div className="relative h-56 shrink-0">
          <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover" />
          {/* Top Shadow for close button visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          {/* Bottom Gradient for text separation */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-xl text-white rounded-full hover:bg-white/40 transition-all active:scale-90 z-10 border border-white/30"
          >
            <X size={22} strokeWidth={3} />
          </button>
          
          <div className="absolute bottom-6 left-8">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 border border-indigo-400">
              <Sparkles size={12} fill="currentColor" /> {pkg.tag}
            </div>
          </div>
        </div>

        {/* Scrollable Details Section */}
        <div className="p-8 pt-2 space-y-8 overflow-y-auto no-scrollbar flex-1">
          <div className="space-y-3">
            <h3 className="text-4xl font-black italic text-slate-900 tracking-tighter leading-[0.9]">
              {pkg.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2 text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                <Calendar size={14} /> {pkg.duration}
              </span>
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <MapPin size={14} /> Agartala, Tripura
              </span>
            </div>
          </div>

          {/* Inclusions Grid */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                Experience Highlights
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {pkg.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50/80 p-5 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                    <CheckCircle2 size={16} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Banner */}
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] blur-xl opacity-10" />
            <div className="relative flex items-center gap-4 px-6 py-5 bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] border border-indigo-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-0.5">TripuraFly Verified</p>
                <p className="text-[9px] font-bold text-indigo-700/60 leading-tight">
                  Handpicked local stays and professional guides for a premium trip.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & CTA - Sticky Bottom Logic */}
          <div className="pt-4 space-y-5">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-0.5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fixed Price</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900 uppercase italic">₹</span>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{pkg.price}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black uppercase">All Inclusive</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onConfirmSubmit(pkg)}
              className="w-full bg-slate-900 text-white py-6 rounded-[2.2rem] font-black text-[13px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 shadow-2xl shadow-slate-300 active:scale-[0.96] transition-all hover:bg-indigo-600 group"
            >
              Book via WhatsApp 
              <div className="bg-white/20 p-1 rounded-lg group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </button>
            
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-slate-100" />
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
                Secure Direct Booking
              </p>
              <div className="h-[1px] w-8 bg-slate-100" />
            </div>
          </div>
        </div>

        {/* Safety Spacer for Mobile Gestures */}
        <div className="h-8 bg-white shrink-0 sm:hidden" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default PackageModal;