import { useState } from 'react';
import { X, User, Mail, Phone, Calendar as CalendarIcon, CreditCard, Info, Armchair, ChevronRight, Plane } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-[1000] transition-all">
      {/* Background Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4 md:hidden" />

        {/* Header */}
        <div className="px-6 md:px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Booking Details</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Secure Checkout</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
          
          {/* Flight Summary - Ticket Style */}
          <div className="relative bg-indigo-600 rounded-[2rem] p-6 text-white mb-8 overflow-hidden shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Plane className="rotate-90" size={20} />
                </div>
                <div>
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-tighter">Airline</p>
                  <p className="font-bold text-sm">{flight.airline} <span className="opacity-60">#{flight.flight_number}</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-tighter">Seats</p>
                <p className="font-bold text-sm">{flight.available_seats} Available</p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <h4 className="text-2xl font-black">{flight.origin}</h4>
                <p className="text-indigo-200 text-xs font-medium mt-1">Departure</p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-full border-t-2 border-dashed border-white/30 relative flex justify-center">
                  <div className="absolute -top-3 bg-indigo-600 px-2">
                    <Plane size={14} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 text-right">
                <h4 className="text-2xl font-black">{flight.destination}</h4>
                <p className="text-indigo-200 text-xs font-medium mt-1">Arrival</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-indigo-100">
              <span className="flex items-center gap-2">
                <CalendarIcon size={14} /> 
                {new Date(flight.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
              <span>{new Date(flight.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center gap-3 animate-pulse">
              <Info size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Passenger Selector */}
            <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-2">
              <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                <User size={20} />
              </div>
              <div className="flex-1 px-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Passengers</label>
                <select
                  value={numPassengers}
                  onChange={(e) => handleNumPassengersChange(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 outline-none appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num} disabled={num > flight.available_seats}>
                      {num} {num === 1 ? 'Traveller' : 'Travellers'}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </div>

            {/* Passenger Detail Cards */}
            <div className="space-y-6">
              {passengers.map((passenger, index) => (
                <div key={index} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </span>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Passenger Information</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <input
                        type="text"
                        placeholder="First Name *"
                        value={passenger.first_name}
                        onChange={(e) => handlePassengerChange(index, 'first_name', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-300"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Last Name *"
                        value={passenger.last_name}
                        onChange={(e) => handlePassengerChange(index, 'last_name', e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-300"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={passenger.email}
                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                        className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-300"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="tel"
                        placeholder="Mobile Number *"
                        value={passenger.phone}
                        onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                        className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-300"
                        required
                      />
                    </div>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="date"
                        value={passenger.date_of_birth}
                        onChange={(e) => handlePassengerChange(index, 'date_of_birth', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                        required
                      />
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="text"
                        placeholder="Passport (Optional)"
                        value={passenger.passport_number}
                        onChange={(e) => handlePassengerChange(index, 'passport_number', e.target.value)}
                        className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Footer */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-xs font-black uppercase tracking-widest">Base Fare ({numPassengers}x)</span>
                <span className="font-bold">₹{flight.price.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-3 py-3 px-4 bg-white/10 rounded-2xl text-[11px] font-bold text-indigo-200">
                <Armchair size={16} className="text-indigo-400" />
                <span>Airline will auto-assign your seats.</span>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                  <span className="text-indigo-400 text-[10px] font-black uppercase block tracking-tighter mb-1">Total Amount</span>
                  <p className="text-4xl font-black">₹{totalPrice.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl">
                  <CreditCard size={24} />
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl flex gap-3 border border-white/5">
                <Info className="text-orange-400 shrink-0" size={18} />
                <p className="text-[10px] font-medium text-slate-300 leading-relaxed">
                  PNR & E-Ticket will be delivered to your contact details within <span className="text-white font-black">5 minutes</span> after successful payment.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="hidden md:block flex-1 py-4 border-2 border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/50 active:scale-95 disabled:bg-slate-700"
                >
                  {loading ? 'Processing...' : 'Confirm & Pay 🚀'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}