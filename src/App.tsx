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
import ExplorePage from './components/ExplorePage';
import FlightDetails from './components/FlightDetails';

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
  const phoneNumber = "919366159066"; // TripuraFly Official WhatsApp
  
  // LOGIC TO GENERATE A SHORT ROUTE SUMMARY
  const routeSummary = pkg.itinerary
    .map((item: any) => item.title)
    .join(" → ");

  // CUSTOM PREMIUM TEMPLATE
  const messageTemplate = 
`🏔️ *TRIPURA TOURISM BOOKING INQUIRY*
---------------------------------------
📍 *Package:* ${pkg.packageTitle}
💰 *Total Price:* ₹${pkg.totalPrice}
⏳ *Duration:* ${pkg.totalDuration}
🗺️ *Route:* ${routeSummary}

*Hi TripuraFly!* I am interested in this official Tripura Tourism circuit. Can you please confirm the availability for my travel dates and share the booking process?

_Inquiry via TripuraFly Verified App_`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(messageTemplate);
  
  // WhatsApp Deep Link
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  // Execute Redirection
  window.open(whatsappURL, '_blank');
  
  // Reset UI State
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
            !user ? <ExplorePage /> : (
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
                  <section className="mb-5 overflow-hidden">
  {/* Header Section - Kept consistent */}
  <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div className="space-y-2">
      <span className="text-orange-500 font-black text-xs uppercase tracking-[0.4em]">Local Treasures</span>
      <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
        Tripura <span className="text-indigo-600">Specials.</span>
      </h2>
    </div>
    
  </div>

  {/* SLIDER CONTAINER */}
{/* Parent Container: Handles the Main Package Swipe */}
<div className="flex md:grid md:grid-cols-2 gap-6 md:gap-10 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory px-6 md:px-0 pb-12">
  {[
    {
      "packageTitle": "Explore Tripura",
      "totalPrice": "15,500",
      "totalDuration": "8D/7N",
      "tag": "All-in-One",
      "description": "The complete Tripura experience from Agartala heritage to the misty Jampui Hills and sacred Unakoti.",
      "itinerary": [
        { "day": "Day 1", "title": "Arrival & Heritage", "hotel": "Geetanjali Tourism Guest House", "img": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/e9/9d/a6/20161123-112144-largejpg.jpg?w=1800&h=-1&s=1", "highlights": ["Ujjayanta Palace", "State Museum", "Light & Sound Show"] },
        { "day": "Day 2", "title": "Cultural Circuit", "hotel": "Eden Tourist Lodge (Vanghmun)", "img": "https://imgs.search.brave.com/rOmdx0g3IlKWS5-VGVs-RWf8Z2FGjqn6rDVNsV0U4K4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jb250/ZW50LmpkbWFnaWNi/b3guY29tL2NvbXAv/bm9ydGgtdHJpcHVy/YS93Mi85OTk5cDM4/MjQuMzgyNC4xODEx/MjgwMDQwMDcuaDR3/Mi9jYXRhbG9ndWUv/ZWRlbi10b3VyaXN0/LWxvZGdlLWphbXB1/aS1ub3J0aC10cmlw/dXJhLWxvZGdpbmct/c2VydmljZXMtcjRh/Nmh1ZTVtcS5qcGc_/dz0zODQwJnE9NzU", "highlights": ["14 Gods Temple", "Khumulwng Eco Park", "Baramura Eco Park"] },
        { "day": "Day 3", "title": "Misty Jampui Hills", "hotel": "Eden Tourist Lodge (Vanghmun)", "img": "https://imgs.search.brave.com/mKJ0y5ZiRvtsZbkf3TmY_bfP3SORyg-zt2K9cvyEzOA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rbm93/bGVkZ2VvZmluZGlh/LmNvbS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8wMi9KYW1w/dWktSGlsbC1Bcy1T/ZWVuLUZyb20tdGhl/LVdhdGNoLVRvd2Vy/LmpwZw", "highlights": ["Jampui Hill Sightseeing", "Sunrise Point"] },
        { "day": "Day 4", "title": "Sacred Rock Carvings", "hotel": "Geetanjali Tourism Guest House", "img": "https://tripuratourism.gov.in/images/tour/1661754729/35.jpg", "highlights": ["Unakoti Rock Carvings", "Surmacherrra Waterfalls"] },
        { "day": "Day 5", "title": "Wildlife & Water", "hotel": "Sagarika Parjatan Niwas", "img": "https://imgs.search.brave.com/0GPVTtJBy8HepcP9L4tJYXnWVUNKb95qAzVbU_IFhZE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWct/Y2RuLnRoZXB1Ymxp/dmUuY29tL2ZpbHRl/cnM6Zm9ybWF0KHdl/YnApL3ByYXRpZGlu/L21lZGlhL3Bvc3Rf/YXR0YWNobWVudHMv/cHJhdGlkaW50aW1l/LzIwMjMtMDUvYzBj/MDc5NGQtNmVmMy00/ZWZiLWI3ZGYtNDUy/MWFhN2NjM2UwL0Nv/cHlfb2ZfUHJhdGlk/aW5fVGVtcGxhdGVf/XzY0Xy53ZWJw", "highlights": ["Sepahijala Zoo", "Neermahal Palace", "Tripurasundari Temple"] },
        { "day": "Day 6", "title": "Dumboor Lake Magic", "hotel": "Sagarika Parjatan Niwas", "img": "https://cdn.s3waas.gov.in/s3e4a6222cdb5b34375400904f03d8e6a5/uploads/2023/12/2023121668.jpeg", "highlights": ["Chabimura Boat Ride", "Dumboor Lake Island"] },
        { "day": "Day 7", "title": "Final Heritage Walk", "hotel": "Geetanjali Tourism Guest House", "img": "https://cdn.s3waas.gov.in/s39fe8593a8a330607d76796b35c64c600/uploads/2018/06/2018061959.jpg", "highlights": ["Pilak Excavations", "Heritage Park"] },
        { "day": "Day 8", "title": "Departure", "hotel": "None", "img": "https://imgs.search.brave.com/5MVrnGx28WFpcgSsLbiX3k-z2YZtDq2M9u8eoyNtn94/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbS5o/dW50LmluL2NnL2Fn/YXJ0YWxhL0NpdHkt/R3VpZGUvQWdhcnRh/bGFfU3RhdGlvbi5q/cGc", "highlights": ["Drop to Airport/Rail Station"] }
      ],
      "inclusions": ["AC Transportation", "TTDCL Accommodation", "Complimentary Breakfast", "Station/Airport Transfers"],
      "exclusions": ["Air/Rail Fare", "Lunch & Dinner", "Entry Fees", "Camera Fees"],
      "hotelDisclaimer": "Accommodation is provided on a twin-sharing basis. Specific lodges are subject to availability."
    },
    {
      "packageTitle": "Pilgrim Tour",
      "totalPrice": "6,500",
      "totalDuration": "4D/3N",
      "tag": "Spiritual",
      "description": "A holy circuit connecting the most revered temples of Tripura including Matabari and the 14 Gods Temple.",
      "itinerary": [
        { "day": "Day 1", "title": "City of Temples", "hotel": "Geetanjali Tourism Guest House", "img": "https://imgs.search.brave.com/LTSIpJYiuZyKbLqiRIqM1ces_XtFUAjPIsXQjK55COo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jb250/ZW50LmpkbWFnaWNi/b3guY29tL2NvbXAv/YWdhcnRhbGEvYzMv/OTk5OXB4MzgxLngz/ODEuMTQxMjI2MTQw/NjA2LmE1YzMvY2F0/YWxvZ3VlL2phZ2Fu/bmF0aC10ZW1wbGUt/YWdhcnRhbGEtaG8t/YWdhcnRhbGEtdG91/cmlzdC1hdHRyYWN0/aW9uLTNjYTh2cngu/anBnP3c9Mzg0MCZx/PTc1", "highlights": ["Jagannath Temple", "Laxminarayan Temple", "14 Gods Temple"] },
        { "day": "Day 2", "title": "Sacred Shaktipeeth", "hotel": "Sagarika Parjatan Niwas", "img": "https://imgs.search.brave.com/3U_e59idmkOeFKz6_CkAxU7kvvxGEOfb5nEIXXBmHPs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jb250/ZW50LmpkbWFnaWNi/b3guY29tL2NvbXAv/c291dGgtdHJpcHVy/YS9tNy85OTk5cDM4/MjMuMzgyMy4xNDEy/MjQxNjQ3MDIuaTNt/Ny9jYXRhbG9ndWUv/bWF0YWJhcmktdGVt/cGxlLXVkYWlwdXIt/Y291cnQtc291dGgt/dHJpcHVyYS10b3Vy/aXN0LWF0dHJhY3Rp/b24teHUwNjZiLmpw/Zz93PTM4NDAmcT03/NQ", "highlights": ["Matabari Temple", "Kamalasagar", "Boxanagar"] },
        { "day": "Day 3", "title": "Ancient Echoes", "hotel": "Geetanjali Tourism Guest House", "img": "https://imgs.search.brave.com/i_kBBm5XZnBvnNitmUyKpAasTzlDTD9tMbuseTKLVcE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rbm93/bGVkZ2VvZmluZGlh/LmNvbS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8wMi9NYWhp/c2hhc3VybWFyZGlu/aS1TdGF0dWUtYXQt/Q2hhYmltdXJhLWFz/LXNlZW4tZnJvbS1k/aXN0YW5jZS5qcGc", "highlights": ["Chabimura", "Gunabati Group of Temples", "Bhubaneswari Temple"] },
        { "day": "Day 4", "title": "Departure", "hotel": "None", "img": "https://imgs.search.brave.com/5MVrnGx28WFpcgSsLbiX3k-z2YZtDq2M9u8eoyNtn94/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbS5o/dW50LmluL2NnL2Fn/YXJ0YWxhL0NpdHkt/R3VpZGUvQWdhcnRh/bGFfU3RhdGlvbi5q/cGc", "highlights": ["Drop to Airport/Rail Station"] }
      ],
      "inclusions": ["AC Sedan", "TTDCL Guest House Stay", "Daily Breakfast", "Sightseeing"],
      "exclusions": ["Prasad/Personal Offerings", "Lunch & Dinner", "Laundry", "GST"],
      "hotelDisclaimer": "Temple area lodges are subject to availability during festival seasons."
    },
    {
      "packageTitle": "Eco Tourism Package",
      "totalPrice": "8,500",
      "totalDuration": "5D/4N",
      "tag": "Nature Escape",
      "description": "Explore the lush green side of Tripura, from botanical sanctuaries to the highest mountain ranges.",
      "itinerary": [
        { "day": "Day 1", "title": "Lush Agartala", "hotel": "Geetanjali Tourism Guest House", "img": "https://tripuratourism.gov.in/images/tour/1701244635/2.jpg", "highlights": ["Durgabari Tea Garden", "Heritage Park", "Akhaura Checkpost"] },
        { "day": "Day 2", "title": "Mountain Bound", "hotel": "Eden Tourist Lodge", "img": "https://tripuratourism.gov.in/images/tour/1661756009/86.jpg", "highlights": ["Baramura Eco Park", "Khumulwng Eco Park"] },
        { "day": "Day 3", "title": "Jampui Exploration", "hotel": "Eden Tourist Lodge", "img": "https://tripuratourism.gov.in/images/tour/1661756901/71.jpg", "highlights": ["Orange Orchards", "Betlingshib Peak View"] },
        { "day": "Day 4", "title": "Waterfalls & Valleys", "hotel": "Geetanjali Tourism Guest House", "img": "https://tripuratourism.gov.in/images/tour/1661773484/198.jpg", "highlights": ["Unakoti", "Surmacherrra Waterfalls"] },
        { "day": "Day 5", "title": "Farewell", "hotel": "None", "img": "https://imgs.search.brave.com/5MVrnGx28WFpcgSsLbiX3k-z2YZtDq2M9u8eoyNtn94/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbS5o/dW50LmluL2NnL2Fn/YXJ0YWxhL0NpdHkt/R3VpZGUvQWdhcnRh/bGFfU3RhdGlvbi5q/cGc", "highlights": ["Airport/Station Transfer"] }
      ],
      "inclusions": ["AC SUV", "Eco Lodge Stays", "Breakfast", "Guide Support"],
      "exclusions": ["Entry to Sanctuary", "Meals other than Breakfast", "GST", "Insurance"],
      "hotelDisclaimer": "Eden Tourist Lodge Jampui is subject to strict availability during Sep-Apr."
    },
    {
      "packageTitle": "Archaeological Tour",
      "totalPrice": "8,500",
      "totalDuration": "4D/3N",
      "tag": "History",
      "description": "A deep dive into the stone-carved history and archaeological marvels of ancient Tripura.",
      "itinerary": [
        { "day": "Day 1", "title": "Dynasty & Divinity", "hotel": "Sagarika Parjatan Niwas", "img": "https://tripuratourism.gov.in/images/tour/1661767443/9.png", "highlights": ["Boxanagar Buddhist Ruins", "Gunabati Temples"] },
        { "day": "Day 2", "title": "Royal Archives", "hotel": "Geetanjali Tourism Guest House", "img": "https://tripuratourism.gov.in/images/tour/1661772923/131.jpg", "highlights": ["Chabimura Rock Carvings", "Ujjayanta Palace"] },
        { "day": "Day 3", "title": "Unakoti Marvel", "hotel": "Geetanjali Tourism Guest House", "img": "https://tripuratourism.gov.in/images/tour/1661754729/35.jpg", "highlights": ["Unakoti Full Day Trip", "Ancient Sculptures"] },
        { "day": "Day 4", "title": "Departure", "hotel": "None", "img": "https://imgs.search.brave.com/5MVrnGx28WFpcgSsLbiX3k-z2YZtDq2M9u8eoyNtn94/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbS5o/dW50LmluL2NnL2Fn/YXJ0YWxhL0NpdHkt/R3VpZGUvQWdhcnRh/bGFfU3RhdGlvbi5q/cGc", "highlights": ["Drop to Airport/Rail Station"] }
      ],
      "inclusions": ["AC Car", "Heritage Stays", "Breakfast", "Archaeological Site Entry"],
      "exclusions": ["Professional Guide Fees", "GST 5%", "Lunch", "Personal Tipping"],
      "hotelDisclaimer": "Itinerary and night halt may be subject to alteration under exceptional circumstances."
    }
  ].map((item, i) => (
    <div 
      key={i} 
      className="min-w-[85vw] md:min-w-0 snap-center bg-slate-950 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-all duration-300 hover:border-orange-500/30"
    >
      {/* HERO SECTION */}
      <div className="relative h-[200px] md:h-[260px] w-full shrink-0 overflow-hidden">
        <img 
          src={item.itinerary[0].img} 
          className="w-full h-full object-cover opacity-60 transition-transform duration-1000 hover:scale-105" 
          alt={item.packageTitle} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            <span className="bg-orange-600 text-white text-[7px] md:text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              {item.tag}
            </span>
            <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[6px] md:text-[7px] font-bold px-3 py-1 rounded-full uppercase tracking-tight w-fit">
              TTDCL Approved
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-lg px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-white text-[9px] font-black tracking-tighter uppercase">{item.totalDuration}</span>
          </div>
        </div>

        <div className="absolute bottom-5 left-6 right-6">
          <h3 className="text-white text-xl md:text-3xl font-black leading-tight tracking-tighter italic uppercase drop-shadow-xl">
            {item.packageTitle}
          </h3>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-5 md:p-6 space-y-5 flex-1 flex flex-col">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em]">Route Highlights</h4>
            <div className="h-[1px] flex-1 bg-white/5 ml-3" />
          </div>

          {/* Day Horizontal Scroller */}
          <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-1 px-1 snap-x">
            {item.itinerary.map((step, idx) => (
              <div 
                key={idx} 
                className="min-w-[180px] md:min-w-[200px] snap-start bg-white/[0.03] border border-white/5 rounded-2xl p-2.5 flex gap-3 items-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img src={step.img} className="w-full h-full object-cover opacity-70" alt="Day" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-orange-500 text-[7px] font-black uppercase">{step.day}</span>
                  <h5 className="text-white text-[10px] font-bold truncate tracking-tight">{step.title}</h5>
                  <p className="text-slate-500 text-[7px] font-medium truncate uppercase mt-0.5 italic">
                    {step.hotel !== "None" ? `Stay: ${step.hotel.split(' ')[0]}` : "Departure"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="mt-auto pt-5 space-y-4 border-t border-white/5">
           <div className="flex flex-wrap gap-2">
              {item.inclusions.slice(0, 3).map((inc, ii) => (
                <div key={ii} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-2 py-1 rounded-md">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
                  <span className="text-slate-300 text-[7px] font-bold uppercase tracking-tighter">
                    {inc}
                  </span>
                </div>
              ))}
           </div>

          <div className="bg-white rounded-[1.8rem] p-1.5 flex items-center justify-between shadow-xl">
            <div className="pl-4">
              <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest mb-0.5 leading-none">Total Package</p>
              <div className="flex items-baseline">
                <span className="text-slate-900 text-[9px] font-bold mr-0.5">₹</span>
                <span className="text-slate-900 text-xl md:text-2xl font-black italic tracking-tighter leading-none">
                  {item.totalPrice}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setBookingPackage(item)} 
              className="bg-slate-950 text-white px-5 md:px-7 h-11 md:h-13 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.15em] flex items-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              Book
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
  
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
                
       {/* ALL-INDIA */}

            <section className="mb-24 overflow-hidden">
  {/* Header Section - Kept consistent */}
  <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div className="space-y-2">
      <span className="text-orange-500 font-black text-xs uppercase tracking-[0.4em]">incredible india</span>
      <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
        INDIA <span className="text-indigo-600">Specials.</span>
      </h2>
    </div>
    
  </div>

  {/* SLIDER CONTAINER */}
{/* Parent Container: Handles the Main Package Swipe */}
<div className="flex md:grid md:grid-cols-2 gap-6 md:gap-10 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory px-6 md:px-0 pb-12">
  {[
    {
  "packageTitle": "Exotic Odisha",
  "totalPrice": "14,490",
  "totalDuration": "3D/2N",
  "tag": "Temple & Coastal",
  "description": "A journey through the 'Exotic' heritage of Odisha, spanning the ancient temples of Bhubaneswar, the spiritual coast of Puri, and the natural wonder of Chilika Lake. [cite: 325, 326]",
  "itinerary": [
    {
      "day": "Day 1",
      "title": "Bhubaneswar to Puri via Konark",
      "hotel": "Hotel Shreehari / Similar",
      "img": "https://imgs.search.brave.com/tKRfp-dBMgp3uMElQ8LbP4b_gDmwcqooYHguWdfSyLk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9rb25h/cmstc3VuLXRlbXBs/ZS1idWlsdC10aC1j/ZW50dXJ5LWhpbmR1/LW9kaXNoYS1pbmRp/YS1jZS1raWxvbWV0/cmVzLW5vcnRoZWFz/dC1wdXJpLWNpdHkt/Y29hc3RsaW5lLTQw/MDg3NDI5MC5qcGc",
      "highlights": [
        "Konark Sun Temple",
        "Chandra Bhaga Beach",
        "Puri Drop-off"
      ]
    },
    {
      "day": "Day 2",
      "title": "Puri Darshan & Chilika Lake",
      "hotel": "Hotel Shreehari / Similar",
      "img": "https://imgs.search.brave.com/STGKUjKg4ArwoV4cukmNUGIhkcX-Rg2TAL1eqBmLzNg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9tYWlu/LXRlbXBsZS1kb21l/LWphZ2FubmF0aC1m/YW1vdXMtaGluZHUt/ZGVkaWNhdGVkLXRv/LWxvcmQtdmlzaG51/LWNvYXN0YWwtdG93/bi1wdXJpLW9yaXNz/YS1pbmRpYS0yMzU0/ODgxMjIuanBn",
      "highlights": [
        "Lord Jagannath Temple Darshan",
        "Satapada Boat Ride (Sea Mouth)",
        "Alarnath Temple Visit"
      ]
    },
    {
      "day": "Day 3",
      "title": "Bhubaneswar Temple Trail",
      "hotel": "None",
      "img": "https://imgs.search.brave.com/hiztP3kua1wPPBHKaq3YrYtgQzsqJf_6VWUpOfQvoyU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/ZGhhdWxpLm5ldC9p/bWFnZXMvc2hhbnRp/LXN0dXBhLWRoYXVs/aS5qcGc",
      "highlights": [
        "Dhauli Stupa & Lingaraj Temple",
        "Udaigiri & Khandagiri Caves",
        "Mukteshwar Temple"
      ]
    }
  ],
  "inclusions": [
    "AC Accommodation at Puri",
    "02 Breakfasts & 02 Dinners",
    "AC Vehicle (Seat in Coach basis)",
    "Travel Insurance",
    "Toll & Parking Charges"
  ],
  "exclusions": [
    "Air/Rail Fare",
    "Lunch Expenses",
    "Chilika Boating Charges",
    "Entry Fees & Guide Charges",
    "Special Darshan Fees"
  ],
  "hotelDisclaimer": "Check-in time is 12:00 Noon. Early check-in is subject to hotel policy and additional payment. [cite: 340, 363]"
},{
  "packageTitle": "Devbhoomi Haridwar - Rishikesh",
  "totalPrice": "16,900",
  "totalDuration": "4N/5D",
  "tag": "Pilgrimage",
  "description": "A spiritual journey to the 'Gateway to Vishnu', covering the sacred Ganga Aarti in Haridwar and the iconic hanging bridges of Rishikesh.",
  "itinerary": [
    {
      "day": "Day 1",
      "title": "Departure from Sabarmati",
      "hotel": "Train Journey",
      "img": "https://imgs.search.brave.com/OnBbz8PWKyKRwedDi0uD1dr-RRZuLF5DFivvnC14mGg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNTIx/MDA0MjMwL3Bob3Rv/L2hhci1raS1wYXVy/aS1oYXJpZHdhci5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/RmkySTV4T01lcnN1/a3RtMlBmanJBWVhl/aGhuVnZQd1hJS2xB/a1BDa2hWMD0",
      "highlights": ["Departure at 11:25 hrs", "Yoga Express (19031)", "Overnight Train Journey"]
    },
    {
      "day": "Day 2",
      "title": "Haridwar Arrival & Ganga Aarti",
      "hotel": "Sarovar Portico or similar",
      "img": "https://imgs.search.brave.com/smlTozL-Oz38QHtoxhYM1jzDr0RHehILih4zx_yZnFE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTAy/MjM2NDU5Mi9waG90/by9oYXIta2ktcGF1/cmktZ2hhdC5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9S2V0/aXlIbkJicGFoOGtL/MVNyTVFJZjRmZEZR/azJXLXpxWUdKbVRv/X0tsWT0",
      "highlights": ["Arrival at 11:20 hrs", "Hotel Check-in", "Evening Ganga Aarti at Har Ki Pauri"]
    },
    {
      "day": "Day 3",
      "title": "Temples of Haridwar",
      "hotel": "Sarovar Portico or similar",
      "img": "https://imgs.search.brave.com/NFnGfHIjfyLENYIFO7lPfr6IJmSo0BujYxriyEmmgVU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90LmV1/Y2RuLmluL3RvdXJp/c20vbGcvbWFuc2Et/ZGV2aS10ZW1wbGUt/NDEwMjAzOS53ZWJw",
      "highlights": ["Mansa Devi Temple", "Chandi Devi Temple", "Local Sightseeing"]
    },
    {
      "day": "Day 4",
      "title": "Rishikesh Exploration",
      "hotel": "Train Journey",
      "img": "https://imgs.search.brave.com/vuvlvXqcPnV5DjlYy6xwuqT3IgZWatPuHgpwmD5-hLE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zN2Fw/MS5zY2VuZTcuY29t/L2lzL2ltYWdlL2lu/Y3JlZGlibGVpbmRp/YS9yYW0tamh1bGEt/cmlzaGlrZXNoLXV0/dGFyYWtoYW5kLTMt/YXR0ci1hYm91dD9x/bHQ9ODImdHM9MTcy/NjY0NjE3NzE0NA",
      "highlights": ["Ram Jhula", "Lakshman Jhula", "Departure for Sabarmati at 14:55 hrs"]
    },
    {
      "day": "Day 5",
      "title": "Arrival at Sabarmati",
      "hotel": "None",
      "img": "https://imgs.search.brave.com/mtYUgDuRMz6RKlomPqJ2l4F4mzMXBtnruzz8nZOaSWU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jb250/ZW50LmpkbWFnaWNi/b3guY29tL3YyL2Nv/bXAvYWhtZWRhYmFk/L3MzLzA3OXB4eDc5/Lnh4NzkuMDAwMTQ3/NTM0MjM1LmU0czMv/Y2F0YWxvZ3VlL3Nh/YmFybWF0aS1yYWls/d2F5LXN0YXRpb24t/c2FiYXJtYXRpLWFo/bWVkYWJhZC1yYWls/d2F5LWVucXVpcnkt/c2VydmljZXMtYmUw/ZmJodzJ6MC5qcGc_/dz0zODQwJnE9NzU",
      "highlights": ["Arrival at 15:00 hrs", "Tour Ends"]
    }
  ],
  "inclusions": [
    "Return Train Fare (3AC/SL)",
    "Railway Station Transfers",
    "Meals (2 Breakfast + 2 Dinners)",
    "AC Land Transfers (SIC Basis)",
    "Travel Insurance"
  ],
  "exclusions": [
    "Onboard Meals",
    "Entry Tickets & Cable Car",
    "Personal Expenses",
    "Tips & Gratuities",
    "Room Service"
  ],
  "hotelDisclaimer": "Hotel check-in is 12:00 Noon. Room categories are base category. Triple sharing includes an extra mattress/rollaway bed."
}
   
  ].map((item, i) => (
    <div 
      key={i} 
      className="min-w-[85vw] md:min-w-0 snap-center bg-slate-950 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-all duration-300 hover:border-orange-500/30"
    >
      {/* HERO SECTION */}
      <div className="relative h-[200px] md:h-[260px] w-full shrink-0 overflow-hidden">
        <img 
          src={item.itinerary[0].img} 
          className="w-full h-full object-cover opacity-60 transition-transform duration-1000 hover:scale-105" 
          alt={item.packageTitle} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            <span className="bg-orange-600 text-white text-[7px] md:text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              {item.tag}
            </span>
            <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[6px] md:text-[7px] font-bold px-3 py-1 rounded-full uppercase tracking-tight w-fit">
              TRIPURAFLY Approved
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-lg px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-white text-[9px] font-black tracking-tighter uppercase">{item.totalDuration}</span>
          </div>
        </div>

        <div className="absolute bottom-5 left-6 right-6">
          <h3 className="text-white text-xl md:text-3xl font-black leading-tight tracking-tighter italic uppercase drop-shadow-xl">
            {item.packageTitle}
          </h3>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-5 md:p-6 space-y-5 flex-1 flex flex-col">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em]">Route Highlights</h4>
            <div className="h-[1px] flex-1 bg-white/5 ml-3" />
          </div>

          {/* Day Horizontal Scroller */}
          <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-1 px-1 snap-x">
            {item.itinerary.map((step, idx) => (
              <div 
                key={idx} 
                className="min-w-[180px] md:min-w-[200px] snap-start bg-white/[0.03] border border-white/5 rounded-2xl p-2.5 flex gap-3 items-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img src={step.img} className="w-full h-full object-cover opacity-70" alt="Day" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-orange-500 text-[7px] font-black uppercase">{step.day}</span>
                  <h5 className="text-white text-[10px] font-bold truncate tracking-tight">{step.title}</h5>
                  <p className="text-slate-500 text-[7px] font-medium truncate uppercase mt-0.5 italic">
                    {step.hotel !== "None" ? `Stay: ${step.hotel.split(' ')[0]}` : "Departure"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="mt-auto pt-5 space-y-4 border-t border-white/5">
           <div className="flex flex-wrap gap-2">
              {item.inclusions.slice(0, 3).map((inc, ii) => (
                <div key={ii} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-2 py-1 rounded-md">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
                  <span className="text-slate-300 text-[7px] font-bold uppercase tracking-tighter">
                    {inc}
                  </span>
                </div>
              ))}
           </div>

          <div className="bg-white rounded-[1.8rem] p-1.5 flex items-center justify-between shadow-xl">
            <div className="pl-4">
              <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest mb-0.5 leading-none">Starting Package</p>
              <div className="flex items-baseline">
                <span className="text-slate-900 text-[9px] font-bold mr-0.5">₹</span>
                <span className="text-slate-900 text-xl md:text-2xl font-black italic tracking-tighter leading-none">
                  {item.totalPrice}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setBookingPackage(item)} 
              className="bg-slate-950 text-white px-5 md:px-7 h-11 md:h-13 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.15em] flex items-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              Book
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
  
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
          <Route path='/explore'element={< ExplorePage/>}/>
          <Route path="/payment-success" element={<PaymentSuccess/>} />
          <Route path='/auth'element={<AuthForm/>}/>
          <Route path='/flight-manager'element={<FlightDetails/>}/>
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