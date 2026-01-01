import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import { Flight, supabase } from './lib/supabase';

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm transition-all hover:bg-white/20">
    <div className="text-3xl md:text-4xl mb-3">{icon}</div>
    <h4 className="text-base md:text-lg font-bold text-white mb-1">{title}</h4>
    <p className="text-indigo-100 text-[10px] md:text-sm leading-relaxed">{desc}</p>
  </div>
);

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'search' | 'bookings'>('search');
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
      <Header currentView={currentView} onViewChange={setCurrentView} />

      {currentView === 'search' ? (
        <>
          {/* --- HERO SECTION --- */}
          <section className="relative min-h-[500px] md:h-[650px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://img.staticmb.com/mbcontent/images/crop/uploads/2023/5/agartala-airport_0_1200.jpg" 
                className="w-full h-full object-cover brightness-[0.35] md:brightness-50" 
                alt="Ujjayanta Palace Tripura"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-slate-900/90"></div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4 text-center text-white">
              <span className="inline-block px-4 py-1.5 mb-6 bg-orange-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                Direct Flights to Agartala
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 tracking-tighter leading-[1.1]">
                Tripura's <span className="text-orange-500">Affordable</span> <br/> Travel Partner
              </h1>
              <p className="text-base md:text-2xl text-slate-200 max-w-2xl mx-auto font-light px-6">
                Discover the "Queen of Eastern Hills" with the most budget-friendly tickets in the market.
              </p>
            </div>
          </section>

          {/* --- SEARCH OVERLAP --- */}
          <div className="container mx-auto px-4 -mt-12 md:-mt-20 relative z-20">
            <div className="bg-white p-4 md:p-3 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100">
              <FlightSearch onSearch={handleSearch} />
            </div>
          </div>

          <main className="container mx-auto px-4 py-16 md:py-24">
            
            {/* --- FLIGHT LIST --- */}
            <div className="mb-24">
              {flights.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Best Deals Found
                  </h2>
                  <FlightList flights={flights} onSelectFlight={(f) => { setSelectedFlight(f); setShowBookingModal(true); }} loading={loading} />
                </div>
              ) : !loading && (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                  <div className="text-5xl mb-4">📍</div>
                  <h3 className="text-xl font-bold text-slate-800">Ready to explore?</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">Enter your destination to unlock hidden fares to Tripura.</p>
                </div>
              )}
            </div>

            {/* --- TRIPURA SPOTLIGHT --- */}
            <section className="mb-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900">Explore Tripura</h2>
                  <p className="text-slate-500 mt-2">Hand-picked destinations for your next trip.</p>
                </div>
                <div className="h-1 w-24 bg-orange-500 rounded-full hidden md:block"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { 
                    title: "Ujjayanta Palace", 
                    img: "https://imgs.search.brave.com/5XYwsyQWh1LFsP5N1nafDC6xX7N6daWJWCJ1pfJbb3w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS1jZG4udHJpcGFk/dmlzb3IuY29tL21l/ZGlhL3Bob3RvLW8v/MDUvMGMvNDUvODMv/dWpqeWFudGFwYWxh/Y2UtdGhlLXN0YXRl/LmpwZw", 
                    tag: "Agartala",
                    price: "₹1,499" 
                  },
                  { 
                    title: "Neermahal Water Palace", 
                    img: "https://imgs.search.brave.com/2EscS-uhK0brQGmC59HClqWEuYiKbN0eSojOFNNYEHY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/LnRyaXBvdG8uY29t/L21lZGlhL2ZpbHRl/ci9ueHhsL2ltZy83/Njc0Mi9UcmlwRG9j/dW1lbnQvMTQ5MTQy/OTY0OV9kc2NfMDAw/MS5qcGcud2VicA", 
                    tag: "Melaghar",
                    price: "₹1,250" 
                  },
                  { 
                    title: "Jampui Hills", 
                    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop", 
                    tag: "North Tripura",
                    price: "₹1,800" 
                  }
                ].map((item, i) => (
                  <div key={i} className="group relative rounded-[2rem] overflow-hidden h-[400px] shadow-xl hover:shadow-2xl transition-all duration-500 active:scale-95">
                    <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="bg-orange-600 text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase tracking-tighter mb-2 inline-block">
                            {item.tag}
                          </span>
                          <h3 className="text-white text-2xl font-extrabold leading-tight">{item.title}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs uppercase font-bold">Starts at</p>
                          <p className="text-orange-400 text-xl font-black">{item.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- BOOKING VALUE PROPOSITION --- */}
            <section className="bg-indigo-950 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
              <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black mb-8 leading-[1.1]">The Smartest Way <br/> to fly to Tripura.</h2>
                  <p className="text-indigo-200 text-base md:text-lg mb-10 leading-relaxed font-light">
                    We leverage direct local partnerships to offer regional fares that major search engines miss. Join 10,000+ travelers who save every month.
                  </p>
                  <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-white text-indigo-950 hover:bg-orange-500 hover:text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl w-full md:w-auto text-center">
                    Book Now — Save 20%
                  </button>
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
      ) : (
        <main className="container mx-auto px-4 py-12">
          <MyBookings />
        </main>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 text-slate-500 py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="text-white text-2xl font-black italic mb-4">TripuraFly</h3>
            <p className="text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              The official portal for affordable air travel across the Northeast. Connecting the hills to the world.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">Company</h4>
            <a href="#" className="hover:text-orange-500 transition-colors">About Us</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Travel Policy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Help Center</a>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">Location</h4>
            <p className="text-sm">Maharaja Bir Bikram Airport Road,</p>
            <p className="text-sm">Agartala, West Tripura - 799009</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t border-slate-900 text-[10px] text-center uppercase tracking-widest">
          © 2026 TripuraFly Aviation Services. Made for the Northeast.
        </div>
      </footer>

      {showBookingModal && selectedFlight && (
        <BookingModal flight={selectedFlight} onClose={() => { setShowBookingModal(false); setSelectedFlight(null); }} onBookingComplete={() => { setShowBookingModal(false); setSelectedFlight(null); setCurrentView('bookings'); handleSearch({ origin: '', destination: '', date: '' }); }} />
      )}
    </div>
  );
}

export default App;