import { useState } from 'react';
import { Search, Calendar, ArrowLeftRight } from 'lucide-react';

type SearchFilters = {
  origin: string;
  destination: string;
  date: string;
};

type FlightSearchProps = {
  onSearch: (filters: SearchFilters) => void;
};

export default function FlightSearch({ onSearch }: FlightSearchProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ origin, destination, date });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch gap-4">
        
        {/* Origin and Destination Wrapper */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-0">
          
          {/* FROM */}
          <div className="relative group">
            <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 z-10">
              From
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origin City"
              className="w-full pl-4 pr-4 pt-6 pb-2 bg-slate-50 border-2 border-transparent rounded-2xl md:rounded-r-none md:border-r-slate-200 focus:bg-white focus:border-orange-500 transition-all outline-none font-bold text-slate-800"
            />
          </div>

          {/* SWAP BUTTON */}
          <div className="relative flex justify-center z-30 -my-2 md:my-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 bg-white border border-slate-200 rounded-full shadow-md text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-all hover:rotate-180 duration-500 group"
              title="Swap Locations"
            >
              <ArrowLeftRight size={18} className="group-active:scale-75 transition-transform" />
            </button>
          </div>

          {/* TO */}
          <div className="relative">
            <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 z-10">
              To
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination City"
              className="w-full pl-4 pr-4 pt-6 pb-2 bg-slate-50 border-2 border-transparent rounded-2xl md:rounded-l-none focus:bg-white focus:border-orange-500 transition-all outline-none font-bold text-slate-800"
            />
          </div>
        </div>

        {/* DATE PICKER */}
        <div className="relative min-w-[180px]">
          <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 z-10 flex items-center gap-1">
            <Calendar size={10} /> Departure
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full pl-4 pr-4 pt-6 pb-2 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all outline-none font-bold text-slate-800 appearance-none"
          />
        </div>

        {/* SEARCH BUTTON */}
        <button
          type="submit"
          className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-900 transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Search size={20} strokeWidth={3} />
          Search Flights
        </button>
      </form>
    </div>
  );
}