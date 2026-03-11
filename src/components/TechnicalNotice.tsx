import React from 'react';
import { Zap, IndianRupee, ChevronRight } from 'lucide-react';

const CompactTechnicalNotice = () => {
  return (
    <div className="mx-3 my-4 overflow-hidden bg-[#0F172A] rounded-2xl border border-white/5 shadow-2xl">
      
      {/* Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Icon & Main Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <IndianRupee size={20} className="text-blue-400" />
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                <Zap size={10} className="text-slate-900 fill-slate-900" />
              </div>
            </div>

            <div>
              <h3 className="text-[13px] md:text-sm font-bold text-white leading-tight">
                ₹50 Instant Cashback
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Auto-credited via <span className="text-blue-400">UPI</span> on 1st booking
              </p>
            </div>
          </div>

          {/* Right: CTA */}
          <button className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95">
            <span className="text-[11px] font-bold uppercase tracking-tight">Claim</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Ultra-slim Footer Strip */}
      <div className="bg-white/[0.03] px-4 py-1.5 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-3 items-center opacity-50">
           <span className="text-[9px] font-bold text-slate-300">GPAY</span>
           <span className="text-[9px] font-bold text-slate-300">PHONEPE</span>
           <span className="text-[9px] font-bold text-slate-300">PAYTM</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-500 uppercase">Auto-Apply Active</span>
        </div>
      </div>
    </div>
  );
};

export default CompactTechnicalNotice;