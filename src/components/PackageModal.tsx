import React from 'react';
import { X, Calendar, MapPin, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Map, BedDouble, Coffee } from 'lucide-react';

interface ItineraryStep {
  day: string;
  title: string;
  hotel: string;
  img: string;
  desc: string;
  highlights: string[];
}

interface Package {
  packageTitle: string;
  totalPrice: string;
  totalDuration: string;
  description: string;
  itinerary: ItineraryStep[];
  inclusions: string[];
}

interface PackageModalProps {
  pkg: Package;
  onClose: () => void;
  onConfirmSubmit: (pkg: Package) => void;
}

const PackageModal = ({ pkg, onClose, onConfirmSubmit }: PackageModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out max-h-[96vh] flex flex-col border border-white/10 overflow-hidden">
        
        {/* Header Image - Fixed Height */}
        <div className="relative h-56 shrink-0">
          <img src={pkg.itinerary[0].img} alt={pkg.packageTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 bg-black/50 backdrop-blur-md text-white rounded-full border border-white/20 active:scale-90 transition-all z-50"
          >
            <X size={18} />
          </button>
          
          <div className="absolute bottom-5 left-6">
            <div className="inline-flex items-center gap-2 bg-orange-600 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
              <Sparkles size={10} fill="currentColor" /> {pkg.totalDuration} Premium Trip
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto no-scrollbar flex-1 bg-slate-900">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Title Section */}
            <div className="space-y-3">
              <h3 className="text-3xl font-black italic text-white tracking-tighter leading-tight uppercase">
                {pkg.packageTitle}
              </h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                {pkg.description}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                  <Map size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Destinations</p>
                  <p className="text-xs font-black text-white">{pkg.itinerary.length} Spots</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Verified</p>
                  <p className="text-xs font-black text-white">Full Access</p>
                </div>
              </div>
            </div>

            {/* Detailed Itinerary Timeline */}
            <div className="space-y-6">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-6 h-[1px] bg-orange-500/40" />
                Your Detailed Plan
              </p>
              
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                {pkg.itinerary.map((day, i) => (
                  <div key={i} className="relative pl-12">
                    {/* Timeline Number Circle */}
                    <div className="absolute left-0 top-0.5 w-9 h-9 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center text-[11px] font-black text-white z-10 shadow-lg group-hover:border-orange-500 transition-colors">
                      {i + 1}
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-md font-bold text-white tracking-tight">{day.title}</h4>
                        <span className="text-[8px] font-black text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded">{day.day}</span>
                      </div>

                      {/* Hotel Highlight */}
                      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                        <BedDouble size={11} className="text-orange-500" />
                        <span className="text-[9px] font-bold text-slate-300">Stay: {day.hotel}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {day.highlights.map((tag, idx) => (
                          <span key={idx} className="text-[8px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusion Summary Box */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-5 space-y-4">
               <h4 className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Coffee size={12} /> Package Inclusions
               </h4>
               <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {pkg.inclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={10} className="text-emerald-500/60" />
                      <span className="text-[10px] font-bold text-slate-400">{item}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Extra Spacer to prevent overlapping with footer */}
            <div className="h-12" />
          </div>
        </div>

        {/* Updated Sticky Footer Layout */}
        <div className="shrink-0 bg-slate-900 border-t border-white/10 p-5 pb-8 sm:pb-5 backdrop-blur-3xl">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Grand Total</span>
              <div className="flex items-center gap-1">
                <span className="text-white text-xs font-bold mt-1">₹</span>
                <span className="text-3xl font-black text-white tracking-tighter italic">{pkg.totalPrice}</span>
              </div>
            </div>
            
            <button 
              onClick={() => onConfirmSubmit(pkg)}
              className="flex-1 max-w-[200px] bg-orange-600 hover:bg-orange-500 text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-orange-950/40 transition-all active:scale-95"
            >
              Confirm Booking
              <ArrowRight size={16} />
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