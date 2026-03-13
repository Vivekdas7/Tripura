import { useState } from 'react';
import { 
  Train, MessageSquare, ShieldCheck, 
  Clock, CheckCircle2, Phone, Mail, 
  ChevronRight, Search, Ticket, 
  UserCheck, Headphones, ExternalLink
} from 'lucide-react';

export default function TrainBooking() {
  const WHATSAPP_NUMBER = "919366159066"; // Format: CountryCode + Number
  const WHATSAPP_MESSAGE = encodeURIComponent("Hello EasyMyBook! I want to book a train ticket. Please help me with the availability.");

  const features = [
    { icon: <ShieldCheck className="text-emerald-500" />, label: 'Verified Agent', desc: 'Authorized IRCTC Partner' },
    { icon: <Ticket className="text-blue-500" />, label: 'Instant PNR', desc: 'Get tickets on WhatsApp' },
    { icon: <Clock className="text-amber-500" />, label: 'Tatkal Support', desc: 'Last minute bookings' },
    { icon: <UserCheck className="text-purple-500" />, label: 'Human Help', desc: 'No bots, real experts' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 overflow-x-hidden font-sans">
      {/* --- HERO SECTION --- */}
      <div className="relative pt-16 pb-10 px-6 bg-gradient-to-b from-indigo-50 to-[#F8FAFC]">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Agents Online Now</span>
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Book Train Tickets <br /> 
            <span className="text-indigo-600">On WhatsApp</span>
          </h1>
          
          <p className="text-slate-500 text-sm font-medium max-w-[300px] mx-auto">
            Skip the IRCTC login hassle. Our <b>Verified Agents</b> book your confirmed tickets in minutes.
          </p>

          {/* MAIN CALL TO ACTION */}
          <div className="pt-4">
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
              className="group relative inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-5 rounded-[2rem] font-bold text-lg shadow-[0_20px_40px_rgba(37,211,102,0.3)] hover:scale-105 active:scale-95 transition-all w-full max-w-sm"
            >
              <MessageSquare fill="currentColor" />
              Start Booking Now
              <div className="absolute -top-2 -right-2 bg-rose-500 text-[10px] py-1 px-2 rounded-lg rotate-12 border-2 border-white">
                FASTEST
              </div>
            </a>
            <p className="mt-4 text-[11px] text-slate-400 flex items-center justify-center gap-1 font-bold uppercase tracking-tighter">
              <ShieldCheck size={12} /> IRCTC Authorized Service
            </p>
          </div>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="px-6 grid grid-cols-2 gap-3 mt-4">
        {features.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
              {item.icon}
            </div>
            <h4 className="text-xs font-black text-slate-900 mb-0.5">{item.label}</h4>
            <p className="text-[10px] font-medium text-slate-400 leading-tight">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* --- HOW IT WORKS --- */}
      <div className="px-8 mt-12">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">3 Simple Steps</h3>
        <div className="space-y-6 relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />
          
          {[
            { t: 'Send Details', d: 'Message your journey date and stations.', icon: <Search size={16}/> },
            { t: 'Choose Seat', d: 'Agent shares availability & pricing.', icon: <CheckCircle2 size={16}/> },
            { t: 'Get Ticket', d: 'Pay securely and receive your E-Ticket.', icon: <Ticket size={16}/> },
          ].map((step, i) => (
            <div key={i} className="flex gap-6 relative z-10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                {step.icon}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{step.t}</h4>
                <p className="text-xs text-slate-500 font-medium">{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- SUPPORT CARD --- */}
      <div className="px-6 mt-12">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <Train className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="text-indigo-400" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Help Desk</span>
            </div>
            <h3 className="text-xl font-black mb-6">Need assistance?</h3>
            
            <div className="space-y-3">
              <a href="tel:9366159066" className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-colors">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center"><Phone size={18} /></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Call Support</p>
                  <p className="text-sm font-bold">9366159066</p>
                </div>
              </a>

              <a href="mailto:EasyMyBook.helpdesk@gmail.com" className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-colors">
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center"><Mail size={18} /></div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Email Us</p>
                  <p className="text-sm font-bold truncate">EasyMyBook.helpdesk@gmail.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="mt-12 text-center px-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">EasyMyBook Portal</p>
        <div className="flex justify-center items-center gap-2 text-slate-300">
           <div className="h-px w-8 bg-slate-200" />
           <ShieldCheck size={14} />
           <div className="h-px w-8 bg-slate-200" />
        </div>
      </div>
    </div>
  );
}