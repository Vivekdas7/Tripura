import React, { useState } from 'react';
import { 
  Phone, MessageCircle, Mail, MapPin, ChevronLeft, ShieldCheck, 
  Clock, Headphones, HelpCircle, ChevronDown, ExternalLink, 
  AlertTriangle, LifeBuoy, Zap, Share2, Twitter, Instagram, 
  Facebook, Search, PlaneTakeoff, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// FAQ Data Structure
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
    window.open("https://wa.me/919366159066?text=Hi TripuraFly, I need assistance with my booking.", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:support@tripurafly.com?subject=Booking Assistance Required";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* --- 1. PREMIUM HEADER --- */}
      <div className="bg-[#1A1C8B] pt-12 pb-20 px-6 rounded-b-[4rem] text-white shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full -ml-10 -mb-10 blur-2xl" />
        
        <div className="relative max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="mb-8 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-900/20">
                <LifeBuoy size={28} className="text-white animate-pulse" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter">Support Center</h1>
                <p className="text-blue-200 text-sm font-medium">Tripura's most trusted travel desk</p>
             </div>
          </div>

          {/* Search Bar Feature */}
          <div className="mt-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="How can we help you today?"
              className="w-full bg-white/10 border border-white/20 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-bold placeholder:text-blue-200/50 outline-none focus:bg-white focus:text-slate-900 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 space-y-6 max-w-2xl mx-auto">
        
        {/* --- 2. PRIORITY CONTACT CARD (FOUNDER) --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <Headphones size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="bg-orange-50 text-orange-600 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-orange-100">
                Executive Desk
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Vivek Das</h2>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-2">Founder & Support Head</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#1A1C8B] to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={32} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="tel:+919366159066" className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.8rem] hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                <Phone size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Call Now</p>
                <p className="text-sm font-bold text-slate-800">+91 93661 59066</p>
              </div>
            </a>

            <button onClick={handleWhatsApp} className="flex items-center gap-4 p-5 bg-emerald-50 rounded-[1.8rem] hover:bg-emerald-100 transition-all border border-transparent hover:border-emerald-200 group text-left">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                <MessageCircle size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                <p className="text-sm font-bold text-emerald-700">Instant Chat</p>
              </div>
            </button>
          </div>
        </div>

        {/* --- 3. LIVE STATUS TRACKER (NEW FEATURE) --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Zap size={18} className="text-amber-500" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Quick Tracking</h3>
          </div>
          
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-lg relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Check Flight Status</p>
                <h4 className="text-lg font-bold mb-4">Track your journey in real-time</h4>
                <div className="flex gap-2">
                   <input 
                    type="text" 
                    placeholder="Enter PNR or Flight No."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white/20"
                   />
                   <button className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl transition-colors">
                      <PlaneTakeoff size={20} />
                   </button>
                </div>
             </div>
             <div className="absolute right-0 bottom-0 opacity-10 -mr-4 -mb-4 transition-transform group-hover:scale-110 duration-700">
                <PlaneTakeoff size={120} />
             </div>
          </div>
        </section>

        {/* --- 4. FAQ ACCORDION (NEW FEATURE) --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <HelpCircle size={18} className="text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Common Questions</h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <div 
                key={faq.id} 
                className="bg-white rounded-[1.8rem] border border-slate-100 overflow-hidden shadow-sm transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-bold text-slate-700">{faq.question}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`} 
                  />
                </button>
                {openFaq === faq.id && (
                  <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- 5. EMERGENCY & OFFICE INFO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Card */}
          <button 
            onClick={handleEmail}
            className="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Mail size={22} />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">Email Support</h4>
              <p className="text-xs font-bold text-slate-500 mt-0.5">help@tripurafly.com</p>
            </div>
          </button>

          {/* Emergency Card */}
          <div className="bg-rose-50 p-6 rounded-[2.2rem] border border-rose-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="font-black text-rose-900 text-[11px] uppercase tracking-widest">24/7 Hotline</h4>
              <p className="text-xs font-bold text-rose-600 mt-0.5">Critical Issues Only</p>
            </div>
          </div>
        </div>

        {/* Office Location */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-5">
           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
              <MapPin size={28} />
           </div>
           <div>
              <h4 className="font-black text-slate-900 text-sm">Registered Office</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                TripuraFly Headquarters,<br />
                Agartala, West Tripura, 799001
              </p>
              <button className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase mt-3 tracking-widest">
                View on Map <ExternalLink size={10} />
              </button>
           </div>
        </div>

        {/* --- 6. SOCIAL CONNECT --- */}
        <div className="flex flex-col items-center pt-8 space-y-6">
          <div className="flex gap-4">
            {[Twitter, Instagram, Facebook, Share2].map((Icon, i) => (
              <button key={i} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm hover:text-[#1A1C8B] hover:border-blue-100 transition-all">
                <Icon size={20} />
              </button>
            ))}
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
               <ShieldCheck size={14} className="text-emerald-500" />
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Verified Secure Portal</p>
            </div>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
              © 2026 TripuraFly Aviation Services Pvt Ltd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}