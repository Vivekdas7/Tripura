import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Added Router
import { useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import Privacy from'./components/PrivacyPolicy'
import { Flight, supabase } from './lib/supabase';

// --- MOCK PRIVACY PAGE (Create a separate file for this usually) ---


// --- SUCCESS POPUP COMPONENT ---
const SuccessPopup = ({ details, onClose }: { details: any, onClose: () => void }) => (
  <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
    <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">
        ✓
      </div>
      <h3 className="text-3xl font-black text-slate-900 mb-2">Booking Sent!</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        Your trip to <span className="font-bold text-indigo-600">{details.package_name}</span> is being prepared. Our Agartala office will contact you at <span className="font-bold">{details.phone}</span> within 15 minutes.
      </p>
      
      <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 uppercase font-bold">Travelers</span>
          <span className="font-black text-slate-700">{details.travelers} Person(s)</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 uppercase font-bold">Total Price</span>
          <span className="font-black text-green-600">₹{details.total_price.toLocaleString()}</span>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
      >
        Awesome, Thanks!
      </button>
    </div>
  </div>
);

// --- PACKAGE MODAL COMPONENT ---
const PackageModal = ({ pkg, onClose, onConfirm }: { pkg: any, onClose: () => void, onConfirm: (details: any) => void }) => {
  const [details, setDetails] = useState({ date: '', travelers: 1, phone: '' });

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-none">{pkg.title}</h3>
            <p className="text-orange-600 font-bold mt-2 italic">₹{pkg.price} / person</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 text-2xl">✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Travel Date</label>
            <input 
              type="date" 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" 
              onChange={e => setDetails({...details, date: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Travelers</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                onChange={e => setDetails({...details, travelers: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Person{n>1?'s':''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Contact No.</label>
              <input 
                type="tel" 
                placeholder="Mobile number" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                onChange={e => setDetails({...details, phone: e.target.value})} 
              />
            </div>
          </div>

          <div className="bg-indigo-50 p-5 rounded-[1.5rem] flex justify-between items-center">
            <span className="text-indigo-900 font-bold">Total Amount</span>
            <span className="text-2xl font-black text-indigo-600">
              ₹{(parseInt(pkg.price) * details.travelers).toLocaleString()}
            </span>
          </div>

          <button 
            disabled={!details.date || !details.phone}
            onClick={() => onConfirm(details)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-orange-500 disabled:opacity-50 transition-all active:scale-95"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LOADER COMPONENT ---
const FullScreenLoader = () => (
  <div className="fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
    <div className="relative">
      <div className="absolute inset-0 bg-orange-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
      <div className="w-24 h-24 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">✈️</div>
    </div>
    <div className="mt-6 text-center">
      <h3 className="text-white font-bold text-lg tracking-widest uppercase">Processing Request</h3>
      <p className="text-orange-200 text-sm opacity-80 italic">Connecting with Agartala Central Office...</p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm transition-all hover:bg-white/20">
    <div className="text-3xl md:text-4xl mb-3">{icon}</div>
    <h4 className="text-base md:text-lg font-bold text-white mb-1">{title}</h4>
    <p className="text-indigo-100 text-[10px] md:text-sm leading-relaxed">{desc}</p>
  </div>
);

function App() {
  const { user, loading: authLoading } = useAuth();
  
  // Base States
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Package/Success States
  const [bookingPackage, setBookingPackage] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  const handleSearch = async (filters: { origin: string; destination: string; date: string }) => {
    setLoading(true);
    try {
      let query = supabase.from('flights').select('*');
      if (filters.origin) query = query.ilike('origin', `%${filters.origin}%`);
      if (filters.destination) query = query.ilike('destination', `%${filters.destination}%`);
      if (filters.date) {
        const start = new Date(filters.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.date);
        end.setHours(23, 59, 59, 999);
        query = query.gte('departure_time', start.toISOString()).lte('departure_time', end.toISOString());
      }
      query = query.gt('available_seats', 0).order('departure_time', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      setFlights(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const confirmPackageBooking = async (details: any) => {
    if (!user) return alert("Please login to book packages");
    setLoading(true);
    
    const bookingData = {
      user_id: user.id,
      package_name: bookingPackage.title,
      travelers: details.travelers,
      phone: details.phone,
      total_price: parseFloat(bookingPackage.price) * details.travelers,
      travel_date: details.date
    };

    try {
      const { error } = await supabase.from('package_bookings').insert([bookingData]);
      if (error) throw error;
      
      setCompletedBooking(bookingData);
      setBookingPackage(null);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Authenticating...</p>
      </div>
    </div>
  );

  if (!user) return <AuthForm />;

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
        {loading && <FullScreenLoader />}

        {/* Note: Header might need internal update to use <Link> instead of onViewChange */}
        <Header currentView="search" onViewChange={() => {}} />

        <Routes>
          <Route path="/" element={
            <>
              <section className="relative min-h-[500px] md:h-[650px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img src="https://img.staticmb.com/mbcontent/images/crop/uploads/2023/5/agartala-airport_0_1200.jpg" className="w-full h-full object-cover brightness-[0.35]" alt="Agartala" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-slate-900/90"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                  <span className="inline-block px-4 py-1.5 mb-6 bg-orange-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full">Direct Flights to Agartala</span>
                  <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 tracking-tighter">Tripura's <span className="text-orange-500">Affordable</span> <br/> Travel Partner</h1>
                </div>
              </section>

              <div className="container mx-auto px-4 -mt-12 md:-mt-20 relative z-20">
                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100">
                  <FlightSearch onSearch={handleSearch} />
                </div>
              </div>

              <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="mb-24">
                  {flights.length > 0 ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><span className="w-2 h-8 bg-indigo-600 rounded-full"></span>Best Deals Found</h2>
                      <FlightList flights={flights} onSelectFlight={(f) => { setSelectedFlight(f); setShowBookingModal(true); }} loading={loading} />
                    </div>
                  ) : !loading && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                      <div className="text-5xl mb-4">📍</div>
                      <h3 className="text-xl font-bold text-slate-800">Ready to explore?</h3>
                    </div>
                  )}
                </div>

                <section className="mb-24 px-4">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900">Exclusive <span className="text-indigo-600">Packages</span></h2>
                      <p className="text-slate-500 mt-2">Flight + Hotel + Sightseeing starting at unbeatable prices.</p>
                    </div>
                    <div className="h-1.5 w-20 bg-orange-500 rounded-full hidden md:block"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[
                      { title: "Ujjayanta Palace", img: "https://img.staticmb.com/mbcontent/images/crop/uploads/2023/5/agartala-airport_0_1200.jpg", tag: "Agartala", price: "1499", desc: "3 Days / 2 Nights" },
                      { title: "Neermahal Palace", img: "https://imgs.search.brave.com/2EscS-uhK0brQGmC59HClqWEuYiKbN0eSojOFNNYEHY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/LnRyaXBvdG8uY29t/L21lZGlhL2ZpbHRl/ci9ueHhsL2ltZy83/Njc0Mi9UcmlwRG9j/dW1lbnQvMTQ5MTQy/OTY0OV9kc2NfMDAw/MS5qcGcud2VicA", tag: "Melaghar", price: "1250", desc: "2 Days / 1 Night" },
                      { title: "Jampui Hills", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop", tag: "North Tripura", price: "1800", desc: "4 Days / 3 Nights" }
                    ].map((item, i) => (
                      <div key={i} className="group relative rounded-[2.5rem] overflow-hidden h-[450px] shadow-xl transition-all duration-500 hover:-translate-y-2">
                        <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="bg-orange-600 text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest">{item.tag}</span>
                            <span className="bg-white/20 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest">{item.desc}</span>
                          </div>
                          <h3 className="text-white text-2xl md:text-3xl font-black mb-4">{item.title}</h3>
                          <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-4">
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">Starting at</p>
                              <p className="text-orange-400 text-2xl font-black italic">₹{item.price}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setBookingPackage(item); }}
                              className="bg-white text-indigo-950 px-6 py-3 rounded-2xl font-black text-sm transition-all hover:bg-orange-500 hover:text-white shadow-xl active:scale-90"
                            >
                              Book Package
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-indigo-950 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                  <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black mb-8 leading-[1.1]">The Smartest Way <br/> to fly to Tripura.</h2>
                      <p className="text-indigo-200 text-base md:text-lg mb-10 leading-relaxed font-light">Direct local partnerships for regional fares major search engines miss.</p>
                      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-white text-indigo-950 hover:bg-orange-500 hover:text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl">Book Now — Save 20%</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <FeatureCard icon="🚀" title="Instant" desc="Tickets in seconds." />
                      <FeatureCard icon="🔒" title="Secure" desc="RBI compliant pay." />
                      <FeatureCard icon="🎧" title="24/7 Support" desc="Agartala local team." />
                      <FeatureCard icon="🎟️" title="No Hidden" desc="Tax included price." />
                    </div>
                  </div>
                </section>
              </main>
            </>
          } />
          <Route path="/bookings" element={<main className="container mx-auto px-4 py-12"><MyBookings /></main>} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>

        <footer className="bg-slate-950 text-slate-500 py-12 text-center">
          <h3 className="text-white text-xl font-black italic mb-2">TripuraFly</h3>
          <p className="text-[9px] uppercase tracking-widest mb-4">© 2026 TripuraFly Aviation. महाराजा बीर बिक्रम एअरपोर्ट, अगरतला</p>
          <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-tighter">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </footer>

        {/* --- MODALS & OVERLAYS --- */}
        {showBookingModal && selectedFlight && (
          <BookingModal flight={selectedFlight} onClose={() => { setShowBookingModal(false); setSelectedFlight(null); }} onBookingComplete={() => { setShowBookingModal(false); setSelectedFlight(null); }} />
        )}

        {bookingPackage && (
          <PackageModal pkg={bookingPackage} onClose={() => setBookingPackage(null)} onConfirm={confirmPackageBooking} />
        )}

        {showSuccess && completedBooking && (
          <SuccessPopup details={completedBooking} onClose={() => setShowSuccess(false)} />
        )}
      </div>
    </Router>
  );
}

export default App;