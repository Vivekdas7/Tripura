import { useState, useEffect } from 'react';
import { Plane, Clock, ShieldCheck, TrendingDown, CheckCircle2, AlertCircle, ArrowRight, MapPin, Calendar, UserCheck } from 'lucide-react';

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
  available_seats: number; // Added to track seat availability
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
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDisplayDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-IN', {
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

      // --- DYNAMIC FILTERING & MAPPING ---
      const processedFlights = data.data
        .filter((offer: any) => offer.numberOfBookableSeats > 0) // REMOVE IF NO SEATS
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
            segments: segments,
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
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-500">Checking seat availability...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {flights.map((flight) => (
        <div key={flight.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <img src={flight.logo} className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100" alt={flight.airline} />
                <div>
                  <h4 className="font-black text-slate-900 leading-none">{flight.airline}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{flight.flight_number}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {formatDisplayDate(flight.departure_time)}
                    </span>
                  </div>
                </div>
                {/* SEAT BADGE */}
                <div className="ml-auto flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
                  <UserCheck size={12} />
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {flight.available_seats > 8 ? "9+ Seats Available" : `${flight.available_seats} Seats Left`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center bg-slate-50/50 p-5 rounded-3xl border border-slate-50">
                <div className="text-left">
                  <p className="text-2xl font-black text-slate-900">{flight.origin}</p>
                  <p className="text-xs font-bold text-slate-500">{formatDisplayTime(flight.departure_time)}</p>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-1">{flight.duration}</span>
                  <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-center">
                    <Plane size={14} className="text-indigo-600 absolute bg-white px-0.5" />
                  </div>
                  <span className="text-[9px] font-bold text-indigo-500 mt-1 uppercase tracking-tighter">
                    {flight.isConnecting ? `${flight.stops} Stop via ${flight.layoverInfo?.city}` : 'Non-stop'}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{flight.destination}</p>
                  <p className="text-xs font-bold text-slate-500">{formatDisplayTime(flight.arrival_time)}</p>
                </div>
              </div>
            </div>

            <div className="lg:w-48 flex lg:flex-col items-center justify-between lg:justify-center lg:items-end lg:border-l border-slate-100 lg:pl-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Price</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">
                  <span className="text-lg text-indigo-600 mr-0.5">₹</span>
                  {Math.round(flight.price).toLocaleString('en-IN')}
                </p>
                <p className="text-[9px] font-bold text-blue-600 mt-1 uppercase tracking-tight">Confirmed Fare</p>
              </div>
              <button 
                onClick={() => onSelectFlight(flight)}
                className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-600 transition-all active:scale-95 shadow-lg mt-4 w-full lg:w-auto"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}