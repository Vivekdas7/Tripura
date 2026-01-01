import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import { Flight, supabase } from './lib/supabase';

// --- NEW SUB-COMPONENTS FOR CONTENT PAGES ---

const AboutUs = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <section className="bg-indigo-950 py-24 text-center px-4 relative overflow-hidden rounded-[3rem] mb-12">
      <div className="absolute inset-0 opacity-30">
        <img src="https://img.staticmb.com/mbcontent/images/crop/uploads/2023/5/agartala-airport_0_1200.jpg" className="w-full h-full object-cover" alt="Heritage" />
      </div>
      <div className="relative z-10">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 italic">Our Journey</h1>
        <p className="text-orange-400 font-bold tracking-[0.3em] uppercase text-sm md:text-base">Connecting the Queen of Hills</p>
      </div>
    </section>
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <p className="text-xl text-slate-600 leading-relaxed text-center">
        Founded in 2024, <strong>TripuraFly</strong> was born out of a simple necessity: making air travel to the Northeast affordable. Based in Agartala, we specialize in "last-mile" aviation connectivity.
      </p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-slate-500">To provide the most budget-friendly flight options for the residents and tourists of Tripura, ensuring no one is limited by geography.</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <h3 className="text-2xl font-bold mb-4">Local Impact</h3>
          <p className="text-slate-500">We partner with local regional carriers to provide exclusive fares that are 20% lower than national aggregators.</p>
        </div>
      </div>
    </div>
  </div>
);

const TravelPolicy = () => (
  <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
    <h1 className="text-4xl font-black mb-8">Travel & Refund Policy</h1>
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-orange-600 mb-4 uppercase tracking-wider">Refund Rules</h2>
        <ul className="space-y-4 text-slate-600">
          <li className="flex gap-3"><strong>•</strong> Cancellations made 72 hours before departure: 90% Refund.</li>
          <li className="flex gap-3"><strong>•</strong> Cancellations made 24-72 hours before departure: 50% Refund.</li>
          <li className="flex gap-3"><strong>•</strong> Cancellations within 24 hours: Non-refundable.</li>
        </ul>
      </div>
      <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
        <h2 className="text-xl font-bold text-indigo-900 mb-4 uppercase tracking-wider">Airline Policies</h2>
        <p className="text-indigo-800 leading-relaxed">
          Passengers must arrive at MBB Airport Agartala at least 2 hours before domestic departures. A valid government-issued photo ID is mandatory for all travelers, including infants.
        </p>
      </div>
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

// --- MAIN APP COMPONENT ---

function App() {
  const { user, loading: authLoading } = useAuth();
  // Updated view state to include new pages
  const [currentView, setCurrentView] = useState<'search' | 'bookings' | 'about' | 'policy'>('search');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

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
      console.error('Error searching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (!user) return <AuthForm />;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Header currentView={currentView === 'search' || currentView === 'bookings' ? currentView : 'search'} onViewChange={setCurrentView} />

      <main className="container mx-auto px-4">
        {currentView === 'search' && (
          <>
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[500px] md:h-[650px] flex items-center justify-center overflow-hidden -mx-4">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://img.staticmb.com/mbcontent/images/crop/uploads/2023/5/agartala-airport_0_1200.jpg" 
                  className="w-full h-full object-cover brightness-[0.35] md:brightness-50" 
                  alt="MBB Airport"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-slate-900/90"></div>
              </div>
              <div className="relative z-10 text-center text-white">
                <span className="inline-block px-4 py-1.5 mb-6 bg-orange-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">Direct Flights to Agartala</span>
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 tracking-tighter leading-[1.1]">Tripura's <span className="text-orange-500">Affordable</span> <br/> Travel Partner</h1>
                <p className="text-base md:text-2xl text-slate-200 max-w-2xl mx-auto font-light px-6">Discover the "Queen of Eastern Hills" with the most budget-friendly tickets.</p>
              </div>
            </section>

            {/* --- SEARCH OVERLAP --- */}
            <div className="-mt-12 md:-mt-20 relative z-20 mb-24">
              <div className="bg-white p-4 md:p-3 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100">
                <FlightSearch onSearch={handleSearch} />
              </div>
            </div>

            {/* --- FLIGHT LIST --- */}
            <div className="mb-24">
              {flights.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span> Best Deals Found
                  </h2>
                  <FlightList flights={flights} onSelectFlight={(f) => { setSelectedFlight(f); setShowBookingModal(true); }} loading={loading} />
                </div>
              ) : !loading && (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                  <div className="text-5xl mb-4">📍</div>
                  <h3 className="text-xl font-bold text-slate-800">Ready to explore?</h3>
                  <p className="text-slate-500 mt-2">Enter your destination to unlock hidden fares to Tripura.</p>
                </div>
              )}
            </div>

            {/* --- TRIPURA SPOTLIGHT --- */}
            <section className="mb-24">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12">Explore Tripura</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: "Ujjayanta Palace", img: "https://www.holidify.com/images/bgImages/AGARTALA.jpg", tag: "Agartala", price: "₹1,499" },
                  { title: "Neermahal Palace", img: "https://www.trawell.in/admin/images/thumbs/585675409Neermahal_Main_thumb.jpg", tag: "Melaghar", price: "₹1,250" },
                  { title: "Jampui Hills", img: "https://scstsenvis.nic.in/index3.php?image=317", tag: "North Tripura", price: "₹1,800" }
                ].map((item, i) => (
                  <div key={i} className="group relative rounded-[2rem] overflow-hidden h-[400px] shadow-xl hover:shadow-2xl transition-all duration-500 active:scale-95">
                    <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <span className="bg-orange-600 text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase tracking-tighter mb-2 w-fit">{item.tag}</span>
                      <h3 className="text-white text-2xl font-extrabold">{item.title}</h3>
                      <p className="text-orange-400 font-black mt-1">Starts at {item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- VALUE PROPOSITION --- */}
            <section className="bg-indigo-950 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl mb-24">
              <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black mb-8 leading-[1.1]">The Smartest Way <br/> to fly to Tripura.</h2>
                  <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-white text-indigo-950 px-10 py-4 rounded-2xl font-black hover:bg-orange-500 hover:text-white transition-all">Book Now — Save 20%</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FeatureCard icon="🚀" title="Instant" desc="Tickets in seconds." />
                  <FeatureCard icon="🔒" title="Secure" desc="RBI compliant pay." />
                </div>
              </div>
            </section>
          </>
        )}

        {currentView === 'bookings' && <MyBookings />}
        {currentView === 'about' && <AboutUs />}
        {currentView === 'policy' && <TravelPolicy />}
        
      </main>

      <footer className="bg-slate-950 text-slate-500 py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-white text-2xl font-black italic mb-4">TripuraFly</h3>
            <p className="text-sm leading-relaxed">Connecting the hills to the world with the lowest guaranteed airfares.</p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">Company</h4>
            <button onClick={() => setCurrentView('about')} className="text-left hover:text-orange-500 transition-colors">About Us</button>
            <button onClick={() => setCurrentView('policy')} className="text-left hover:text-orange-500 transition-colors">Travel Policy</button>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">Location</h4>
            <p className="text-sm">MBB Airport Road, Agartala, West Tripura - 799009</p>
          </div>
        </div>
        <div className="text-center mt-20 pt-8 border-t border-slate-900 text-[10px] uppercase tracking-widest">© 2026 TripuraFly Aviation Services.</div>
      </footer>

      {showBookingModal && selectedFlight && (
        <BookingModal flight={selectedFlight} onClose={() => { setShowBookingModal(false); setSelectedFlight(null); }} onBookingComplete={() => { setShowBookingModal(false); setSelectedFlight(null); setCurrentView('bookings'); handleSearch({ origin: '', destination: '', date: '' }); }} />
      )}
    </div>
  );
}

export default App;