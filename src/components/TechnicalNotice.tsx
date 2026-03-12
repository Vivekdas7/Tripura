import React from 'react';
import { MessageCircle, Users, ChevronRight, ExternalLink } from 'lucide-react';

const WhatsAppBookingNotice = () => {
  const phoneNumber = "+917629812973";
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=Hi, I've 2+ passengers and would like to book.`;

  return (
    <div className="mx-3 my-4 overflow-hidden bg-[#0F172A] rounded-2xl border border-white/5 shadow-2xl">
      
      {/* Top Accent Bar - Now Green for WhatsApp Theme */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Icon & Main Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <MessageCircle size={20} className="text-emerald-400 fill-emerald-400/10" />
              </div>
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-lg">
                <Users size={10} className="text-slate-900" />
              </div>
            </div>

            <div>
              <h3 className="text-[13px] md:text-sm font-bold text-white leading-tight">
                Direct WhatsApp Booking
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Text <span className="text-emerald-400 font-bold">‪+91 76298 12973‬</span>
              </p>
            </div>
          </div>

          {/* Right: CTA */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
          >
            <span className="text-[11px] font-bold uppercase tracking-tight">Book Now</span>
            <ChevronRight size={14} />
          </a>
        </div>
      </div>

      {/* Ultra-slim Footer Strip */}
      <div className="bg-white/[0.03] px-4 py-1.5 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-2 items-center">
           <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-white/5 rounded">PREFER: 2+ PASSENGERS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</span>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppBookingNotice;