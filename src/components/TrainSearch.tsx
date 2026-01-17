import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';

export const TrainSearch = () => (
  <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 -mt-12 relative z-20">
    <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center">
      <div className="md:col-span-3 relative group">
        <label className="absolute top-3 left-12 text-[9px] font-black text-slate-400 uppercase tracking-widest">From Station</label>
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
        <input type="text" placeholder="AGARTALA (AGTL)" className="w-full pl-12 pr-4 pt-8 pb-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl font-bold text-slate-700 outline-none transition-all" />
      </div>
      
      <div className="md:col-span-1 flex justify-center">
        <button className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:rotate-180 transition-all duration-500">
          <ArrowRightLeft size={20} />
        </button>
      </div>

      <div className="md:col-span-3 relative">
        <label className="absolute top-3 left-12 text-[9px] font-black text-slate-400 uppercase tracking-widest">To Station</label>
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
        <input type="text" placeholder="KOLKATA (KOAA)" className="w-full pl-12 pr-4 pt-8 pb-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl font-bold text-slate-700 outline-none transition-all" />
      </div>

      <div className="md:col-span-2 relative">
        <label className="absolute top-3 left-12 text-[9px] font-black text-slate-400 uppercase tracking-widest">Journey Date</label>
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="date" className="w-full pl-12 pr-4 pt-8 pb-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl font-bold text-slate-700 outline-none transition-all" />
      </div>

      <div className="md:col-span-1">
        <button className="w-full h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
          <Search size={24} />
        </button>
      </div>
    </div>
  </div>
);