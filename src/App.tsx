import { useEffect, useState } from 'react';
/* Changed BrowserRouter to HashRouter below to fix Vercel 404 errors */
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { 
  AlertTriangle, Info, Home, Ticket, Gamepad2, Shield, User, Car, 
  Sparkles, ChevronRight, Plane, Gift, Zap, Utensils, Star, 
  Clock, MapPin, Phone, Mail, Globe, ArrowRight, ShieldCheck, 
  Navigation, CreditCard, Heart, Search, Menu, X, Trash2, Camera,
  Package,
  Train,
  CheckCircle2,
  Calendar
} from 'lucide-react'; 
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
import TechnicalNotice from './components/TechnicalNotice';
import PaymentSuccess from './components/PaymentSuccess';
import TrainBookingPage from './components/TrainBookingPage';
import ReferralPage from './components/ReferralPage';
import PackageModal from './components/PackageModal';
import FlightTracker from './components/FlightTracker';
import RefundPage from './components/Refund';

// --- STYLED LOADER COMPONENT (5 SECONDS) ---
const BeautifulLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, 45); // Smooth progression over 4.5s-5s
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      
      <div className="relative w-80 flex flex-col items-center">
        {/* Animated Flight Path */}
        <div className="relative w-full h-[2px] bg-white/5 rounded-full mb-12 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div 
            className="absolute h-full bg-gradient-to-r from-transparent via-orange-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          {/* Flying Plane Icon */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `calc(${progress}% - 20px)` }}
          >
            <Plane size={24} className="text-white fill-white rotate-90 drop-shadow-[0_0_10px_#fff]" />
          </div>
        </div>

        {/* Textual Cues */}
        <div className="text-center space-y-3">
          <h2 className="text-white text-2xl font-black tracking-widest uppercase">
            Tripura<span className="text-orange-500">Fly</span>
          </h2>
          <div className="h-6 overflow-hidden">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] animate-slide-up">
              {progress < 30 ? "Initializing Cloud Sync..." : 
               progress < 60 ? "Scanning Regional Routes..." : 
               progress < 90 ? "Fetching Live Fares..." : "Ready for Departure"}
            </p>
          </div>
        </div>

        {/* Dynamic Percentage */}
        <div className="mt-8">
           <span className="text-white/20 text-6xl font-black italic tabular-nums">
             {progress.toString().padStart(2, '0')}
           </span>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};


const handleWhatsAppRedirect = (pkg: any) => {
  // CONFIGURATION
  const phoneNumber = "919366159066"; // Your WhatsApp Number
  
  // CUSTOM TEMPLATE
  const messageTemplate = 
`👋 *NEW TRIPURA PACKAGE INQUIRY*

*Package Name:* ${pkg.title}
*Price:* ₹${pkg.price}
*Duration:* ${pkg.duration}

Hi TripuraFly! I saw this special package and I'm interested in booking it. Can you please share the availability and more details?

_Sent from TripuraFly Mobile App_`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(messageTemplate);
  
  // Open WhatsApp
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappURL, '_blank');
  
  // Close the modal
  setBookingPackage(null);
};





// --- NAVIGATION COMPONENTS ---
const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setKeyboardVisible(window.visualViewport.height < window.innerHeight * 0.85);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  if (!user || isKeyboardVisible) return null;

  const navItems = [
    { path: '/', icon: <Home size={22} />, label: 'Home' },
    { path: '/bookings', icon: <Ticket size={22} />, label: 'Bookings' },
    { path: '/cab-booking', icon: <Car size={22} />, label: 'Cabs' },
    { path: '/game', icon: <User size={22} />, label: 'Profile' },
    // {path:'/train-booking',icon:<Train size={22}/>,label:'Train'}
  ];

  return (
    /* OUTER WRAPPER: 
       Positioned at the true bottom (0).
       Uses safe-area-inset-bottom to push the content above system buttons.
    */
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pointer-events-none">
      <nav className="pointer-events-auto max-w-lg mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-2 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className="flex flex-col items-center group min-w-[64px]"
              >
                <div className={`w-12 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive 
                  ? 'bg-orange-500 text-white scale-110 shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                  : 'text-slate-500'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[8px] mt-1.5 font-black uppercase tracking-widest transition-opacity duration-300 ${
                  isActive ? 'opacity-100 text-orange-500' : 'opacity-40 text-white'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

// --- ADDITIONAL UI: LOYALTY COMPONENT ---


// --- IMPROVED SUCCESS POPUP ---
const SuccessPopup = ({ details, onClose }: { details: any, onClose: () => void }) => (
  <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
    <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-slate-100 animate-in zoom-in duration-500">
      <div className="relative w-28 h-28 mx-auto mb-8">
        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
        <div className="relative w-28 h-28 bg-emerald-500 text-white rounded-full flex items-center justify-center text-5xl shadow-2xl shadow-emerald-200">
          <ShieldCheck size={48} strokeWidth={3} />
        </div>
      </div>
      <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Request Received!</h3>
      <p className="text-slate-500 text-base leading-relaxed mb-8">
        Your package booking for <span className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4">{details.package_name}</span> is being processed. 
        Expect a call from our executive shortly.
      </p>
      <div className="bg-slate-50 p-6 rounded-3xl mb-8 flex items-center justify-between border border-slate-100">
        <div className="text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
          <p className="font-mono text-xs font-bold text-slate-700">TF-{Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>
        <Clock size={20} className="text-orange-500" />
      </div>
      <button onClick={onClose} className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
        Continue Exploring <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

// --- MAIN APPLICATION LOGIC ---
function App() {
  const { user, loading: authLoading } = useAuth();
  
  // States
  const [appReady, setAppReady] = useState(false);
  const [activeSearch, setActiveSearch] = useState<{origin: string, destination: string, date: string} | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingPackage, setBookingPackage] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

 const handleWhatsAppRedirect = (pkg: any) => {
  // CONFIGURATION
  const phoneNumber = "919366159066"; // Your WhatsApp Number
  
  // CUSTOM TEMPLATE
  const messageTemplate = 
`👋 *NEW TRIPURA PACKAGE INQUIRY*

*Package Name:* ${pkg.title}
*Price:* ₹${pkg.price}
*Duration:* ${pkg.duration}

Hi TripuraFly! I saw this special package and I'm interested in booking it. Can you please share the availability and more details?

_Sent from TripuraFly Mobile App_`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(messageTemplate);
  
  // Open WhatsApp
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappURL, '_blank');
  
  // Close the modal
  setBookingPackage(null);
};


  // Pre-loader effect
  if (!appReady && !authLoading) {
    return <BeautifulLoader onComplete={() => setAppReady(true)} />;
  }

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/5 border-t-orange-500 rounded-full animate-spin"></div>
        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={20} />
      </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20 md:pb-0">
        {loading && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-white/60 backdrop-blur-md">
            <div className="flex flex-col items-center">
              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-[loading_1.5s_infinite]" />
              </div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Securing Server Connection</p>
            </div>
          </div>
        )}

        <Header currentView="search" onViewChange={() => {}} />

        <Routes>
          <Route path="/" element={
            !user ? <AuthForm /> : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* HERO SECTION */}
                <section className="relative h-[90vh] md:h-[850px] flex items-center justify-center overflow-hidden bg-slate-950">
                  <div className="absolute inset-0 z-0">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50 scale-110 blur-[2px] md:blur-0">
                      <source src="assets/video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
                  </div>

                  <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
                    <div className="mb-8 px-6 py-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full animate-bounce">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em]">Ready for Agartala?</span>
                    </div>

                    <h1 className="text-[14vw] md:text-[10rem] font-black text-white leading-[0.75] tracking-tighter text-center">
                      FLY<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-indigo-500">HIGHER.</span>
                    </h1>

                    {/* CENTER MARQUEE */}
                    <div className="mt-12 w-full max-w-[90vw] md:max-w-4xl bg-white/5 backdrop-blur-3xl border border-white/10 py-5 rounded-[3rem] overflow-hidden shadow-2xl">
                      <div className="flex whitespace-nowrap animate-marquee-center">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center gap-12 px-6">
                            <span className="text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                              <Zap size={14} className="text-orange-500 fill-orange-500" /> IXA Direct Flights
                            </span>
                            <span className="text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                              <Utensils size={14} className="text-emerald-400" /> Free Meals Live
                            </span>
                            <span className="text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                              <Navigation size={14} className="text-indigo-400" /> Verified Tours
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                

                {/* SEARCH INTERFACE */}
                <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-20">
                  <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-slate-100">
                    <FlightSearch onSearch={(f) => setActiveSearch(f)} />
                  </div>
                </div>

                <main className="container mx-auto px-4 py-12 max-w-7xl">
                  <TechnicalNotice />
                  
                  {/* SEARCH RESULTS */}
                  <div className="my-16">
                    {activeSearch ? (
                      <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                            Live Deals for <span className="text-indigo-600 uppercase">{activeSearch.origin}</span>
                          </h2>
                          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl text-indigo-600 font-black text-xs uppercase tracking-widest">
                            <Clock size={14} /> Updated 2m ago
                          </div>
                        </div>
                        <FlightList 
                          searchParams={activeSearch} 
                          onSelectFlight={(f) => { setSelectedFlight(f); setShowBookingModal(true); }} 
                        />
                      </div>
                    ) : (
                      <div className="bg-[#f8fafc] border-4 border-dashed border-slate-200 rounded-[3.5rem] py-24 text-center group">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                           <Search className="text-slate-300" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Search for Live Routes</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mt-4 text-sm font-medium">Use airport codes like IXA, DEL, or CCU to view real-time airline pricing from our partners.</p>
                      </div>
                    )}
                  </div>

               
       
  

                  {/* PACKAGE SHOWCASE */}
                  <section className="mb-24 overflow-hidden">
  {/* Header Section - Kept consistent */}
  <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div className="space-y-2">
      <span className="text-orange-500 font-black text-xs uppercase tracking-[0.4em]">Local Treasures</span>
      <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
        Tripura <span className="text-indigo-600">Specials.</span>
      </h2>
    </div>
    <Link to="/support" className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors">
      View All Packages <ChevronRight size={16} />
    </Link>
  </div>

  {/* SLIDER CONTAINER */}
{/* Parent Container: Handles the Main Package Swipe */}
<div className="flex md:grid md:grid-cols-2 gap-6 md:gap-10 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory px-6 md:px-0 pb-12">
  {
    [
      {
        "packageTitle": "The Grand Tripura Odyssey",
        "totalPrice": "14,999",
        "totalDuration": "7D/6N",
        "tag": "Ultimate Combo",
        "description": "A luxury circuit covering the Royal Heritage, Rock carvings of Unakoti, and the island magic of Dumboor.",
        "itinerary": [
          { 
            "day": "Day 1",
            "title": "Agartala Arrival", 
            "hotel": "Hotel Polo Tower (5-Star)",
            "img": "https://imgs.search.brave.com/VKlKADSNjxB9inPbUnYd4Q6YsqlnVmVYZ-OWl306I6o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zN2Fw/MS5zY2VuZTcuY29t/L2lzL2ltYWdlL2lu/Y3JlZGlibGVpbmRp/YS9FeHBsb3Jpbmct/SGVyaXRhZ2UtYW5k/LVJlbGlnaW91cy1H/ZW1zLW9mLUFnYXJ0/YWxhLTEtcG9wdWxh/cj9xbHQ9ODImdHM9/MTcyNjY1MTA2NzY1/MA", 
            "highlights": ["Ujjayanta Palace", "Heritage Walk"]
          },
          { 
            "day": "Day 2",
            "title": "Heritage & Water", 
            "hotel": "Sagar Mahal Tourist Lodge",
            "img": "https://imgs.search.brave.com/8tSgzr_irvUwd6mQQnNXE-PQE6VFCs0zbmtaVSvOgZI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMuaW5kaWEuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzA4L25lZXJtYWhh/bC5qcGc_aW1wb2xp/Y3k9TWVkaXVtX1dp/ZHRob25seSZ3PTcw/MA", 
            "highlights": ["Matabari Temple", "Neermahal Boat Trip"]
          },
          { 
            "day": "Day 3",
            "title": "Island Paradise", 
            "hotel": "Narikel Kunju Log Huts",
            "img": "https://www.tripuratourism.gov.in/sites/default/files/styles/destination_banner_image/public/2021-12/Dumboor%20Lake.jpg", 
            "highlights": ["Dumboor Lake", "Island Stay"]
          },
          { 
            "day": "Day 4",
            "title": "Unakoti Spirits", 
            "hotel": "Unakoti Tourist Lodge",
            "img": "https://www.tripuratourism.gov.in/sites/default/files/styles/destination_banner_image/public/2021-12/Unakoti.jpg", 
            "highlights": ["Rock Carvings", "Ancient Caves"]
          },
          { 
            "day": "Day 5-6",
            "title": "Misty Peaks", 
            "hotel": "Eden Tourist Lodge (Jampui)",
            "img": "https://imgs.search.brave.com/mKJ0y5ZiRvtsZbkf3TmY_bfP3SORyg-zt2K9cvyEzOA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rbm93/bGVkZ2VvZmluZGlh/LmNvbS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8wMi9KYW1w/dWktSGlsbC1Bcy1T/ZWVuLUZyb20tdGhl/LVdhdGNoLVRvd2Vy/LmpwZw", 
            "highlights": ["Sunrise Point", "Orange Gardens"]
          },
          { 
            "day": "Day 7",
            "title": "Wildlife Safari", 
            "hotel": "Departure",
            "img": "https://www.tripuratourism.gov.in/sites/default/files/styles/destination_banner_image/public/2021-12/Sepahijala.jpg", 
            "highlights": ["Sepahijala Zoo", "Botanical Garden"]
          }
        ],
        "inclusions": ["Innova Crysta", "Daily Breakfast", "Entry Fees", "Guide"]
      },
      {
        "packageTitle": "Spiritual South Circuit",
        "totalPrice": "8,499",
        "totalDuration": "4D/3N",
        "tag": "Pilgrimage",
        "description": "A focused journey through Tripura's most sacred temples and the iconic Neermahal Water Palace.",
        "itinerary": [
          { 
            "day": "Day 1",
            "title": "Matabari Blessing", 
            "hotel": "Gomati Tourist Lodge",
            "img": "https://imgs.search.brave.com/8tSgzr_irvUwd6mQQnNXE-PQE6VFCs0zbmtaVSvOgZI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMuaW5kaWEuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzA4L25lZXJtYWhh/bC5qcGc_aW1wb2xp/Y3k9TWVkaXVtX1dp/ZHRob25seSZ3PTcw/MA", 
            "highlights": ["Sundari Temple", "Kalyan Sagar"]
          },
          { 
            "day": "Day 2",
            "title": "Royal Neermahal", 
            "hotel": "Sagar Mahal Lodge",
            "img": "https://imgs.search.brave.com/8tSgzr_irvUwd6mQQnNXE-PQE6VFCs0zbmtaVSvOgZI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMuaW5kaWEuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzA4L25lZXJtYWhh/bC5qcGc_aW1wb2xp/Y3k9TWVkaXVtX1dp/ZHRob25seSZ3PTcw/MA", 
            "highlights": ["Rudrasagar Lake", "Architecture Tour"]
          }
        ],
        "inclusions": ["AC Sedan", "Temple VIP Entry", "Breakfast", "Boat Charges"]
      }
    ].map((item, i) => (
      /* Outer Card: snap-center allows for the horizontal flicking effect */
      <div 
        key={i} 
        className="min-w-[85vw] md:min-w-full snap-center bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border border-white/5 flex flex-col"
      >
        {/* TOP HERO SECTION */}
        <div className="relative h-[240px] md:h-[300px] w-full shrink-0">
          <img 
            src={item.itinerary[0].img} 
            className="w-full h-full object-cover opacity-60 transition-transform duration-700 hover:scale-110" 
            alt="Hero" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/20" />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
            <span className="bg-orange-600 text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
              {item.tag}
            </span>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-white text-[9px] font-bold tracking-wider">{item.totalDuration}</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-8 right-8">
            <h3 className="text-white text-2xl md:text-3xl font-black leading-tight tracking-tighter italic uppercase">
              {item.packageTitle}
            </h3>
          </div>
        </div>

        {/* INNER CONTENT AREA */}
        <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] italic">Itinerary Highlights</h4>

            {/* Internal Horizontal Swipe: Itinerary Days */}
            <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-2 px-2 snap-x">
              {item.itinerary.map((step, idx) => (
                <div 
                  key={idx} 
                  className="min-w-[200px] snap-start bg-white/5 border border-white/10 rounded-[1.8rem] p-4 relative overflow-hidden"
                >
                  <span className="text-orange-500 text-[9px] font-black uppercase mb-1 block">{step.day}</span>
                  <h5 className="text-white text-sm font-bold truncate mb-2">{step.title}</h5>
                  <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-slate-400 text-[8px] font-medium truncate uppercase tracking-tighter">{step.hotel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRICING & CTA BLOCK */}
          <div className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex flex-wrap gap-2">
                {item.inclusions.slice(0, 3).map((inc, ii) => (
                  <span key={ii} className="text-emerald-400 text-[7px] font-black uppercase tracking-widest border border-emerald-500/20 px-2 py-1 rounded-md">
                    ✓ {inc}
                  </span>
                ))}
             </div>

            <div className="bg-white rounded-[2rem] p-2 flex items-center justify-between shadow-2xl">
              <div className="pl-4">
                <p className="text-slate-400 text-[8px] font-bold uppercase leading-none mb-1">Total Package</p>
                <p className="text-slate-900 text-xl font-black italic tracking-tighter leading-none">₹{item.totalPrice}</p>
              </div>
              <button 
                onClick={() => setBookingPackage(item)} 
                className="bg-slate-900 text-white px-6 py-4 rounded-[1.6rem] font-black text-[9px] uppercase tracking-[0.15em] active:scale-95 transition-all"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    ))
  }
  
  {/* Spacer to handle end-padding on mobile swipe */}
  <div className="min-w-[20px] md:hidden" />

  <style dangerouslySetInnerHTML={{ __html: `
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}} />
</div>

  {/* Inline Styles for hiding scrollbar */}
  <style dangerouslySetInnerHTML={{ __html: `
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}} />
</section>

                  {/* STATS SECTION */}
                  <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-20 border-t border-slate-100">
                    {[
                      { val: "10+", label: "Happy Flyers" },
                      { val: "4.9/5", label: "User Rating" },
                      { val: "100%", label: "Safe Booking" },
                      { val: "24/7", label: "Local Support" }
                    ].map((stat, i) => (
                      <div key={i} className="text-center group">
                        <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{stat.val}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">{stat.label}</p>
                      </div>
                    ))}
                  </section>
                </main>

                {/* PREMIUM FOOTER */}
            </div>
          )} />
          
          <Route path="/bookings" element={!user ? <AuthForm /> : <main className="container mx-auto px-4 py-12"><MyBookings /></main>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/game" element={<TripuraQuest/>} />
          <Route path="/cab-booking" element={<CabBooking/>} />
          <Route path="/support" element={<SupportPage/>} />
           <Route path="/ref" element={<ReferralPage/>} />
           <Route path="/flight-tracking" element={<FlightTracker/>} />
          <Route path="/refund" element={<RefundPage/>} />
          <Route path='/train-booking'element={<TrainBookingPage/>}/>
          <Route path="/payment-success" element={<PaymentSuccess/>} />
          
          <Route path="/admin-pannel-vivekdas" element={<AdminDashboard/>} />
          
        </Routes>

        <BottomNav />

        {/* MODALS */}
        {showBookingModal && selectedFlight && (
          <BookingModal flight={selectedFlight} onClose={() => setShowBookingModal(false)} onBookingComplete={() => setShowBookingModal(false)} />
        )}
      {bookingPackage && (
  <PackageModal 
    pkg={bookingPackage} 
    onClose={() => setBookingPackage(null)} 
    onConfirmSubmit={handleWhatsAppRedirect} 
  />
)}
        {showSuccess && completedBooking && (
          <SuccessPopup details={completedBooking} onClose={() => setShowSuccess(false)} />
        )}

        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes marquee-center {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-center {
            display: flex;
            animation: marquee-center 25s linear infinite;
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
          }
        `}</style>
      </div>
    </Router>
  );
}

export default App;