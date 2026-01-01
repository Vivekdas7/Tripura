import { useState } from 'react';
import { X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, Armchair } from 'lucide-react';
import { Flight, Passenger, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type BookingModalProps = {
  flight: Flight;
  onClose: () => void;
  onBookingComplete: () => void;
};

export default function BookingModal({ flight, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  const [numPassengers, setNumPassengers] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      passport_number: ''
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleNumPassengersChange = (num: number) => {
    setNumPassengers(num);
    const updated = [...passengers];
    while (updated.length < num) {
      updated.push({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        passport_number: ''
      });
    }
    while (updated.length > num) {
      updated.pop();
    }
    setPassengers(updated);
  };

  const generateBookingReference = () => {
    return 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (flight.available_seats < numPassengers) {
        throw new Error('Not enough seats available');
      }

      const bookingReference = generateBookingReference();
      const totalPrice = flight.price * numPassengers;

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          flight_id: flight.id,
          booking_reference: bookingReference,
          status: 'confirmed',
          total_passengers: numPassengers,
          total_price: totalPrice
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const passengersWithBookingId = passengers.map(p => ({
        ...p,
        booking_id: booking.id
      }));

      const { error: passengersError } = await supabase
        .from('passengers')
        .insert(passengersWithBookingId);

      if (passengersError) throw passengersError;

      const { error: updateError } = await supabase
        .from('flights')
        .update({ available_seats: flight.available_seats - numPassengers })
        .eq('id', flight.id);

      if (updateError) throw updateError;

      onBookingComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = flight.price * numPassengers;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between shadow-sm z-10">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          {/* Flight Summary Card */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
               Flight Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <p>✈️ <strong>{flight.airline}</strong> ({flight.flight_number})</p>
              <p>📍 {flight.origin} → {flight.destination}</p>
              <p>📅 {new Date(flight.departure_time).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}</p>
              <p>💺 {flight.available_seats} Seats Left</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Passenger Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Passengers
              </label>
              <select
                value={numPassengers}
                onChange={(e) => handleNumPassengersChange(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num} disabled={num > flight.available_seats}>
                    👤 {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>

            {/* Passenger Detail Cards */}
            {passengers.map((passenger, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white shadow-sm">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                  <User size={20} className="text-blue-600" />
                  Passenger {index + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={passenger.first_name}
                      onChange={(e) => handlePassengerChange(index, 'first_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={passenger.last_name}
                      onChange={(e) => handlePassengerChange(index, 'last_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Mail size={16} /> Email *
                    </label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Phone size={16} /> Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={passenger.phone}
                      onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                      placeholder="+91"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <CalendarIcon size={16} /> Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={passenger.date_of_birth}
                      onChange={(e) => handlePassengerChange(index, 'date_of_birth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <CreditCard size={16} /> Passport Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={passenger.passport_number}
                      onChange={(e) => handlePassengerChange(index, 'passport_number', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Price & Auto-Assign Message */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
              <div className="flex justify-between items-center text-gray-600">
                <span>Price per passenger:</span>
                <span className="font-semibold text-gray-800">₹{flight.price.toLocaleString()}</span>
              </div>
              
              {/* Auto Seat Assign Highlight */}
              <div className="flex items-center gap-2 py-2 px-3 bg-white rounded border border-dashed border-gray-300 text-sm text-gray-600">
                <Armchair size={18} className="text-blue-500" />
                <span>Seats are <strong>auto-assigned</strong> by the airline. 🎫✨</span>
              </div>

              <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Grand Total:</span>
                <span className="text-2xl font-bold text-blue-600">₹{totalPrice.toLocaleString()}</span>
              </div>

              {/* IMPORTANT DELIVERY NOTE */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 flex gap-3">
                <div className="shrink-0">
                  <Info className="text-amber-600" size={20} />
                </div>
                <div className="text-sm text-amber-900 leading-relaxed">
                  <strong>Important:</strong> After booking, your <strong>PNR and Ticket</strong> will be sent to your email and mobile number within 5 minutes. 📩✅
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 shadow-md active:scale-95"
              >
                {loading ? 'Processing...' : 'Confirm Booking 🚀'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}