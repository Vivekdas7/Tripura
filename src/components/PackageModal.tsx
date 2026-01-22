import React from 'react';
import { X, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Map, BedDouble, Coffee, Info, MapPinned } from 'lucide-react';

interface ItineraryStep {
  day: string;
  title: string;
  hotel: string;
  img: string;
  highlights: string[];
}

interface Package {
  packageTitle: string;
  totalPrice: string;
  totalDuration: string;
  description: string;
  itinerary: ItineraryStep[];
  inclusions: string[];
  exclusions: string[];
  hotelDisclaimer: string;
}

interface PackageModalProps {
  pkg: Package;
  onClose: () => void;
  onConfirmSubmit: (pkg: Package) => void;
}

const PackageModal = ({ pkg, onClose, onConfirmSubmit }: PackageModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop with enhanced blur */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out max-h-[96vh] flex flex-col border border-white/10 overflow-hidden">
        
        {/* Header Hero Image */}
        <div className="relative h-60 md:h-64 shrink-0">
          <img 
            src={pkg.itinerary[0].img} 
            alt={pkg.packageTitle} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md text-white rounded-2xl border border-white/20 active:scale-90 transition-all z-50"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 bg-orange-600 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                <Sparkles size={10} fill="currentColor" /> {pkg.totalDuration} Premium Trip
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-tight w-fit">
                <ShieldCheck size={10} /> TTDCL Verified Portal
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto no-scrollbar flex-1 bg-slate-900">
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Title & Description */}
            <div className="space-y-3">
              <h3 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter leading-tight uppercase">
                {pkg.packageTitle}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                {pkg.description}
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                  <Map size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Route</p>
                  <p className="text-xs font-black text-white">{pkg.itinerary.length} Destinations</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <MapPinned size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Type</p>
                  <p className="text-xs font-black text-white">Full Circuit</p>
                </div>
              </div>
            </div>

            {/* Visual Itinerary Timeline */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-6 h-[1px] bg-orange-500/40" />
                  Detailed Itinerary
                </p>
              </div>
              
              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-orange-500/40 before:to-transparent">
                {pkg.itinerary.map((day, i) => (
                  <div key={i} className="relative pl-12 group">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1 w-10 h-10 bg-slate-800 rounded-2xl border-2 border-slate-700 flex items-center justify-center text-[12px] font-black text-white z-10 shadow-xl group-hover:border-orange-500 transition-colors">
                      {i + 1}
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[2rem] space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{day.title}</h4>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{day.day}</span>
                        </div>
                        {/* Day Specific Thumbnail */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl">
                           <img src={day.img} alt={day.title} className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {day.hotel !== "None" && (
                          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl self-start">
                            <BedDouble size={12} className="text-orange-500" />
                            <span className="text-[10px] font-bold text-slate-300">Stay: {day.hotel}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {day.highlights.map((tag, idx) => (
                            <span key={idx} className="text-[8px] font-black text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-white/5 uppercase">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Inclusions */}
               <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 space-y-4">
                  <h4 className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} /> What's Included
                  </h4>
                  <div className="space-y-2.5">
                     {pkg.inclusions.map((item, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                         <span className="text-[11px] font-bold text-slate-300">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Exclusions */}
               <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2rem] p-6 space-y-4">
                  <h4 className="text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <X size={14} /> Not Included
                  </h4>
                  <div className="space-y-2.5">
                     {pkg.exclusions?.map((item, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500/40" />
                         <span className="text-[11px] font-bold text-slate-400">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* TTDCL Policy Disclaimer */}
            {pkg.hotelDisclaimer && (
              <div className="flex gap-4 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem]">
                <Info size={18} className="text-indigo-400 shrink-0" />
                <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                  <span className="text-indigo-400 font-black uppercase not-italic block mb-1">Official Policy:</span>
                  {pkg.hotelDisclaimer}
                </p>
              </div>
            )}

            <div className="h-16" /> 
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 bg-slate-900 border-t border-white/10 p-6 pb-10 sm:pb-6 backdrop-blur-3xl">
          <div className="flex items-center justify-between gap-6 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Package</span>
              <div className="flex items-center gap-1">
                <span className="text-white text-sm font-bold">₹</span>
                <span className="text-4xl font-black text-white tracking-tighter italic leading-none">{pkg.totalPrice}</span>
              </div>
            </div>
            
            <button 
              onClick={() => onConfirmSubmit(pkg)}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white h-16 rounded-3xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-orange-950/40 transition-all active:scale-95 group"
            >
              Confirm Booking
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default PackageModal;