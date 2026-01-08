import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Car, Bike, Navigation, Search, ArrowLeft, Loader2, Phone, Star, 
  ShieldCheck, MapPin, X, Zap, Info, ChevronRight, Shield, ArrowRight, 
  LocateFixed, Train, Plane, Bus, CreditCard, Wallet
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
  const { user } = useAuth();
  
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const destMarker = useRef<maplibregl.Marker | null>(null);
  
  // State
  const [step, setStep] = useState<'search' | 'select' | 'matching' | 'active'>('search');
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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // --- 1. KEYBOARD ADAPTATION LOGIC ---
  useEffect(() => {
    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        // If the viewport height is significantly less than the screen height, keyboard is open
        const isVisible = window.visualViewport.height < window.innerHeight * 0.75;
        setKeyboardVisible(isVisible);
      }
    };

    window.visualViewport?.addEventListener('resize', handleVisualViewportResize);
    return () => window.visualViewport?.removeEventListener('resize', handleVisualViewportResize);
  }, []);

  // --- 2. INITIALIZATION & LOCATION ---
  useEffect(() => {
    detectUserLocation();
  }, []);

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

  // --- 3. SEARCH ENGINE ---
  const handleSearch = async (val: string, type: 'pickup' | 'dest') => {
    type === 'pickup' ? setPickup(p => ({ ...p, address: val })) : setDestination(d => ({ ...d, address: val }));
    setActiveInput(type);
    
    if (val.length === 0) {
      setSuggestions(TRIPURA_HUBS.map(h => ({ isHub: true, ...h })));
      return;
    }

    if (val.length < 2) return;

    setIsSyncing(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val + " Tripura Agartala")}&limit=6`);
      const data = await res.json();
      const photonResults = data.features.map((f: any) => ({
        isHub: false,
        name: f.properties.name || f.properties.street || 'Agartala Location',
        detail: `${f.properties.district || ''} ${f.properties.city || ''}`,
        coords: f.geometry.coordinates
      }));
      setSuggestions(photonResults);
    } catch (e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const selectLocation = (loc: any) => {
    if (activeInput === 'pickup') setPickup({ address: loc.name, coords: loc.coords });
    else setDestination({ address: loc.name, coords: loc.coords });
    setSuggestions([]);
    setActiveInput(null);
    // Force blur to hide keyboard
    (document.activeElement as HTMLElement)?.blur();
  };

  // --- 4. MAP LOGIC ---
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
      else {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-indigo-600 border-4 border-white rounded-full shadow-2xl';
        pickupMarker.current = new maplibregl.Marker(el).setLngLat(pickup.coords).addTo(map.current);
      }
      if (!isKeyboardVisible) map.current.flyTo({ center: pickup.coords, zoom: 15 });
    }
  }, [pickup.coords]);

  useEffect(() => {
    if (pickup.coords && destination.coords) {
      if (destMarker.current) destMarker.current.setLngLat(destination.coords);
      else {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-slate-900 border-4 border-white rounded-full shadow-2xl';
        destMarker.current = new maplibregl.Marker(el).setLngLat(destination.coords).addTo(map.current!);
      }
      drawRoute();
    }
  }, [destination.coords]);

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
          map.current.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#4f46e5', 'line-width': 6, 'line-opacity': 0.8 } });
        }
        const bounds = new maplibregl.LngLatBounds();
        route.geometry.coordinates.forEach((c: any) => bounds.extend(c));
        map.current.fitBounds(bounds, { padding: {top: 50, bottom: 450, left: 50, right: 50}, duration: 1000 });
        setStep('select');
      }
    } catch (e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const confirmBooking = () => {
    setStep('matching');
    setTimeout(() => {
      setAssignedDriver({ 
        profiles: { full_name: 'Biswajit Das' }, 
        vehicle_model: 'Maruti Suzuki Swift', 
        license_plate: 'TR01-BJ-5521',
        rating: 4.8
      });
      setStep('active');
    }, 2500);
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-white overflow-hidden fixed inset-0 font-sans select-none ">
      
      {/* 1. MAP SECTION - Hides when keyboard is up to save space */}
      <div className={`relative transition-all duration-300 ${isKeyboardVisible && step === 'search' ? 'h-0 opacity-0' : 'flex-1'}`}>
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        
        {/* Floating Controls */}
        <div className="absolute top-[env(safe-area-inset-top,2rem)] left-4 right-4 flex justify-between pointer-events-none z-10">
          <button 
            onClick={() => { setStep('search'); setDestination({address:'', coords:null}); }}
            className={`pointer-events-auto p-4 bg-white rounded-2xl shadow-xl transition-all active:scale-95 ${step === 'search' ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}
          >
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          
          <button 
            onClick={detectUserLocation}
            className="pointer-events-auto p-4 bg-white rounded-2xl shadow-xl text-indigo-600 active:bg-slate-50 transition-colors"
          >
            <LocateFixed size={24} />
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC BOTTOM SHEET */}
      <div className={`bg-white shadow-[0_-15px_60px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 ease-out z-[50]
        ${isKeyboardVisible && step === 'search' ? 'h-full rounded-none' : 'h-[55vh] rounded-t-[2.5rem]'} 
        pb-[env(safe-area-inset-bottom,1rem)]`}>
        
        {/* Drag Handle - Hidden when keyboard is open */}
        {!isKeyboardVisible && (
          <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* --- STEP: SEARCH --- */}
          {step === 'search' && (
            <div className="px-6 py-2 h-full flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tripura Go</h2>
                {isKeyboardVisible && (
                  <button onClick={() => (document.activeElement as HTMLElement)?.blur()} className="text-indigo-600 font-bold text-sm">DONE</button>
                )}
              </div>
              
              <div className="space-y-3 relative flex-shrink-0">
                <div className={`flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-2 transition-all ${activeInput === 'pickup' ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-transparent'}`}>
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                  <input className="flex-1 text-sm font-bold bg-transparent outline-none" placeholder="Pickup location" value={pickup.address} onFocus={() => setActiveInput('pickup')} onChange={(e) => handleSearch(e.target.value, 'pickup')} />
                </div>

                <div className={`flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-2 transition-all ${activeInput === 'dest' ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-transparent'}`}>
                  <div className="w-2.5 h-2.5 border-2 border-slate-900 rounded-full" />
                  <input className="flex-1 text-sm font-bold bg-transparent outline-none" placeholder="Where to?" value={destination.address} onFocus={() => setActiveInput('dest')} onChange={(e) => handleSearch(e.target.value, 'dest')} />
                  {isSyncing ? <Loader2 size={16} className="animate-spin text-indigo-600" /> : <Search size={16} className="text-slate-400" />}
                </div>
              </div>

              {/* Suggestions List */}
              <div className="flex-1 overflow-y-auto mt-4 space-y-1 no-scrollbar pb-20">
                {(suggestions.length > 0 ? suggestions : TRIPURA_HUBS).map((s: any, i) => (
                  <button key={i} onClick={() => selectLocation(s)} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
                    <div className={`p-3 rounded-xl transition-colors ${s.isHub ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-100'}`}>
                      {s.icon ? <s.icon size={20} /> : <MapPin size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-slate-900 truncate leading-none mb-1">{s.name}</p>
                      <p className="text-[11px] text-slate-400 font-bold truncate uppercase tracking-widest">{s.detail}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- STEP: SELECT VEHICLE --- */}
          {step === 'select' && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="px-6 pb-4 border-b border-slate-50 flex-shrink-0">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-black text-slate-900 italic uppercase">Select Ride</h3>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-600 uppercase">Trip Distance</p>
                    <p className="text-lg font-black text-slate-900">{routeData?.distance.toFixed(1)} km</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 no-scrollbar pb-24">
                {VEHICLES.map((v) => (
                  <button 
                    key={v.id} 
                    onClick={() => setSelectedVehicle(v)} 
                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all active:scale-[0.98] ${selectedVehicle.id === v.id ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-50 bg-slate-50/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-all ${selectedVehicle.id === v.id ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                        <v.icon size={24} color={selectedVehicle.id === v.id ? 'white' : v.color} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm">{v.name}</p>
                        <p className={`text-[9px] font-bold ${selectedVehicle.id === v.id ? 'text-white/40' : 'text-slate-400'}`}>{v.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black tracking-tighter italic leading-none">₹{Math.round(v.base + (routeData?.distance * v.perKm))}</p>
                      <p className={`text-[9px] mt-1 font-bold ${selectedVehicle.id === v.id ? 'text-indigo-400' : 'text-slate-400'}`}>{v.eta} away</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* PAYMENT & SLIDER FOOTER */}
              <div className="px-6 py-4 bg-white border-t border-slate-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-4 bg-slate-50 p-1.5 rounded-3xl">
                  <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded-2xl text-[11px] font-black uppercase transition-all ${paymentMethod === 'cash' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Cash</button>
                  <button onClick={() => setPaymentMethod('online')} className={`flex-1 py-2 rounded-2xl text-[11px] font-black uppercase transition-all ${paymentMethod === 'online' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Online</button>
                </div>

                <div className="relative h-16 bg-slate-900 rounded-[2rem] overflow-hidden flex items-center">
                  <div className="absolute inset-y-0 left-0 bg-indigo-600 transition-all duration-75" style={{ width: `${sliderPos}%` }} />
                  <p className="w-full text-center text-xs font-black text-white/40 uppercase tracking-widest z-10 pointer-events-none">Swipe to Confirm</p>
                  <input type="range" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" min="0" max="100" value={sliderPos}
                    onChange={(e) => { const v = parseInt(e.target.value); setSliderPos(v); if (v > 95) confirmBooking(); }}
                    onMouseUp={() => sliderPos < 95 && setSliderPos(0)} onTouchEnd={() => sliderPos < 95 && setSliderPos(0)}
                  />
                  <div className="absolute left-1 w-14 h-14 bg-white rounded-full flex items-center justify-center z-10 transition-all duration-75" style={{ left: `calc(${sliderPos}% - ${sliderPos > 10 ? 56 : 0}px)` }}>
                    <ArrowRight className="text-slate-900" size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- STEP: MATCHING --- */}
          {step === 'matching' && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center"><Zap size={32} className="text-indigo-600" /></div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Finding Your Driver</h3>
            </div>
          )}

          {/* --- STEP: ACTIVE RIDE --- */}
          {step === 'active' && assignedDriver && (
            <div className="px-6 py-4 space-y-6 animate-in slide-in-from-bottom-10 h-full overflow-y-auto pb-20">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Arriving in 3 Mins</span>
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-2xl tracking-widest">4821</div>
              </div>
              <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem]">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedDriver.license_plate}`} alt="Driver" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-slate-900 truncate">{assignedDriver.profiles?.full_name}</h4>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{assignedDriver.vehicle_model} • {assignedDriver.license_plate}</p>
                </div>
                <button className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center"><Phone size={24} className="text-slate-900" /></button>
              </div>
              <button onClick={() => { setStep('search'); setSliderPos(0); }} className="w-full py-5 bg-rose-50 text-rose-500 rounded-3xl text-[11px] font-black uppercase tracking-widest">Cancel Trip</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}