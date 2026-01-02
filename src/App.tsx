import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AlertTriangle, Info } from 'lucide-react'; // Added icons for the notice
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import Privacy from './components/PrivacyPolicy';
import { Flight, supabase } from './lib/supabase';

// --- TECHNICAL NOTICE BANNER ---
const TechnicalNotice = () => (
  <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top duration-500">
    <div className="bg-orange-500 p-2 rounded-lg text-white mt-0.5">
      <AlertTriangle size={18} />
    </div>
    <div>
      <h4 className="text-sm font-black text-orange-900 uppercase tracking-tight">System Update in Progress</h4>
      <p className="text-xs text-orange-800 leading-relaxed font-medium mt-1">
        Due to a technical outrage with our low-cost carrier partners, we are currently showing <span className="font-black">Air India</span> flights only. We apologize for the inconvenience and are working to restore IndiGo and other airlines shortly.
      </p>
    </div>
  </div>
);

// --- SUCCESS POPUP ---
const SuccessPopup = ({ details, onClose }: { details: any, onClose: () => void }) => (
  <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
    <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">✓</div>
      <h3 className="text-3xl font-black text-slate-900 mb-2">Booking Sent!</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        Your trip to <span className="font-bold text-indigo-600">{details.package_name}</span> is being prepared. Our Agartala office will contact you within 15 minutes.
      </p>
      <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
        Awesome, Thanks!
      </button>
    </div>
  </div>
);

// --- PACKAGE MODAL ---
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
          <input type="date" required className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={e => setDetails({...details, date: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <select className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={e => setDetails({...details, travelers: parseInt(e.target.value)})}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
            </select>
            <input type="tel" placeholder="Mobile number" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={e => setDetails({...details, phone: e.target.value})} />
          </div>
          <button disabled={!details.date || !details.phone} onClick={() => onConfirm(details)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LOADER ---
const FullScreenLoader = () => (
  <div className="fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
    <div className="w-24 h-24 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin"></div>
    <div className="mt-6 text-center text-white font-bold tracking-widest uppercase">Processing Request</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
    <div className="text-4xl mb-3">{icon}</div>
    <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
    <p className="text-indigo-100 text-sm">{desc}</p>
  </div>
);

function App() {
  const { user, loading: authLoading } = useAuth();
  
  // Real-time Search State
  const [activeSearch, setActiveSearch] = useState<{origin: string, destination: string, date: string} | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingPackage, setBookingPackage] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  const handleSearch = (filters: { origin: string; destination: string; date: string }) => {
    setActiveSearch(filters);
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
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <AuthForm />;

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
        {loading && <FullScreenLoader />}
        <Header currentView="search" onViewChange={() => {}} />

        <Routes>
          <Route path="/" element={
            <>
              {/* HERO SECTION */}
              <section className="relative min-h-[500px] md:h-[650px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img src="https://img.staticmb.com/mbcontent/images/crop/uploads/2023/5/agartala-airport_0_1200.jpg" className="w-full h-full object-cover brightness-[0.35]" alt="Agartala" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-slate-900/90"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                  <span className="inline-block px-4 py-1.5 mb-6 bg-orange-600 text-xs font-bold uppercase tracking-[0.2em] rounded-full">Tripura's #1 Flight Provider</span>
                  <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 tracking-tighter">Your Journey <br/> <span className="text-orange-500">Starts Here.</span></h1>
                </div>
              </section>

              {/* SEARCH BAR POSITIONED OVER HERO */}
              <div className="container mx-auto px-4 -mt-12 md:-mt-20 relative z-20">
                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100">
                  <FlightSearch onSearch={handleSearch} />
                </div>
              </div>

              <main className="container mx-auto px-4 py-16">
                {/* DYNAMIC FLIGHT LIST SECTION */}
                <div className="mb-24">
                  {activeSearch ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                          <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                          Live Deals: {activeSearch.origin} to {activeSearch.destination}
                        </h2>
                      </div>
                      
                      {/* --- THE NOTICE MESSAGE --- */}
                      <TechnicalNotice />

                      <FlightList 
                        searchParams={activeSearch} 
                        onSelectFlight={(f) => { setSelectedFlight(f); setShowBookingModal(true); }} 
                      />
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                      <div className="text-5xl mb-4">✈️</div>
                      <h3 className="text-xl font-bold text-slate-800">Search for Live Flights</h3>
                      <p className="text-slate-400">Enter airport codes (BOM, DEL, IXA) to get real-time airline pricing.</p>
                    </div>
                  )}
                </div>

                {/* PACKAGES SECTION */}
                <section className="mb-24">
                  <h2 className="text-3xl font-black text-slate-900 mb-8">Tripura <span className="text-indigo-600">Specials</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { title: "Ujjayanta Palace", img: "https://img.staticmb.com/mbcontent/images/crop/uploads/2023/5/agartala-airport_0_1200.jpg", tag: "Agartala", price: "1499", desc: "3 Days / 2 Nights" },
                      { title: "Neermahal Palace", img: "https://imgs.search.brave.com/2EscS-uhK0brQGmC59HClqWEuYiKbN0eSojOFNNYEHY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/LnRyaXBvdG8u/Y29t/L21lZGlhL2ZpbHRl/ci9ueHhsL2ltZy83/Njc0Mi9UcmlwRG9j/dW1lbnQvMTQ5MTQy/OTY0OV9kc2NfMDAw/MS5qcGcud2VicA", tag: "Melaghar", price: "1250", desc: "2 Days / 1 Night" },
                      { title: "Jampui Hills", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop", tag: "North Tripura", price: "1800", desc: "4 Days / 3 Nights" }
                    ].map((item, i) => (
                      <div key={i} className="group relative rounded-[2.5rem] overflow-hidden h-[400px] shadow-lg">
                        <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                          <h3 className="text-white text-2xl font-black">{item.title}</h3>
                          <p className="text-orange-400 font-bold mb-4">₹{item.price}</p>
                          <button onClick={() => setBookingPackage(item)} className="bg-white text-indigo-900 py-3 rounded-xl font-black text-sm">Book Package</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* FEATURES SECTION */}
                <section className="bg-indigo-950 rounded-[3rem] p-12 text-white">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="text-4xl font-black mb-6">Why TripuraFly?</h2>
                      <p className="text-indigo-200 mb-8">We are Tripura's local travel tech partner, offering fares integrated directly with regional carriers.</p>
                      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold">Start Searching</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FeatureCard icon="🚀" title="Instant" desc="E-Tickets" />
                      <FeatureCard icon="🔒" title="Secure" desc="Payments" />
                      <FeatureCard icon="🎧" title="24/7" desc="Local Support" />
                      <FeatureCard icon="🎟️" title="Best" desc="Regional Fares" />
                    </div>
                  </div>
                </section>
              </main>
            </>
          } />
          <Route path="/bookings" element={<main className="container mx-auto px-4 py-12"><MyBookings /></main>} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>

        {/* FOOTER */}
        <footer className="bg-slate-950 text-slate-500 py-12 text-center">
          <h3 className="text-white text-xl font-black italic mb-2">TripuraFly</h3>
          <p className="text-[9px] uppercase tracking-widest mb-4">© 2026 TripuraFly Aviation. महाराजा बीर बिक्रम एअरपोर्ट, अगरतला</p>
          <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-tighter">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </footer>

        {/* MODALS */}
        {showBookingModal && selectedFlight && (
          <BookingModal flight={selectedFlight} onClose={() => setShowBookingModal(false)} onBookingComplete={() => setShowBookingModal(false)} />
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