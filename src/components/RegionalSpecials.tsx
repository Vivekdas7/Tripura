import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Clock, ShieldCheck, 
  HelpCircle, ChevronRight, Ban, Wallet, 
  Banknote, Receipt, MessageCircle, Info
} from 'lucide-react';

export default function RefundDetailPortal() {
  const [activeTab, setActiveTab] = useState('track');
  const [pnr, setPnr] = useState('');

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
      {/* --- STICKY MODERN HEADER --- */}
      <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-100 rounded-full active:scale-90 transition-transform">
            <ArrowLeft size={20} className="text-slate-900" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
            Sky<span className="text-blue-600">Care</span>
          </h1>
        </div>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <MessageCircle size={20} />
        </div>
      </div>

      {/* --- QUICK ACTIONS TABS --- */}
      <div className="px-6 mt-6">
        <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1">
          <button 
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'track' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Track Refund
          </button>
          <button 
            onClick={() => setActiveTab('policy')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'policy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Policies
          </button>
        </div>
      </div>

      {activeTab === 'track' ? (
        <div className="px-6 py-8 animate-in fade-in duration-500">
          {/* --- SEARCH BOX --- */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Check Status</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter PNR or Booking ID</p>
            </div>
            <div className="relative mb-4">
              <input 
                type="text"
                placeholder="ABC123XYZ"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 text-lg font-black tracking-widest focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 active:scale-[0.98] transition-all">
              Track Refund Progress
            </button>
          </div>

          {/* --- REFUND TIMELINE (VISUALIZER) --- */}
          
          <div className="mb-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Typical Timeline</h3>
            <div className="space-y-0 relative before:content-[''] before:absolute before:left-7 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {[
                { title: 'Cancellation Confirmed', time: 'Instant', icon: <Ban size={14}/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { title: 'Airline Verification', time: '12 - 24 Hours', icon: <ShieldCheck size={14}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
                { title: 'Bank Processing', time: '3 - 5 Working Days', icon: <Banknote size={14}/>, color: 'text-slate-400', bg: 'bg-slate-50' }
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-6 mb-8 relative z-10">
                  <div className={`w-14 h-14 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center border-4 border-white shadow-sm`}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none mb-1">{step.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-8 animate-in slide-in-from-right duration-500">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 space-y-4">
             {[
               { icon: <Receipt className="text-orange-500" />, title: 'Fare Type: Saver', desc: 'Non-refundable if cancelled within 2 hours.' },
               { icon: <Wallet className="text-blue-500" />, title: 'Wallet Refund', desc: 'Instant credit to your SkyWallet for future use.' },
               { icon: <Info className="text-slate-500" />, title: 'Partial Refunds', desc: 'Only valid for segments not yet flown.' }
             ].map((p, i) => (
               <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="mt-1">{p.icon}</div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-tight">{p.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{p.desc}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* --- FIXED SUPPORT BAR (MOBILE ONLY) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex gap-4">
        <button className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
          Contact Support
        </button>
        <button className="flex-1 bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center">
          FAQs
        </button>
      </div>
    </div>
  );
}