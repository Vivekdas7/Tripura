import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plane, Search, X, Navigation, Globe, ArrowRight, 
  Map as MapIcon, Layers, Wifi, WifiOff, Loader2, Info
} from 'lucide-react';
import { 
  MapContainer, TileLayer, Marker, Polyline, useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- 1. CONFIG & DATA MAPS ---
const CONFIG = {
  REFRESH_RATE: 10000,
  INDIA_BBOX: 'lamin=6.0&lomin=68.0&lamax=36.0&lomax=98.0',
  MAP_CENTER: [22.9734, 78.6569] as [number, number]
};

// Mock Route Database (Since free APIs don't give routes, we infer them)
const ROUTE_DB: Record<string, { from: string, to: string, name: string }> = {
  'IGO': { from: 'DEL', to: 'IXA', name: 'IndiGo' },
  'AIC': { from: 'BOM', to: 'CCU', name: 'Air India' },
  'VTI': { from: 'DEL', to: 'BLR', name: 'Vistara' },
  'SEJ': { from: 'CCU', to: 'AGL', name: 'SpiceJet' },
  'AKY': { from: 'BOM', to: 'DEL', name: 'Akasa Air' },
};

// --- 2. DYNAMIC ASSET HELPERS ---
const getAirlineData = (callsign: string) => {
  const prefix = callsign.substring(0, 3);
  return ROUTE_DB[prefix] || { from: '---', to: '---', name: 'International' };
};

const getAircraftImage = (icao: string) => `https://api.planespotters.net/pub/photos/hex/${icao}`;

const createPlaneIcon = (heading: number, isSelected: boolean, airline: string) => {
  const color = airline === 'IndiGo' ? '#0055b8' : airline === 'Air India' ? '#ed1c24' : '#6366f1';
  const size = isSelected ? 48 : 32;
  return L.divIcon({
    html: `<div style="transform: rotate(${heading}deg); transition: all 0.3s;">
             <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5">
               <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
             </svg>
           </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// --- 3. MAIN COMPONENT ---
export default function FlightTracker() {
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  // Filtered List for Search
  const filteredFlights = useMemo(() => {
    return flights.filter(f => 
      f.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.airlineName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flights, searchQuery]);

  const selectedFlight = useMemo(() => 
    flights.find(f => f.icao24 === selectedId), 
  [flights, selectedId]);

  // Fetch Logic
  const fetchRadar = useCallback(async () => {
    if (!navigator.onLine) { setIsOffline(true); return; }
    setIsOffline(false);
    try {
      const res = await fetch(`https://opensky-network.org/api/states/all?${CONFIG.INDIA_BBOX}`);
      const data = await res.json();
      if (data.states) {
        const mapped = data.states.map((s: any) => {
          const callsign = s[1]?.trim() || 'UNK';
          const info = getAirlineData(callsign);
          return {
            icao24: s[0],
            callsign,
            lat: s[6],
            lng: s[5],
            alt: Math.round(s[7] * 3.28084 || 0),
            spd: Math.round(s[9] * 3.6 || 0),
            hdg: s[10] || 0,
            airlineName: info.name,
            from: info.from,
            to: info.to
          };
        }).filter((f: any) => f.lat && f.lng);
        setFlights(mapped);
      }
    } catch (e) { console.error("Fetch Error"); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRadar();
    const interval = setInterval(fetchRadar, CONFIG.REFRESH_RATE);
    return () => clearInterval(interval);
  }, [fetchRadar]);

  // Fetch Plane Photo when selected
  useEffect(() => {
    if (selectedId) {
      fetch(`https://api.planespotters.net/pub/photos/hex/${selectedId}`)
        .then(r => r.json())
        .then(d => setImgUrl(d.photos?.[0]?.thumbnail_large?.src || null))
        .catch(() => setImgUrl(null));
    }
  }, [selectedId]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden font-sans">
      
      {/* HEADER & SEARCH BAR */}
      <div className="absolute mt-8 top-0 left-0 right-0 z-[2000] p-4 pt-12 md:pt-4 pointer-events-none">
        <div className="max-w-md mx-auto w-full flex flex-col gap-3 pointer-events-auto">
          
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
            <div className="p-2 text-blue-500"><Search size={20} /></div>
            <input 
              type="text"
              placeholder="Search Flight (e.g. IGO612)..."
              className="bg-transparent border-none outline-none flex-1 text-sm font-bold placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {loading && <Loader2 size={18} className="animate-spin text-slate-500 mx-2" />}
          </div>

          {isOffline && (
            <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center justify-center gap-2 self-center shadow-lg">
              <WifiOff size={12} /> Disconnected
            </div>
          )}
        </div>
      </div>

      {/* MAP LAYER */}
      <div className="flex-1 z-0">
        <MapContainer center={CONFIG.MAP_CENTER} zoom={5} className="h-full w-full" zoomControl={false}>
          {/* Real Hybrid Map Tiles (Google-like) */}
          <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="Google" />

          {filteredFlights.map(f => (
            <Marker 
              key={f.icao24} 
              position={[f.lat, f.lng]} 
              icon={createPlaneIcon(f.hdg, selectedId === f.icao24, f.airlineName)}
              eventHandlers={{ click: () => setSelectedId(f.icao24) }}
            />
          ))}
        </MapContainer>
      </div>

      {/* MOBILE BOTTOM DETAILS SHEET */}
      {selectedFlight && (
        <div className="absolute bottom-0 left-0 right-0 z-[3000] p-4 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-lg mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
            
            {/* Airline Photo Area */}
            <div className="relative h-44 bg-slate-800">
              {imgUrl ? (
                <img src={imgUrl} className="w-full h-full object-cover" alt="Aircraft" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <Plane size={48} className="opacity-20 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Identifying Aircraft...</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <button 
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Flight Info Body */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600 rounded text-[10px] font-black uppercase tracking-tighter">
                      {selectedFlight.airlineName}
                    </span>
                    <span className="text-slate-500 text-xs font-bold">{selectedFlight.icao24.toUpperCase()}</span>
                  </div>
                  <h2 className="text-4xl font-black italic tracking-tighter mt-1">{selectedFlight.callsign}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Live Status</p>
                  <p className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                    <Wifi size={14} /> IN-AIR
                  </p>
                </div>
              </div>

              {/* ROUTE BOX */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-5 mb-6 flex items-center justify-around text-center">
                <div>
                  <h3 className="text-2xl font-black">{selectedFlight.from}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Origin</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-[2px] bg-slate-700 relative">
                    <Plane size={14} className="absolute -top-[6px] left-4 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black">{selectedFlight.to}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dest</p>
                </div>
              </div>

              {/* TELEMETRY */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Altitude', val: `${selectedFlight.alt}`, unit: 'ft' },
                  { label: 'Speed', val: `${selectedFlight.spd}`, unit: 'km/h' },
                  { label: 'Track', val: `${selectedFlight.hdg}`, unit: '°' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{s.label}</p>
                    <p className="text-lg font-black">{s.val}<span className="text-[10px] text-slate-400 ml-0.5">{s.unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .leaflet-container { background: #000 !important; }
        .leaflet-bar { border: none !important; }
        .animate-in { animation: slideIn 0.4s ease-out; }
        @keyframes slideIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

    </div>
  );
}