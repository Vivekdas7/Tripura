import { useEffect, useState } from 'react';
import { Ticket, Plane, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type BookingWithFlight = {
  id: string;
  booking_reference: string;
  status: string;
  total_passengers: number;
  total_price: number;
  booking_date: string;
  flight: {
    flight_number: string;
    airline: string;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
  };
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithFlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          status,
          total_passengers,
          total_price,
          booking_date,
          flight:flights (
            flight_number,
            airline,
            origin,
            destination,
            departure_time,
            arrival_time
          )
        `)
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data as any);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">You don't have any bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Ticket size={28} className="text-blue-600" />
        My Bookings
      </h2>

      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status === 'confirmed' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={16} />
                      Confirmed
                    </span>
                  ) : booking.status === 'cancelled' ? (
                    <span className="flex items-center gap-1">
                      <XCircle size={16} />
                      Cancelled
                    </span>
                  ) : (
                    'Pending'
                  )}
                </div>
                <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                  {booking.booking_reference}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Plane size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-800">{booking.flight.airline}</span>
                <span className="text-sm text-gray-500">({booking.flight.flight_number})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Route</p>
                  <p className="font-semibold text-gray-800">
                    {booking.flight.origin} → {booking.flight.destination}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Calendar size={14} />
                    Departure
                  </p>
                  <p className="font-semibold text-gray-800">
                    {new Date(booking.flight.departure_time).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Users size={14} />
                    Passengers
                  </p>
                  <p className="font-semibold text-gray-800">{booking.total_passengers}</p>
                </div>

                <div>
                  <p className="text-gray-600">Booked on</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                      dateStyle: 'medium'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:text-right md:border-l md:pl-6">
              <p className="text-sm text-gray-600 mb-1">Total Price</p>
              <p className="text-3xl font-bold text-blue-600 mb-3">
                ${booking.total_price.toFixed(2)}
              </p>
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
