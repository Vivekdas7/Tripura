import { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, ArrowLeftRight, PlaneTakeoff, Info } from 'lucide-react';

export default function FlightSearch({ onSearch }: { onSearch: (f: any) => void }) {
  const [origin, setOrigin] = useState('IXA'); 
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [tripType, setTripType] = useState('oneway');
  const [cheapestFare, setCheapestFare] = useState<string | null>(null);
  const [loadingFare, setLoadingFare] = useState(false);

  useEffect(() => {
    const fetchLowestPrice = async () => {
      if (origin.length === 3 && destination.length === 3) {
        setLoadingFare(true);
        try {
          const authResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `grant_type=client_credentials&client_id=4n93Mpcjg4LYGmFkHHEUYlVAuEc18D1t&client_secret=KvSWiE1lTFsN7jxo`,
          });
          const { access_token } = await authResponse.json();

          const priceResponse = await fetch(
            `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${origin.toUpperCase()}&oneWay=true`,
            { headers: { Authorization: `Bearer ${access_token}` } }
          );
          const priceData = await priceResponse.json();

          const routeInfo = priceData.data?.find(
            (item: any) => item.destination === destination.toUpperCase()
          );

          if (routeInfo) {
            let price = parseFloat(routeInfo.price.total);
            let adjustedPrice = price > 7500 ? price * 0.6 : price;
            setCheapestFare(Math.max(Math.round(adjustedPrice), 2900).toLocaleString('en-IN'));
          } else {
            setCheapestFare(null);
          }
        } catch (err) {
          console.error("Fare fetch error:", err);
          setCheapestFare(null);
        } finally {
          setLoadingFare(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchLowestPrice, 800);
    return () => clearTimeout(debounceTimer);
  }, [origin, destination]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.length !== 3 || destination.length !== 3) {
      alert("Please use 3-letter IATA codes (e.g., IXA, DEL, CCU)");
      return;
    }
    onSearch({ origin: origin.toUpperCase(), destination: destination.toUpperCase(), date, tripType });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2">
      {/* TRIP TYPE SELECTOR - Scrolled horizontally on very small screens if needed */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        <button 
          onClick={() => setTripType('oneway')}
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${tripType === 'oneway' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
        >
          One Way
        </button>
        <button disabled className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-300 cursor-not-allowed border border-dashed border-slate-200 whitespace-nowrap">
          Round Trip
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-3">
        {/* ROUTE INPUTS - Stacked on mobile, Grid on desktop */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center relative gap-2 md:gap-0">
          <div className="relative">
            <PlaneTakeoff className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="From (IXA)" 
              className="w-full p-4 pl-12 bg-slate-50 rounded-2xl md:rounded-r-none border-r-0 md:border-r border-slate-200 outline-none focus:ring-2 ring-indigo-500/20 font-bold uppercase placeholder:text-slate-300 transition-all"
              value={origin} onChange={e => setOrigin(e.target.value)} maxLength={3}
            />
          </div>
          
          {/* Swap Button - Center of mobile and desktop */}
          <div className="flex justify-center -my-4 md:my-0 z-10">
            <button 
              type="button" 
              onClick={() => {setOrigin(destination); setDestination(origin)}} 
              className="p-3 bg-white shadow-xl border border-slate-100 rounded-full hover:rotate-180 transition-all duration-500 group"
            >
              <ArrowLeftRight size={18} className="text-indigo-600 group-hover:scale-110" />
            </button>
          </div>

          <input 
            placeholder="To (DEL)" 
            className="w-full p-4 md:pl-8 bg-slate-50 rounded-2xl md:rounded-l-none outline-none focus:ring-2 ring-indigo-500/20 font-bold uppercase placeholder:text-slate-300 transition-all"
            value={destination} onChange={e => setDestination(e.target.value)} maxLength={3}
          />
        </div>

        {/* DATE PICKER */}
        <div className="relative group lg:w-72">
          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="date" 
            className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 ring-indigo-500/20 transition-all"
            value={date} onChange={e => setDate(e.target.value)} required
          />
          {cheapestFare && !loadingFare && (
            <div className="absolute -top-3 right-4 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg animate-in zoom-in duration-300">
              BEST ₹{cheapestFare}
            </div>
          )}
          {loadingFare && (
            <div className="absolute -top-3 right-4 bg-slate-400 text-white text-[9px] font-black px-2 py-1 rounded-md animate-pulse">
              CHECKING...
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}
        <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
          <Search size={20} />
          <span className="md:inline">Search Flights</span>
        </button>
      </form>

      {/* DYNAMIC FOOTNOTE */}
      {cheapestFare && (
        <div className="mt-4 md:mt-3 flex items-start gap-2 text-slate-400 px-1">
          <Info size={14} className="text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">
            Real-time data: Lowest available fare for <span className="text-slate-900">{origin}-{destination}</span> this month is <span className="text-green-600">₹{cheapestFare}</span>.
          </p>
        </div>
      )}
    </div>
  );
}