import { Zap, Utensils, Gift } from 'lucide-react';

const TechnicalNotice = () => {
  const scrollText = "✨ UNLOCK UNBEATABLE FARES FOR YOUR NEXT JOURNEY • BOOK UP TO 60 DAYS IN ADVANCE FOR MAXIMUM SAVINGS • THE SKY IS CALLING: AIR INDIA EXPRESS & INDIGO ROUTES NOW FULLY RESTORED • TRAVEL SMARTER, FLY CHEAPER • LIMITED SEATS AT BASE PRICES • ✨ ";

  return (
    <div className="mx-4 md:mx-0 mb-6 overflow-hidden bg-[#0A2351] rounded-[1.5rem] md:rounded-2xl shadow-xl border border-white/10 group">
      
      {/* 1. Header Row - Responsive Flex */}
      <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#0A2351] to-[#163a7a]">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg">
             <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="text-xs md:text-[13px] font-black text-white uppercase tracking-tight">
            Exclusive <span className="text-orange-400">Offer</span>
          </span>
        </div>
        
        {/* Pulsing Reward Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse">
          <Gift size={12} className="text-emerald-400" />
          <span className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-wider">
            Loyalty Perk
          </span>
        </div>
      </div>

      {/* 2. Free Meal Section - Highly Highlighted */}
      <div className="px-5 py-5 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border-y border-emerald-500/20 relative">
        {/* Subtle Background Glow for Mobile */}
        <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/10 blur-2xl rounded-full" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Utensils size={24} className="text-white" />
          </div>
          
          <p className="text-[13px] md:text-sm font-black text-white leading-relaxed md:leading-tight">
            <span className="text-emerald-400 block mb-1 md:inline md:mb-0">
              🍱 LOYALTY REWARD:
            </span>
            {" "} AFTER COMPLETE YOUR <span className="text-white border-b-2 border-emerald-500 pb-0.5">3RD BOOKING</span> AND UNLOCK A 
            <span className="mx-2 bg-emerald-500 text-slate-900 px-3 py-1 rounded shadow-[0_0_15px_rgba(16,185,129,0.4)] italic inline-block transform -rotate-1">
              FREE DELUXE MEAL
            </span> 
            ON YOUR NEXT FLIGHT! ✈️
          </p>
        </div>
      </div>

      {/* 3. Moving Text Loop */}
      <div className="bg-black/20 py-3 relative flex items-center">
        <div className="flex whitespace-nowrap animate-marquee group-hover:pause">
          <span className="text-[10px] md:text-[11px] font-bold text-blue-100/40 uppercase tracking-[0.2em] px-4">
            {scrollText}
          </span>
          <span className="text-[10px] md:text-[11px] font-bold text-blue-100/40 uppercase tracking-[0.2em] px-4">
            {scrollText}
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 35s linear infinite;
        }
        .group-hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default TechnicalNotice;