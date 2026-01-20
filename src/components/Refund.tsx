import React, { useState } from 'react';
import { 
  ChevronRight, RefreshCcw, ShieldCheck, Clock, 
  HelpCircle, ArrowLeft, Search, AlertCircle 
} from 'lucide-react';

const REFUND_POLICIES = [
  {
    title: "Cancellation Timelines",
    content: "Cancellations made 24 hours before departure incur standard airline fees. Within 2 hours of departure, tickets are generally non-refundable (No-Show)."
  },
  {
    title: "Instant Refund Policy",
    content: "Refunds to your 'SkyWallet' are processed within 15 minutes. Source account refunds (Bank/UPI) typically take 3-5 business days."
  },
  {
    title: "Convenience Fee",
    content: "Please note that the initial convenience fee charged at the time of booking is non-refundable."
  }
];

export default function RefundPage() {
  const [pnr, setPnr] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* 1. HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-800" />
          </button>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">
            Refund <span className="text-blue-600">Portal</span>
          </h1>
        </div>
      </div>

      {/* 2. TRACK REFUND CARD */}
      <div className="p-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Search size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Track Refund</h2>
              <p className="text-xs text-slate-500 font-medium">Enter your PNR to check status</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter PNR Number"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
              />
            </div>
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-transform">
              Check Status
            </button>
          </div>
        </div>

        {/* 3. INDUSTRY STANDARDS (2026) */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
            <ShieldCheck className="text-emerald-600 mb-2" size={20} />
            <h3 className="text-xs font-bold text-emerald-900 uppercase">100% Secure</h3>
            <p className="text-[10px] text-emerald-700 font-medium leading-tight">Direct bank transfers</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
            <Clock className="text-blue-600 mb-2" size={20} />
            <h3 className="text-xs font-bold text-blue-900 uppercase">Fast Process</h3>
            <p className="text-[10px] text-blue-700 font-medium leading-tight">Within 3-5 bank days</p>
          </div>
        </div>

        {/* 4. POLICY ACCORDION */}
        <div className="mt-10">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
            Cancellation Policies
          </h3>
          <div className="space-y-3">
            {REFUND_POLICIES.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                  <HelpCircle size={16} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. SUPPORT BOX */}
        <div className="mt-8 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black italic mb-2 tracking-tighter">NEED ASSISTANCE?</h3>
            <p className="text-xs text-slate-400 font-bold mb-6">Our 24/7 support desk is ready to help you with stuck refunds.</p>
            <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              Chat With Us <RefreshCcw size={14} />
            </button>
          </div>
          <AlertCircle className="absolute -bottom-4 -right-4 text-white/5" size={120} />
        </div>

        {/* 6. LEGAL FOOTNOTE */}
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-10">
          Terms & Conditions Apply • © 2026 SkyInd Live
        </p>
      </div>
    </div>
  );
}