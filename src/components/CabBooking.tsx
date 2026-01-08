import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Car, Bike, Navigation, Search, ArrowLeft, Loader2, Phone, Star, 
  ShieldCheck, MapPin, Clock, X, Zap, Calendar, Info, CreditCard, ChevronRight
} from 'lucide-react';

const MAPTILER_KEY = "aFQYw5QCur2NKcmDkKaP"; 
const AGARTALA_CENTER: [number, number] = [91.2863, 23.8315];

const VEHICLES = [
  { id: 'bike', name: 'Moto', icon: Bike, base: 20, perKm: 7, color: '#f59e0b', eta: '2 min' },
  { id: 'auto', name: 'Auto', icon: Navigation, base: 45, perKm: 12, color: '#10b981', eta: '4 min' },
  { id: 'mini', name: 'Go Mini', icon: Car, base: 80, perKm: 18, color: '#3b82f6', eta: '6 min' },
  { id: 'prime', name: 'Prime Sedan', icon: ShieldCheck, base: 140, perKm: 26, color: '#6366f1', eta: '5 min' },
];

export default function TripuraGo() {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  
  const [step, setStep] = useState<'search' | 'select' | 'matching' | 'active'>('search');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[2]);
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords([pos.coords.longitude, pos.coords.latitude]),
        () => setUserCoords(AGARTALA_CENTER)
      );
    }
  }, []);

  useEffect(() => {
    if (userCoords && mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
        center: userCoords,
        zoom: 14,
        pitch: 45,
      });

      map.current.on('load', () => {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-indigo-600 border-4 border-white rounded-full shadow-2xl animate-pulse';
        new maplibregl.Marker(el).setLngLat(userCoords!).addTo(map.current!);
      });
    }
  }, [userCoords]);

  // --- 2. BOOKING LOGIC (STORES DATA IN RIDES & UPDATES DRIVER) ---
  const confirmBooking = async () => {
    if (!user) return alert("Please sign in to book a ride.");
    if (!routeData || !destCoords) return alert("Destination not set.");

    setStep('matching');
    
    try {
      // Step A: Find an available driver for the specific vehicle type
      const { data: drivers, error: driverErr } = await supabase
        .from('drivers')
        .select(`*, profiles(full_name, phone_number)`)
        .eq('is_available', true)
        .eq('vehicle_type', selectedVehicle.id)
        .limit(1)
        .single();

      if (driverErr || !drivers) {
        throw new Error("No " + selectedVehicle.name + "s available nearby. Try a different vehicle.");
      }

      const driver = drivers;
      const finalFare = Math.round(selectedVehicle.base + (routeData.distance * selectedVehicle.perKm));

      // Step B: Create record in 'rides' table
      const { data: rideData, error: rideErr } = await supabase
        .from('rides')
        .insert([{
          user_id: user.id,
          driver_id: driver.id,
          pickup_address: 'Current Location',
          destination_address: query,
          pickup_lat: userCoords![1],
          pickup_lng: userCoords![0],
          dest_lat: destCoords[1],
          dest_lng: destCoords[0],
          fare: finalFare,
          status: 'accepted',
          vehicle_type: selectedVehicle.id
        }])
        .select()
        .single();

      if (rideErr) {
        console.error("Supabase Ride Error:", rideErr);
        throw new Error("Failed to store ride: " + rideErr.message);
      }

      // Step C: Mark driver as unavailable
      const { error: updateErr } = await supabase
        .from('drivers')
        .update({ is_available: false })
        .eq('id', driver.id);

      if (updateErr) console.warn("Driver status update failed, but ride was created.");

      // Step D: Transition to Active State
      setAssignedDriver(driver);
      setTimeout(() => setStep('active'), 1500);

    } catch (err: any) {
      alert(err.message);
      setStep('select');
    }
  };

  // --- 3. GEOLOCATION & ROUTING ---
  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 3) return setSuggestions([]);
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(val)}.json?key=${MAPTILER_KEY}&proximity=${userCoords?.join(',')}`);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (e) { console.error("Search failed", e); }
  };

  const selectDestination = async (feature: any) => {
    setQuery(feature.place_name);
    setDestCoords(feature.center);
    setSuggestions([]);
    setIsSyncing(true);
    
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userCoords?.join(',')};${feature.center.join(',')}?overview=full&geometries=geojson`);
      const data = await res.json();
      const route = data.routes[0];
      
      setRouteData({ distance: route.distance / 1000, duration: route.duration / 60, geometry: route.geometry });
      setStep('select');

      if (map.current) {
        if (map.current.getSource('route')) (map.current.getSource('route') as any).setData(route.geometry);
        else {
          map.current.addSource('route', { type: 'geojson', data: route.geometry });
          map.current.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#4f46e5', 'line-width': 6, 'line-cap': 'round' }});
        }
        const bounds = new maplibregl.LngLatBounds();
        route.geometry.coordinates.forEach((c: any) => bounds.extend(c));
        map.current.fitBounds(bounds, { padding: 80 });
      }
    } catch (e) { alert("Routing error. Please try again."); } 
    finally { setIsSyncing(false); }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden font-sans select-none">
      {/* Map Viewport */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        {step !== 'search' && (
          <button onClick={() => setStep('search')} className="absolute top-14 left-6 bg-white p-4 rounded-3xl shadow-2xl z-10 active:scale-90 transition-transform">
            <ArrowLeft size={20} className="text-slate-900" />
          </button>
        )}
      </div>

      {/* Dynamic Interaction Panel */}
      <div className="bg-white rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] relative z-20 pb-12 transition-all duration-500 ease-in-out">
        <div className="w-14 h-1.5 bg-slate-100 rounded-full mx-auto mt-5 mb-2" />
        
        <div className="px-8 overflow-y-auto max-h-[60vh]">
          {step === 'search' && (
            <div className="py-4 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-3xl font-black tracking-tighter mb-8 text-slate-900 italic">Where to?</h2>
              <div className="space-y-4 relative">
                <div className="bg-slate-50/50 p-5 rounded-[1.8rem] flex items-center gap-4 border border-slate-100">
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full ring-4 ring-indigo-50" />
                  <span className="text-sm font-bold text-slate-400">Current Location</span>
                </div>
                <div className="bg-white p-5 rounded-[1.8rem] flex items-center gap-4 border-2 border-slate-900 shadow-xl shadow-indigo-50/50">
                  <div className="w-2.5 h-2.5 border-2 border-slate-900 rounded-full" />
                  <input autoFocus className="flex-1 outline-none font-bold text-slate-900 placeholder:text-slate-200" placeholder="Destination..." value={query} onChange={(e) => handleSearch(e.target.value)} />
                  {isSyncing ? <Loader2 className="animate-spin text-indigo-600" size={20}/> : <Search size={20} className="text-slate-300" />}
                </div>
                
                {suggestions.length > 0 && (
                  <div className="absolute top-[110%] left-0 right-0 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[100] overflow-hidden">
                    {suggestions.map((s, idx) => (
                      <button key={idx} onClick={() => selectDestination(s)} className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left transition-colors">
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><MapPin size={18} /></div>
                        <div>
                          <p className="text-sm font-black text-slate-900 truncate">{s.text}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{s.place_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'select' && (
            <div className="py-2 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Tripura Fleet</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">{routeData?.distance.toFixed(1)} km • {Math.round(routeData?.duration)} mins</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-slate-400"><Info size={20}/></div>
              </div>

              <div className="space-y-3 mb-8">
                {VEHICLES.map((v) => (
                  <button key={v.id} onClick={() => setSelectedVehicle(v)} className={`w-full flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 ${selectedVehicle.id === v.id ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'border-slate-50 bg-white hover:border-slate-200'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl ${selectedVehicle.id === v.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                        <v.icon size={22} color={selectedVehicle.id === v.id ? 'white' : v.color} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm">{v.name}</p>
                        <p className={`text-[9px] font-black uppercase tracking-tighter ${selectedVehicle.id === v.id ? 'text-white/50' : 'text-slate-400'}`}>{v.eta} away</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black tracking-tighter">₹{Math.round(v.base + (routeData?.distance * v.perKm))}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={confirmBooking} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                Confirm {selectedVehicle.name} Booking
              </button>
            </div>
          )}

          {step === 'matching' && (
            <div className="py-16 text-center animate-in fade-in">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25" />
                <div className="relative bg-white border-4 border-indigo-600 w-full h-full rounded-full flex items-center justify-center">
                  <Loader2 size={40} className="text-indigo-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Contacting Fleet...</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Searching nearest {selectedVehicle.name} in Tripura</p>
            </div>
          )}

          {step === 'active' && assignedDriver && (
            <div className="py-4 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full tracking-widest">Driver Arriving</span>
                  <h4 className="text-xl font-black mt-4 text-slate-900">Meet at Pickup Point</h4>
                </div>
                <div className="bg-slate-900 text-white p-4 rounded-[1.8rem] text-center min-w-[80px] shadow-xl">
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Security PIN</p>
                   <p className="text-2xl font-black tracking-[0.2em]">4821</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2.8rem] border border-slate-100 mb-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={60}/></div>
                 <div className="w-20 h-20 bg-white rounded-[2rem] overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedDriver.id}`} alt="Driver" />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{assignedDriver.profiles?.full_name || 'Ratan Debbarma'}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{assignedDriver.vehicle_model} • {assignedDriver.license_plate}</p>
                    <div className="flex items-center gap-1 mt-2">
                       <Star size={12} className="text-amber-500 fill-amber-500" />
                       <span className="text-[10px] font-black text-slate-900">4.9</span>
                    </div>
                 </div>
                 <button className="p-5 bg-white text-indigo-600 rounded-3xl shadow-xl active:scale-90 transition-transform"><Phone size={24}/></button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="py-5 bg-slate-50 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest">Safety Toolkit</button>
                <button onClick={() => setStep('search')} className="py-5 bg-rose-50 text-rose-500 rounded-3xl text-[10px] font-black uppercase tracking-widest">Cancel Ride</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}