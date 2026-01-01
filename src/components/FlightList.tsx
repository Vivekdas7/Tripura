import { Plane, Clock, DollarSign, Users } from 'lucide-react';
import { Flight } from '../lib/supabase';

type FlightListProps = {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  loading: boolean;
};

export default function FlightList({ flights, onSelectFlight, loading }: FlightListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Searching for flights...</p>
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
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Available Flights ({flights.length})
      </h3>

      {flights.map((flight) => (
        <div
          key={flight.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200"
          onClick={() => onSelectFlight(flight)}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Plane size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-800">{flight.airline}</span>
                <span className="text-sm text-gray-500">({flight.flight_number})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-sm text-gray-600">Departure</p>
                  <p className="font-semibold text-gray-800">{flight.origin}</p>
                  <p className="text-sm text-gray-600">{formatTime(flight.departure_time)}</p>
                  <p className="text-xs text-gray-500">{formatDate(flight.departure_time)}</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <Clock size={16} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">
                      {calculateDuration(flight.departure_time, flight.arrival_time)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Arrival</p>
                  <p className="font-semibold text-gray-800">{flight.destination}</p>
                  <p className="text-sm text-gray-600">{formatTime(flight.arrival_time)}</p>
                  <p className="text-xs text-gray-500">{formatDate(flight.arrival_time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {flight.available_seats} seats available
                </span>
                <span>Aircraft: {flight.aircraft_type}</span>
              </div>
            </div>

            <div className="md:text-right md:border-l md:pl-6">
              <div className="flex items-center justify-end gap-1 text-3xl font-bold text-blue-600">
                ₹
                {flight.price.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-1">per passenger</p>
              <button className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
