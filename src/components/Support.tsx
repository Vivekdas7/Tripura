import React, { useState } from 'react';
import { 
  Phone, MessageCircle, Mail, MapPin, ChevronLeft, ShieldCheck, 
  Clock, Headphones, HelpCircle, ChevronDown, ExternalLink, 
  AlertTriangle, LifeBuoy, Zap, Twitter, Instagram, 
  Facebook, Search, PlaneTakeoff, Info, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    id: 1,
    question: "What is the cancellation policy?",
    answer: "Cancellations made 24 hours before departure are eligible for a partial refund as per airline policies. TripuraFly charges a minimal processing fee of ₹150 for cancellations."
  },
  {
    id: 2,
    question: "How do I get my boarding pass?",
    answer: "Once your booking is confirmed, we will send your e-ticket via WhatsApp and Email. You can use the PNR on the airline's website for web check-in 48 hours before flight."
  },
  {
    id: 3,
    question: "Are there any hidden convenience fees?",
    answer: "No. TripuraFly operates on a transparency model. The price you see on the search results is the final price you pay at checkout."
  },
  {
    id: 4,
    question: "Which routes are currently active?",
    answer: "We currently offer exclusive low-cost booking for Agartala ↔ Kolkata, Bangalore, and Delhi. More routes are being added every month."
  }
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleWhatsApp = () => {
    window.open("https://wa.me/919366159066?text=Hi Vivek, I need help with my booking.", "_blank");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 pb-20">
      
      {/* --- 1. MINIMAL STICKY HEADER --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Help Desk</span>
          <span className="text-xs font-bold">TripuraFly Support</span>
        </div>
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <Info size={14} className="text-slate-400" />
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 pt-12">
        
        {/* --- 2. TITLE SECTION --- */}
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tighter mb-4"
          >
            How can we <br /> <span className="text-blue-600 italic">assist your journey?</span>
          </motion.h1>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search bookings, refunds, or baggage..."
              className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-12 pr-4 text-sm font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* --- 3. FOUNDER'S DIRECT LINE --- */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="mb-10 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden"
        >
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 overflow-hidden shadow-lg">
                    {/* Founder Avatar Placeholder */}
                    <img src="/assets/me.jpg" alt="Founder" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight leading-none">Vivek Das</h3>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5">Founder & Lead Concierge</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
            "Your travel safety is my priority. Whether it's a booking delay or a refund query, I'm personally here to ensure you're taken care of."
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleWhatsApp} className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-3xl hover:bg-emerald-100 transition-colors active:scale-95">
              <MessageCircle size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
            </button>
            <a href="tel:+919366159066" className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-3xl hover:bg-blue-100 transition-colors active:scale-95">
              <Phone size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Direct Call</span>
            </a>
          </div>
        </motion.div>

        {/* --- 4. BENTO ACTION GRID --- */}
        <section className="mb-12">
            <div className="flex items-center gap-2 mb-6 px-2">
                <Zap size={16} className="text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-widest">Priority Support</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <PlaneTakeoff size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-tight">Live Flight Tracking</p>
                            <p className="text-[10px] text-white/50 font-medium">Check real-time PNR status</p>
                        </div>
                    </div>
                    <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20">
                        <ArrowUpRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <HelpCircle size={20} className="text-indigo-600 mb-3" />
                        <p className="text-xs font-black mb-1">Refunds</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-tight">Track your <br/>money back</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <Mail size={20} className="text-rose-600 mb-3" />
                        <p className="text-xs font-black mb-1">Email Desk</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-tight">support@<br/>tripurafly.com</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- 5. FAQ SECTION --- */}
        <section className="mb-12">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 px-2">General Assistance</h3>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <div key={faq.id} className="group rounded-[1.8rem] border border-slate-50 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-bold text-slate-700">{faq.question}</span>
                  <div className={`p-2 rounded-xl transition-all ${openFaq === faq.id ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                    <ChevronDown size={14} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === faq.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-xs font-medium text-slate-500 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* --- 6. FOOTER INFO --- */}
        <footer className="text-center space-y-8 mt-20">
            <div className="flex items-center justify-center gap-6">
                {[Twitter, Instagram, Facebook].map((Icon, i) => (
                    <Icon key={i} size={18} className="text-slate-300 hover:text-blue-600 cursor-pointer transition-colors" />
                ))}
            </div>
            
            <div className="bg-slate-50 rounded-3xl p-6 inline-block">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-slate-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Corporate HQ</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400">Agartala, West Tripura, 799001</p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Verified Secure Connection</p>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300">
                    © 2026 TripuraFly Aviation Services Pvt Ltd.
                </p>
            </div>
        </footer>

      </div>
    </div>
  );
}