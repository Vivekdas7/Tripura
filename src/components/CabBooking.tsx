import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Car, Bike, Navigation, Search, ArrowLeft, Loader2, Phone, Star, 
  ShieldCheck, MapPin, X, Zap, Info, ChevronRight, Shield, ArrowRight, 
  LocateFixed, Train, Plane, Bus, CreditCard, Wallet, ChevronUp
} from 'lucide-react';

/**
 * CONFIGURATION & CONSTANTS
 */
const MAPTILER_KEY = "aFQYw5QCur2NKcmDkKaP"; 
const AGARTALA_CENTER: [number, number] = [91.2863, 23.8315];

const TRIPURA_HUBS = [
  { name: 'MBB Airport Agartala', detail: 'Singerbhil, Agartala', coords: [91.2416, 23.8878], icon: Plane },
  { name: 'Agartala Railway Station', detail: 'Badharghat, Tripura', coords: [91.2778, 23.8055], icon: Train },
  { name: 'Nagerjala Bus Stand', detail: 'Battala, Agartala', coords: [91.2741, 23.8242], icon: Bus },
  { name: 'Matabari Temple', detail: 'Udaipur, Gomati Tripura', coords: [91.4925, 23.5115], icon: MapPin },
  { name: 'Rajarbag Bus Stand', detail: 'Udaipur, Tripura', coords: [91.4815, 23.5285], icon: Bus },
  { name: 'Ram Nagar Road 8', detail: 'Agartala, West Tripura', coords: [91.2735, 23.8455], icon: MapPin },
  { name: 'GB Pant Hospital', detail: 'Kunjaban, Agartala', coords: [91.2885, 23.8585], icon: ShieldCheck },
  { name: 'Radhanagar Bus Stand', detail: 'Agartala North', coords: [91.2889, 23.8512], icon: Bus },
];

const VEHICLES = [
  { id: 'bike', name: 'Moto', icon: Bike, base: 20, perKm: 7, color: '#f59e0b', eta: '2 min', desc: 'Fastest in traffic' },
  { id: 'auto', name: 'Auto', icon: Navigation, base: 45, perKm: 12, color: '#10b981', eta: '4 min', desc: 'Affordable group travel' },
  { id: 'mini', name: 'Go Mini', icon: Car, base: 80, perKm: 18, color: '#3b82f6', eta: '6 min', desc: 'Comfy AC Hatchbacks' },
  { id: 'prime', name: 'Prime Sedan', icon: ShieldCheck, base: 140, perKm: 26, color: '#6366f1', eta: '5 min', desc: 'Top rated drivers' },
  { id: 'xl', name: 'Go XL', icon: Car, base: 220, perKm: 35, color: '#1e293b', eta: '8 min', desc: '6-Seater SUVs' },
];

export default function TripuraGo() {
  const [step, setStep] = useState<'search' | 'select' | 'matching' | 'active'>('search');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeInput, setActiveInput] = useState<'pickup' | 'dest' | null>(null);
  const [pickup, setPickup] = useState({ address: 'Detecting...', coords: null as [number, number] | null });
  const [destination, setDestination] = useState({ address: '', coords: null as [number, number] | null });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[2]);
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sliderPos, setSliderPos] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [viewportHeight, setViewportHeight] = useState('100dvh');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const destMarker = useRef<maplibregl.Marker | null>(null);

  // --- MOBILE VIEWPORT & KEYBOARD FIX ---
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const height = window.visualViewport.height;
        setViewportHeight(`${height}px`);
        // If viewport is significantly smaller than screen, keyboard is likely up
        const isKb = height < window.innerHeight * 0.85;
        setKeyboardVisible(isKb);
        if (isKb) setIsExpanded(true); // Auto-expand sheet when keyboard is up
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { detectUserLocation(); }, []);

  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setPickup(prev => ({ ...prev, coords }));
          try {
            const res = await fetch(`https://photon.komoot.io/reverse?lon=${coords[0]}&lat=${coords[1]}`);
            const data = await res.json();
            if (data.features?.length > 0) {
              const f = data.features[0].properties;
              setPickup({ address: `${f.name || f.street || 'Current Location'}`, coords });
            }
          } catch (e) { setPickup({ address: 'Current Location', coords }); }
        },
        () => setPickup({ address: 'Agartala Center', coords: AGARTALA_CENTER }),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSearch = async (val: string, type: 'pickup' | 'dest') => {
    type === 'pickup' ? setPickup(p => ({ ...p, address: val })) : setDestination(d => ({ ...d, address: val }));
    setActiveInput(type);
    if (val.length === 0) { setSuggestions(TRIPURA_HUBS.map(h => ({ isHub: true, ...h }))); return; }
    if (val.length < 2) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val + " Tripura Agartala")}&limit=6`);
      const data = await res.json();
      setSuggestions(data.features.map((f: any) => ({
        isHub: false,
        name: f.properties.name || f.properties.street || 'Agartala Location',
        detail: `${f.properties.district || ''} ${f.properties.city || ''}`,
        coords: f.geometry.coordinates
      })));
    } catch (e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const selectLocation = (loc: any) => {
    if (activeInput === 'pickup') setPickup({ address: loc.name, coords: loc.coords });
    else setDestination({ address: loc.name, coords: loc.coords });
    setSuggestions([]);
    setActiveInput(null);
    setIsExpanded(false);
    (document.activeElement as HTMLElement)?.blur();
  };

  // --- MAP LOGIC ---
  useEffect(() => {
    if (pickup.coords && mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
        center: pickup.coords, zoom: 15,
      });
    }
    if (map.current && pickup.coords) {
      if (pickupMarker.current) pickupMarker.current.setLngLat(pickup.coords);
      else pickupMarker.current = new maplibregl.Marker({ color: '#4f46e5' }).setLngLat(pickup.coords).addTo(map.current);
    }
  }, [pickup.coords]);

  const drawRoute = async () => {
    if (!pickup.coords || !destination.coords) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.coords.join(',')};${destination.coords.join(',')}?overview=full&geometries=geojson`);
      const data = await res.json();
      const route = data.routes[0];
      setRouteData({ distance: route.distance / 1000, duration: route.duration / 60 });
      if (map.current) {
        if (map.current.getSource('route')) (map.current.getSource('route') as any).setData(route.geometry);
        else {
          map.current.addSource('route', { type: 'geojson', data: route.geometry });
          map.current.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#4f46e5', 'line-width': 5 } });
        }
        const bounds = new maplibregl.LngLatBounds();
        route.geometry.coordinates.forEach((c: any) => bounds.extend(c));
        map.current.fitBounds(bounds, { padding: 80 });
        setStep('select');
      }
    } catch (e) { console.error(e); } finally { setIsSyncing(false); }
  };

  useEffect(() => { if (destination.coords) drawRoute(); }, [destination.coords]);

  const confirmBooking = () => {
    setStep('matching');
    setTimeout(() => {
      setAssignedDriver({ profiles: { full_name: 'Biswajit Das' }, vehicle_model: 'Swift Dzire', license_plate: 'TR01-BJ-5521' });
      setStep('active');
    }, 2000);
  };

  return (
    <div style={{ height: viewportHeight }} className="w-full relative bg-slate-50 overflow-hidden font-sans select-none">
      
      {/* MAP VIEW */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isExpanded && step === 'search' ? 'opacity-0' : 'opacity-100'}`}>
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* BACK BUTTON */}
      {step !== 'search' && !isExpanded && (
        <button 
          onClick={() => { setStep('search'); setDestination({address:'', coords:null}); setIsExpanded(false); }}
          className="absolute top-12 left-6 z-50 p-4 bg-white rounded-2xl shadow-2xl active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} className="text-slate-900" />
        </button>
      )}

      {/* BOTTOM SHEET */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-[100]
          ${isExpanded ? 'h-full rounded-none' : 'h-[50vh] rounded-t-[2.5rem]'} 
          shadow-[0_-15px_60px_rgba(0,0,0,0.15)] flex flex-col`}
      >
        {/* UNIVERSAL PULL BAR */}
        <div 
          className="w-full py-4 flex justify-center cursor-grab active:cursor-grabbing"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          {/* 1. SEARCH STEP */}
          {step === 'search' && (
            <div className="px-6 pb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-slate-900">Where to?</h2>
                {isExpanded && (
                  <button onClick={() => setIsExpanded(false)} className="p-2 bg-slate-100 rounded-full">
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* INPUTS */}
              <div className="space-y-3 relative mb-8">
                <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${activeInput === 'pickup' ? 'border-indigo-600 bg-white' : 'border-transparent bg-slate-50'}`}>
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                  <input 
                    className="flex-1 text-sm font-bold bg-transparent outline-none" 
                    placeholder="Pickup location" 
                    value={pickup.address}
                    onFocus={() => { setActiveInput('pickup'); setIsExpanded(true); }}
                    onChange={(e) => handleSearch(e.target.value, 'pickup')}
                  />
                </div>
                <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${activeInput === 'dest' ? 'border-indigo-600 bg-white' : 'border-transparent bg-slate-50'}`}>
                  <div className="w-2.5 h-2.5 border-2 border-slate-900 rounded-full" />
                  <input 
                    className="flex-1 text-sm font-bold bg-transparent outline-none" 
                    placeholder="Search destination" 
                    value={destination.address}
                    onFocus={() => { setActiveInput('dest'); setIsExpanded(true); }}
                    onChange={(e) => handleSearch(e.target.value, 'dest')}
                  />
                  {isSyncing ? <Loader2 size={18} className="animate-spin text-indigo-600" /> : <Search size={18} className="text-slate-400" />}
                </div>
              </div>

              {/* SUGGESTIONS */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">Nearby Locations</p>
                {(suggestions.length > 0 ? suggestions : TRIPURA_HUBS).map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => selectLocation(s)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
                  >
                    <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-100 transition-colors">
                      {s.icon ? <s.icon size={20} className="text-slate-600" /> : <MapPin size={20} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-black text-slate-900 truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">{s.detail}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. SELECT RIDE STEP */}
          {step === 'select' && (
            <div className="flex flex-col h-full">
              <div className="px-6 flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Select Ride</h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Available in Agartala</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">{routeData?.distance.toFixed(1)} KM</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{Math.round(routeData?.duration)} MINS</p>
                </div>
              </div>

              <div className="px-4 space-y-3 pb-6">
                {VEHICLES.map((v) => {
                  const isSelected = selectedVehicle.id === v.id;
                  const price = Math.round(v.base + (routeData?.distance * v.perKm));
                  return (
                    <button 
                      key={v.id} 
                      onClick={() => setSelectedVehicle(v)}
                      className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all
                        ${isSelected ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-slate-50 text-slate-900 opacity-60'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                          <v.icon size={24} />
                        </div>
                        <div className="text-left">
                          <p className="text-base font-black leading-none">{v.name}</p>
                          <p className={`text-[10px] font-bold uppercase mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{v.eta} • {v.desc}</p>
                        </div>
                      </div>
                      <p className="text-xl font-black italic">₹{price}</p>
                    </button>
                  );
                })}
              </div>

              {/* PAYMENT & CONFIRM */}
              <div className="mt-auto px-6 pb-10 space-y-4">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button onClick={() => setPaymentMethod('cash')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${paymentMethod === 'cash' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>
                    <Wallet size={16} /> Cash
                  </button>
                  <button onClick={() => setPaymentMethod('online')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${paymentMethod === 'online' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>
                    <CreditCard size={16} /> Online
                  </button>
                </div>

                <div className="relative h-20 bg-slate-900 rounded-3xl overflow-hidden flex items-center p-2 group active:scale-[0.98] transition-transform">
                  <div className="absolute inset-y-0 left-0 bg-indigo-600 transition-all duration-100" style={{ width: `${sliderPos}%` }} />
                  <p className="w-full text-center text-xs font-black uppercase tracking-[0.3em] z-10 text-white/50">
                    {sliderPos > 50 ? '' : 'Swipe to Confirm'}
                  </p>
                  <input 
                    type="range" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40" 
                    min="0" max="100" value={sliderPos}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setSliderPos(v);
                      if (v > 92) confirmBooking();
                    }}
                    onMouseUp={() => sliderPos < 90 && setSliderPos(0)}
                    onTouchEnd={() => sliderPos < 90 && setSliderPos(0)}
                  />
                  <div 
                    className="absolute w-16 h-16 bg-white rounded-2xl flex items-center justify-center z-30 shadow-xl pointer-events-none transition-all"
                    style={{ left: `calc(${sliderPos}% - ${sliderPos > 15 ? 60 : 0}px)` }}
                  >
                    <ArrowRight className="text-slate-900" size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MATCHING STEP */}
          {step === 'matching' && (
            <div className="h-full flex flex-col items-center justify-center p-10 space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center"><Zap size={32} className="text-indigo-600 fill-indigo-600" /></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Finding your ride</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Searching for drivers in Agartala...</p>
              </div>
            </div>
          )}

          {/* 4. ACTIVE RIDE STEP */}
          {step === 'active' && assignedDriver && (
            <div className="px-6 py-6 space-y-8 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full">Arriving in 3 Mins</span>
                <div className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-xl tracking-tighter italic">TR01-BJ-5521</div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2.5rem] flex items-center gap-5 border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-white">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedDriver.license_plate}`} alt="Driver" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-slate-900">{assignedDriver.profiles.full_name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{assignedDriver.vehicle_model}</p>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-black">4.9</span>
                  </div>
                </div>
                <button className="p-4 bg-white rounded-2xl shadow-md text-slate-900 active:scale-90 transition-transform">
                  <Phone size={24} />
                </button>
              </div>

              <div className="mt-auto pb-10 flex gap-3">
                <button className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl text-[10px] font-black uppercase tracking-widest">Safety Toolkit</button>
                <button 
                  onClick={() => { setStep('search'); setSliderPos(0); setIsExpanded(false); }}
                  className="flex-1 py-5 bg-rose-50 text-rose-500 rounded-3xl text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel Ride
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}