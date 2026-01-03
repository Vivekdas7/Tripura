import { useState, useEffect } from 'react';
import { Plane, Calendar, UserCheck, Info } from 'lucide-react';

// --- TYPES ---
type Flight = {
  id: string;
  airline: string;
  airline_code: string;
  logo: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  available_seats: number;
  isConnecting: boolean;
  stops: number;
  duration: string;
  layoverInfo: { city: string; duration: string } | null;
};

// --- HELPERS ---
const getAirlineName = (code: string, dictionary: any) => {
  const manualMap: { [key: string]: string } = {
    "6E": "IndiGo", "AI": "Air India", "UK": "Vistara", 
    "SG": "SpiceJet", "QP": "Akasa Air", "I5": "AirAsia India", "IX": "Air India Express"
  };
  return manualMap[code] || (dictionary && dictionary[code]) || `Airline (${code})`;
};

const formatDuration = (ptString: string) => {
  return ptString.replace('PT', '').replace('H', 'h ').replace('M', 'm').toLowerCase();
};

const formatDisplayTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDisplayDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    weekday: 'short'
  });
};

export default function FlightList({ searchParams, onSelectFlight }: any) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealTimeFlights = async () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.date) return;
    
    setLoading(true);
    setError(null);
    try {
      const authResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=4n93Mpcjg4LYGmFkHHEUYlVAuEc18D1t&client_secret=KvSWiE1lTFsN7jxo`,
      });
      const { access_token } = await authResponse.json();

      const flightResponse = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${searchParams.origin}&destinationLocationCode=${searchParams.destination}&departureDate=${searchParams.date}&adults=1&currencyCode=INR&max=15`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const data = await flightResponse.json();

      if (!data.data || data.data.length === 0) {
        throw new Error("No available flights found for this route.");
      }

      const processedFlights = data.data
        .filter((offer: any) => offer.numberOfBookableSeats > 0) 
        .map((offer: any) => {
          const itinerary = offer.itineraries[0];
          const segments = itinerary.segments;
          const carrierCode = segments[0].carrierCode;
          const isConnecting = segments.length > 1;
          
          return {
            id: offer.id,
            airline: getAirlineName(carrierCode, data.dictionaries?.carriers),
            airline_code: carrierCode,
            logo: `https://pics.avs.io/200/200/${carrierCode}.png`,
            flight_number: `${carrierCode}-${segments[0].number}`,
            origin: segments[0].departure.iataCode,
            destination: segments[segments.length - 1].arrival.iataCode,
            departure_time: segments[0].departure.at,
            arrival_time: segments[segments.length - 1].arrival.at,
            duration: formatDuration(itinerary.duration),
            price: parseFloat(offer.price.grandTotal || offer.price.total),
            currency: offer.price.currency,
            available_seats: offer.numberOfBookableSeats,
            isConnecting: isConnecting,
            stops: segments.length - 1,
            layoverInfo: isConnecting ? {
              city: segments[0].arrival.iataCode,
              duration: "Flexible"
            } : null
          };
        });

      setFlights(processedFlights.sort((a: any, b: any) => a.price - b.price));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeFlights();
  }, [searchParams]);

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-500 text-sm">Searching the best fares...</p>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-center">
      <p className="text-red-600 font-bold text-sm">{error}</p>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 px-2">
      {flights.map((flight) => (
        <div key={flight.id} className="bg-white rounded-[2rem] p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* AIRLINE INFO SECTION */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <img src={flight.logo} className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100" alt={flight.airline} />
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-sm md:text-base leading-none">{flight.airline}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-[9px] md:text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{flight.flight_number}</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {formatDisplayDate(flight.departure_time)}
                    </span>
                  </div>
                </div>
                {/* SEAT BADGE - Hidden on very small screens to save space, or kept compact */}
                <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg border border-green-100">
                  <UserCheck size={10} />
                  <span className="text-[9px] font-black uppercase tracking-tight">
                    {flight.available_seats > 5 ? "Available" : `${flight.available_seats} Left`}
                  </span>
                </div>
              </div>

              {/* ROUTE VISUALIZER */}
              <div className="grid grid-cols-3 items-center bg-slate-50/80 p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border border-slate-100">
                <div className="text-left">
                  <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{flight.origin}</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">{formatDisplayTime(flight.departure_time)}</p>
                </div>
                
                <div className="flex flex-col items-center px-2">
                  <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1">{flight.duration}</span>
                  <div className="w-full h-[1.5px] bg-slate-200 relative flex items-center justify-center">
                    <Plane size={12} className="text-indigo-600 absolute bg-slate-50 px-0.5" />
                  </div>
                  <span className="text-[8px] md:text-[9px] font-bold text-indigo-500 mt-1 uppercase text-center leading-tight">
                    {flight.isConnecting ? `${flight.stops} Stop via ${flight.layoverInfo?.city}` : 'Non-stop'}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{flight.destination}</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">{formatDisplayTime(flight.arrival_time)}</p>
                </div>
              </div>
            </div>

            {/* PRICE & ACTION SECTION */}
            <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-end lg:border-l border-slate-100 lg:pl-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-dashed border-slate-200">
              <div className="text-left lg:text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Grand Total</p>
                <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                  <span className="text-sm md:text-lg text-indigo-600 mr-0.5">₹</span>
                  {Math.round(flight.price).toLocaleString('en-IN')}
                </p>
              </div>
              <button 
                onClick={() => onSelectFlight(flight)}
                className="bg-slate-900 text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-indigo-600 transition-all active:scale-95 shadow-md"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* FOOTER ADVISORY */}
      <div className="flex items-start gap-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] font-medium text-blue-700 leading-relaxed uppercase tracking-tight">
          Fares are real-time and include all taxes. Seat availability is subject to change at the time of final booking on the airline portal.
        </p>
      </div>
    </div>
  );
}