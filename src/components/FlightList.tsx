import { useState } from 'react';
import { Plane, Clock, Users } from 'lucide-react';
import { Flight } from '../lib/supabase';

type FlightListProps = {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  loading: boolean;
};

// --- MOBILE FRIENDLY BOOKING LOADER ---
const BookingOverlay = () => (
  <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Plane className="text-indigo-600 animate-pulse" size={24} />
      </div>
    </div>
    <p className="mt-4 font-bold text-slate-800 animate-pulse px-6 text-center">
      Securing your seat...
    </p>
  </div>
);

export default function FlightList({ flights, onSelectFlight, loading }: FlightListProps) {
  const [isBooking, setIsBooking] = useState(false);

  const handleBookNow = (flight: Flight) => {
    setIsBooking(true);
    // Simulate a small delay for better UX/Process transition
    setTimeout(() => {
      onSelectFlight(flight);
      setIsBooking(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-indigo-600"></div>
        <p className="mt-4 text-slate-500 font-medium">Searching for the best deals...</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <Plane size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No flights found. Try different search criteria.</p>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Show overlay loader when booking button is clicked */}
      {isBooking && <BookingOverlay />}

      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        Available Flights 
        <span className="text-sm font-normal bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
          {flights.length}
        </span>
      </h3>

      {flights.map((flight) => (
        <div
          key={flight.id}
          className="group bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 p-5 md:p-6 border border-slate-100 overflow-hidden relative"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                  <Plane size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-none">{flight.airline}</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">{flight.flight_number}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-8 items-center bg-slate-50 p-4 rounded-2xl">
                <div className="text-left">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Dep</p>
                  <p className="text-lg font-black text-slate-900">{flight.origin}</p>
                  <p className="text-sm font-semibold text-indigo-600">{formatTime(flight.departure_time)}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(flight.departure_time)}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full h-[1px] bg-slate-200 relative">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2">
                      <Clock size={12} className="text-slate-300" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
                    {calculateDuration(flight.departure_time, flight.arrival_time)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Arr</p>
                  <p className="text-lg font-black text-slate-900">{flight.destination}</p>
                  <p className="text-sm font-semibold text-indigo-600">{formatTime(flight.arrival_time)}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(flight.arrival_time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                  <Users size={14} className="text-indigo-500" />
                  {flight.available_seats} seats
                </span>
                <span className="bg-slate-100 px-3 py-1 rounded-full">
                   {flight.aircraft_type}
                </span>
              </div>
            </div>

            <div className="flex md:flex-col items-center justify-between md:justify-center md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
              <div className="text-left md:text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Price</p>
                <div className="flex items-center md:justify-end text-3xl font-black text-orange-600">
                  <span className="text-lg mr-0.5">₹</span>
                  {flight.price.toLocaleString()}
                </div>
              </div>
              
              <button 
                onClick={() => handleBookNow(flight)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-indigo-100"
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