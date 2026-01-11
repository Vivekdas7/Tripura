import { useEffect, useState } from 'react';
/* Changed BrowserRouter to HashRouter below to fix Vercel 404 errors */
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AlertTriangle, Info, Home, Ticket, Gamepad2, Shield, User, Car, Sparkles, ChevronRight, Plane } from 'lucide-react'; // Added icons for navigation
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import Privacy from './components/PrivacyPolicy';
import { Flight, supabase } from './lib/supabase';
import TripuraQuest from './components/TripuraQuest';
import CabBooking from './components/CabBooking';
import SupportPage from './components/Support';
import AdminDashboard from './components/AdminDashboard';
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

// --- BOTTOM NAVIGATION COMPONENT ---
// --- UPDATED BOTTOM NAVIGATION ---
const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Detect keyboard to hide nav when typing
  useEffect(() => {
    const handleResize = () => {
      // If the window height is significantly small, keyboard is likely open
      if (window.visualViewport) {
        setKeyboardVisible(window.visualViewport.height < window.innerHeight * 0.85);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  if (!user || isKeyboardVisible) return null; // Hide when keyboard is up

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Home' },
    { path: '/bookings', icon: <Ticket size={20} />, label: 'Bookings' },
    { path: '/cab-booking', icon: <Car size={20} />, label: 'Cabs' },
    { path: '/game', icon: <User size={20} />, label: 'Profile' },
  ];

 return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 z-[100] px-2 pt-3 pb-safe-offset-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-transform duration-300">
      <div className="flex justify-around items-center max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center min-w-[64px] relative">
              <div className={`w-12 h-10 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] mt-1.5 font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};



// --- TECHNICAL NOTICE BANNER ---
const TechnicalNotice = () => {
 const scrollText = "✨ UNLOCK UNBEATABLE FARES FOR YOUR NEXT JOURNEY • BOOK UP TO 60 DAYS IN ADVANCE FOR MAXIMUM SAVINGS • THE SKY IS CALLING: AIR INDIA EXPRESS & INDIGO ROUTES NOW FULLY RESTORED • TRAVEL SMARTER, FLY CHEAPER • LIMITED SEATS AT BASE PRICES • ✨ ";

  return (
    <div className="mb-6 overflow-hidden bg-[#0A2351] rounded-2xl shadow-lg border border-white/10 group">
      {/* Top Header - Static */}
      <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#0A2351] to-[#163a7a]">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            
          </div>
          <span className="text-[13px] font-black text-white uppercase tracking-tight">
            Flash Sale <span className="text-orange-400">Live</span>
          </span>
        </div>
        <Plane size={18} className="text-white/30 rotate-45" />
      </div>

      {/* Moving Text Loop (Marquee) */}
      <div className="bg-white/5 py-2.5 border-t border-white/5 relative flex items-center">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-xs font-bold text-blue-100 uppercase tracking-widest px-4">
            {scrollText}
          </span>
          <span className="text-xs font-bold text-blue-100 uppercase tracking-widest px-4">
            {scrollText}
          </span>
        </div>
      </div>

      {/* CSS for the loop - Add this to your Global CSS or style tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 25s linear infinite;
        }
      `}} />
    </div>
  );
};

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
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 md:p-4">
      {/* Background Overlay Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 transition-all">
        
        {/* Mobile Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden" />

        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Confirm Trip</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{pkg.title}</h3>
            <p className="text-orange-600 font-extrabold text-lg mt-1">₹{pkg.price} <span className="text-slate-400 text-xs font-medium">/ per person</span></p>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Date Picker - Full width for easy tapping */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Preferred Date</label>
            <input 
              type="date" 
              required 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all text-slate-900 font-bold" 
              onChange={e => setDetails({...details, date: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guest Selection */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Guests</label>
              <select 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none appearance-none font-bold text-slate-900" 
                onChange={e => setDetails({...details, travelers: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5,6,10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
              </select>
            </div>

            {/* Phone Input */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Contact Number</label>
              <input 
                type="tel" 
                placeholder="00000 00000" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none font-bold" 
                onChange={e => setDetails({...details, phone: e.target.value})} 
              />
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button 
              disabled={!details.date || !details.phone} 
              onClick={() => onConfirm(details)} 
              className="w-full py-5 bg-indigo-600 disabled:bg-slate-300 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all"
            >
              Confirm Booking
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tighter">No payment required now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LOADER ---
const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xl">
      {/* Flight Path Container */}
      <div className="relative w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-8">
        {/* The Animated Airbus A320 */}
        <div className="absolute top-1/2 -translate-y-1/2 animate-fly-horizontal">
          <Plane 
            size={32} 
            className="text-orange-500 fill-orange-500 rotate-90" 
          />
        </div>
        
        {/* Progress Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse" />
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <h2 className="text-white font-black tracking-[0.3em] uppercase text-sm animate-pulse">
          Processing Request
        </h2>
        <p className="text-slate-500 text-[9px] font-bold uppercase mt-2 tracking-widest">
          Preparing your boarding passes...
        </p>
      </div>

      {/* Tailwind & CSS Animation injected for the Flight */}
      <style>{`
        @keyframes fly-horizontal {
          0% {
            left: -10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 110%;
            opacity: 0;
          }
        }
        .animate-fly-horizontal {
          animation: fly-horizontal 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );}

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

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20 md:pb-0">
        {loading && <FullScreenLoader />}
        <Header currentView="search" onViewChange={() => {}} />

        <Routes>
          <Route path="/" element={
            !user ? <AuthForm /> : (
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
              <div className='m-5 flex items-center justify-between'>
                <TechnicalNotice/>

              </div>
              

              <main className="container mx-auto px-4 py-1">
                {/* DYNAMIC FLIGHT LIST SECTION */}
                <div className="mb-5">
                  {activeSearch ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                          <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                          Live Deals: {activeSearch.origin} to {activeSearch.destination}
                        </h2>
                      </div>
                      
                      {/* --- THE NOTICE MESSAGE --- */}
                      
                      

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
                <section className="mb-3 md:mb-24 px-0 md:px-0">
                  <div className="flex items-end justify-between mb-6 md:mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                        Tripura <span className="text-indigo-600 block md:inline">Specials</span>
                      </h2>
                      <p className="text-slate-500 text-xs md:text-sm font-bold mt-1 uppercase tracking-wider">Handpicked local getaways</p>
                    </div>
                  </div>

                  <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory pb-8">
                    {[
                      { 
                        title: "Ujjayanta Palace", 
                        img: "https://imgs.search.brave.com/VKlKADSNjxB9inPbUnYd4Q6YsqlnVmVYZ-OWl306I6o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zN2Fw/MS5zY2VuZTcuY29t/L2lzL2ltYWdlL2lu/Y3JlZGlibGVpbmRp/YS9FeHBsb3Jpbmct/SGVyaXRhZ2UtYW5k/LVJlbGlnaW91cy1H/ZW1zLW9mLUFnYXJ0/YWxhLTEtcG9wdWxh/cj9xbHQ9ODImdHM9/MTcyNjY1MTA2NzY1/MA", 
                        tag: "Agartala", 
                        price: "2,499", 
                        desc: "3 Days / 2 Nights",
                        includes: ["Hotel", "Breakfast", "Guide"],
                        excludes: ["Flight", "Dinner"]
                      },
                      { 
                        title: "Neermahal Palace", 
                        img: "https://imgs.search.brave.com/8tSgzr_irvUwd6mQQnNXE-PQE6VFCs0zbmtaVSvOgZI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMuaW5kaWEuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzA4L25lZXJtYWhh/bC5qcGc_aW1wb2xp/Y3k9TWVkaXVtX1dp/ZHRob25seSZ3PTcw/MA", 
                        tag: "Melaghar", 
                        price: "1,250", 
                        desc: "2 Days / 1 Night",
                        includes: ["Boating", "Entry Fees", "Lunch","Bus"],
                        excludes: ["Stay", "Transport"]
                      },
                      { 
                        title: "Jampui Hills", 
                        img: "https://imgs.search.brave.com/mKJ0y5ZiRvtsZbkf3TmY_bfP3SORyg-zt2K9cvyEzOA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rbm93/bGVkZ2VvZmluZGlh/LmNvbS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8wMi9KYW1w/dWktSGlsbC1Bcy1T/ZWVuLUZyb20tdGhl/LVdhdGNoLVRvd2Vy/LmpwZw", 
                        tag: "North Tripura", 
                        price: "3,800", 
                        desc: "2 Days / 1 Nights",
                        includes: ["Resort", "Trekking", "All Meals"],
                        excludes: ["Photography", "Personal Care"]
                      }
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className="min-w-[90vw] sm:min-w-[45vw] md:min-w-full snap-center group relative rounded-[2.5rem] overflow-hidden h-[480px] shadow-xl border border-slate-100/10"
                      >
                        <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" alt={item.title} />
                        
                        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                          <span className="bg-white/95 backdrop-blur-md text-indigo-900 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-xl">
                            {item.tag}
                          </span>
                          <div className="bg-orange-500 text-white p-2 rounded-2xl shadow-lg">
                             <span className="text-[10px] font-black block leading-none">HOT</span>
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                          <div className="mb-3">
                             <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-1">{item.desc}</p>
                             <h3 className="text-white text-3xl font-black leading-tight drop-shadow-md">{item.title}</h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-6 opacity-90">
                            {item.includes.map((inc, idx) => (
                              <span key={idx} className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                                ✓ {inc}
                              </span>
                            ))}
                            {item.excludes.map((exc, idx) => (
                              <span key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 text-white/40 text-[10px] font-bold px-3 py-1 rounded-lg">
                                × {exc}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-[2rem] border border-white/20">
                            <div className="flex-1">
                              <span className="text-white/60 text-[10px] font-bold uppercase block tracking-tighter">Total Package</span>
                              <p className="text-white text-2xl font-black leading-none mt-1">₹{item.price}</p>
                            </div>
                            <button 
                              onClick={() => setBookingPackage(item)} 
                              className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest active:scale-90 transition-all shadow-lg hover:bg-white hover:text-indigo-900"
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="min-w-[1px] md:hidden" />
                  </div>
                </section>

                 <p className="text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
          TripuraFly v2.4.0 • Encrypted Connection
        </p>
              </main>
            </>
          )} />
          <Route path="/bookings" element={!user ? <AuthForm /> : <main className="container mx-auto px-4 py-12"><MyBookings /></main>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/game" element={<TripuraQuest/>} />
          <Route path="/cab-booking" element={<CabBooking/>} />
          <Route path="/support" element={<SupportPage/>} />
          <Route path="/admin-pannel-vivekdas" element={<AdminDashboard/>} />
        </Routes>

        {/* FOOTER */}
        

        {/* BOTTOM NAV INJECTED HERE */}
        <BottomNav />

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