import React, { useState, useMemo } from 'react';
import { 
  Phone, MessageCircle, Mail, MapPin, ChevronLeft, ShieldCheck, 
  Clock, Headphones, HelpCircle, ChevronDown, ExternalLink, 
  AlertTriangle, LifeBuoy, Zap, Twitter, Instagram, 
  Facebook, Search, PlaneTakeoff, Info, ArrowUpRight,
  ShieldAlert, Send, Fingerprint, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA STRUCTURES ---
const FAQS = [
  {
    id: 1,
    category: "Refunds",
    question: "What is the cancellation policy?",
    answer: "Cancellations made 24 hours before departure are eligible for a partial refund as per airline policies. TripuraFly charges a minimal processing fee of ₹150 for cancellations."
  },
  {
    id: 2,
    category: "Ticketing",
    question: "How do I get my boarding pass?",
    answer: "Once your booking is confirmed, we will send your e-ticket via WhatsApp and Email. You can use the PNR on the airline's website for web check-in 48 hours before flight."
  },
  {
    id: 3,
    category: "Pricing",
    question: "Are there any hidden convenience fees?",
    answer: "No. TripuraFly operates on a transparency model. The price you see on the search results is the final price you pay at checkout."
  },
  {
    id: 4,
    category: "Routes",
    question: "Which routes are currently active?",
    answer: "We currently offer exclusive low-cost booking for Agartala ↔ Kolkata, Bangalore, and Delhi. More routes are being added every month."
  }
];

// --- ANIMATION VARIANTS ---
const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function SupportPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Filter FAQs based on search
  const filteredFaqs = useMemo(() => {
    return FAQS.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleWhatsApp = () => {
    window.open("https://wa.me/919366159066?text=Hi Vivek, I need urgent help with my TripuraFly booking.", "_blank");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 pb-12 font-sans overflow-x-hidden">
      
      {/* --- 1. PREMIUM STICKY NAV --- */}
      <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-slate-50">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ChevronLeft size={22} />
        </motion.button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Concierge Live</span>
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
            <Fingerprint size={18} />
        </motion.div>
      </nav>

      <motion.div 
        variants={containerVar}
        initial="hidden"
        animate="visible"
        className="max-w-xl mx-auto px-6 pt-10"
      >
        
        {/* --- 2. HERO SEARCH --- */}
        <header className="mb-10">
          <motion.div variants={itemVar} className="mb-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              24/7 Global Support
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 leading-[0.95]">
              We're here to <br />
              <span className="text-blue-600">clear the skies.</span>
            </h1>
          </motion.div>
          
          <motion.div variants={itemVar} className="relative">
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isTyping ? 'text-blue-600' : 'text-slate-400'}`}>
              <Search size={20} />
            </div>
            <input 
              type="text"
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              placeholder="Search booking ID or issues..."
              className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-6 pl-14 pr-6 text-sm font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600/20 focus:ring-8 focus:ring-blue-50/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400 hover:text-red-500"
              >
                Clear
              </button>
            )}
          </motion.div>
        </header>

        {/* --- 3. FOUNDER'S PRIORITY BOX (Bento Style) --- */}
        <motion.div 
           variants={itemVar}
           className="mb-12 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-700">
            <Headphones size={150} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 p-0.5 shadow-xl rotate-3">
                <div className="w-full h-full rounded-[1.4rem] overflow-hidden bg-white">
                  <img src="/assets/me.jpg" alt="Vivek Das" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight leading-none">Vivek Das</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                  <ShieldCheck size={12} /> Founder Direct Desk
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
              "Building TripuraFly means taking personal responsibility for your journey. If the automated systems don't solve it, I will."
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={handleWhatsApp} 
                className="flex items-center justify-between p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">WhatsApp</span>
                </div>
                <ArrowUpRight size={16} />
              </motion.button>
              
              <motion.a 
                whileTap={{ scale: 0.97 }}
                href="tel:+919366159066" 
                className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Phone size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Voice Call</span>
                </div>
                <ArrowUpRight size={16} />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* --- 4. QUICK HELP BENTO --- */}
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</h3>
                </div>
                <span className="text-[9px] font-bold text-blue-600">View All</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVar} className="col-span-2 p-6 bg-blue-600 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Flight Sync</p>
                        <h4 className="text-lg font-bold">Live PNR Status</h4>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <PlaneTakeoff size={28} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </motion.div>

                <motion.div variants={itemVar} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm mb-4">
                        <ShieldAlert size={22} />
                    </div>
                    <p className="text-xs font-black mb-1">Refunds</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">7-Day Cycle</p>
                </motion.div>

                <motion.div variants={itemVar} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
                        <Mail size={22} />
                    </div>
                    <p className="text-xs font-black mb-1">Official Mail</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Verified Link</p>
                </motion.div>
            </div>
        </section>

        {/* --- 5. SMART FAQ ACCORDION --- */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6 px-2">
              <HelpCircle size={16} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Knowledge Base</h3>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => (
                <motion.div 
                  layout
                  key={faq.id} 
                  className={`rounded-[2rem] border transition-all duration-300 ${openFaq === faq.id ? 'bg-white border-blue-100 shadow-xl shadow-blue-50' : 'bg-white border-slate-50'}`}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full p-6 flex items-center justify-between text-left"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{faq.category}</span>
                      <span className="text-sm font-bold text-slate-800">{faq.question}</span>
                    </div>
                    <div className={`p-2 rounded-xl transition-all ${openFaq === faq.id ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                      <ChevronDown size={14} />
                    </div>
                  </button>
                  {openFaq === faq.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-6 pb-6 text-xs font-medium text-slate-500 leading-relaxed border-t border-slate-50 pt-4 mt-2">
                        {faq.answer}
                        <div className="mt-4 flex gap-4">
                          <button className="text-[10px] font-black text-blue-600 uppercase">Was this helpful?</button>
                          <button className="text-[10px] font-black text-slate-300 uppercase">Contact Agent</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-slate-400 italic">No matching results found...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* --- 6. EMERGENCY CONTACT FOOTER --- */}
        <footer className="space-y-12">
            <motion.div variants={itemVar} className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm mb-4">
                    <AlertTriangle size={28} className="animate-bounce" />
                </div>
                <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Emergency Hotline</h4>
                <p className="text-[11px] text-rose-600 font-medium mt-2 max-w-[200px]">
                  For bookings within the next 4 hours only. Available 24/7.
                </p>
                <a href="tel:+919366159066" className="mt-6 px-8 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200">
                  Dial Priority Line
                </a>
            </motion.div>

            <div className="flex flex-col items-center gap-8">
                <div className="flex gap-4">
                    {[Twitter, Instagram, Facebook].map((Icon, i) => (
                        <motion.button 
                          whileHover={{ y: -3 }}
                          key={i} 
                          className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 hover:text-blue-600 border border-transparent hover:border-blue-50 transition-all"
                        >
                            <Icon size={20} />
                        </motion.button>
                    ))}
                </div>
                
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full">
                        <MapPin size={12} className="text-slate-400" />
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">Agartala HQ • West Tripura</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900">TripuraFly Aviation Services</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">ISO 27001 Certified Portal • 2026</p>
                    </div>
                </div>
            </div>
        </footer>

      </motion.div>

      {/* --- FLOATING STATUS CHIP (Mobile Only) --- */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden"
      >
        <button className="bg-slate-900 text-white px-6 py-4 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Agent Online</span>
          <div className="w-[1px] h-3 bg-white/20" />
          <Send size={14} className="text-blue-400" />
        </button>
      </motion.div>
    </div>
  );
}