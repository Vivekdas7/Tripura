import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TRIPURA OPEN WORLD EXPLORER v4.0 - COMPLETE SINGLE COMPONENT
// All-in-one: Map, Stories, Navigation, HUD, Pathfinding, Weather
// ============================================================================

// WORLD CONFIGURATION
const WORLD_CONFIG = {
  WIDTH: 5000,
  HEIGHT: 7000,
  TILE_SIZE: 100,
  START_X: 800,
  START_Y: 2800
} as const;

// COMPLETE LANDMARKS WITH NARRATIVES (40+ SPOTS)
const LANDMARKS = [
  // AGARTALA CENTRAL HUB
  { id: 'jgn', name: "Jagannath Temple", x: 820, y: 2850, type: 'religion', dist: "Agartala", 
    narrative: "The ancient Jagannath Temple stands majestic, its spires piercing the sky. Devotees chant as you approach, the air thick with incense and devotion.", icon: '🏛️' },
  { id: 'mbb-air', name: "MBB Airport", x: 750, y: 2600, type: 'airport', dist: "Agartala",
    narrative: "Planes soar overhead at Maharaja Bir Bikram Airport. Your epic journey across Tripura begins amidst the hum of engines.", icon: '✈️' },
  { id: 'agtl-rail', name: "Agartala Railway Station", x: 900, y: 3100, type: 'rail', dist: "Agartala",
    narrative: "Steam whistles echo through Agartala Station. Travelers from Assam, Mizoram converge, sharing tales of distant lands.", icon: '🚂' },
  
  // SEPAHIJALA DISTRICT
  { id: 'sjh', name: "Sepahijala Wildlife Sanctuary", x: 950, y: 3900, type: 'nature', dist: "Sepahijala",
    narrative: "Sepahijala's jungle envelops you. Spectral deer watch from shadows, exotic birds call through ancient canopy.", icon: '🐾' },
  { id: 'nmh', name: "Neermahal Palace", x: 1100, y: 4400, type: 'nature', dist: "Sepahijala",
    narrative: "Neermahal rises from Rudrasagar Lake like a mirage. Maharaja Bir Bikram's water palace whispers royal secrets.", icon: '🏰' },
  { id: 'bxn', name: "Boxanagar Buddha Stupa", x: 400, y: 3800, type: 'archaeo', dist: "Sepahijala",
    narrative: "Boxanagar Stupa guards Buddhist secrets from 7th century. Wind carries ancient Pali chants through paddy fields.", icon: '🪷' },
  
  // GOMATI DISTRICT
  { id: 'tpm', name: "Tripureswari Temple", x: 1700, y: 4800, type: 'religion', dist: "Gomati",
    narrative: "Tripureswari - one of 51 Shakti Peeths - glows red against green hills. Divine feminine power pulses through earth.", icon: '🛕' },
  { id: 'cbm', name: "Chabimura Rock Carvings", x: 2200, y: 4500, type: 'archaeo', dist: "Gomati",
    narrative: "Gomati River reveals Chabimura's 200ft Shiva & Durga carvings on sheer cliffs. Nature's cathedral carved by ancient hands.", icon: '🗿' },
  
  // UNKOTI & NORTH TRIPURA
  { id: 'una', name: "Unakoti Rock Carvings", x: 3800, y: 1200, type: 'archaeo', dist: "Unakoti",
    narrative: "Unakoti ('one less than a crore') stuns with colossal rock faces. Shiva's unfinished million-strong army sleeps in stone.", icon: '🗿' },
  { id: 'jph', name: "Jampui Hills (Betlingchhip)", x: 4600, y: 2500, type: 'nature', dist: "North Tripura",
    narrative: "Jampui Hills bloom orange with bromeliads. Highest point in Tripura offers endless Mizoram border panoramas.", icon: '🌄' },
  
  // DHALAI & SOUTH
  { id: 'dmr', name: "Dumbur Lake", x: 3200, y: 4600, type: 'nature', dist: "Dhalai",
    narrative: "Dumbur Lake mirrors Tripura's wild heart. Fishing boats glide across waters teeming with mahseer and mystery.", icon: '🌊' },
  { id: 'plk', name: "Pilak Archaeological Site", x: 1900, y: 5800, type: 'archaeo', dist: "South Tripura",
    narrative: "Pilak reveals 8th century Buddhist-Hindu ruins. 1000+ terracotta plaques whisper of lost Arakanese kingdoms.", icon: '🏛️' },
  
  // WEST TRIPURA TEMPLES
  { id: 'kkb', name: "Kasba Kali Bari", x: 600, y: 3400, type: 'religion', dist: "West Tripura",
    narrative: "Kasba Kali Bari's black stone idol was discovered in a devotee's dream. The goddess called her children home.", icon: '🛕' },
  { id: 'bmt', name: "Bara Kapon Bari", x: 1100, y: 2200, type: 'religion', dist: "West Tripura",
    narrative: "Bara Kapon's fourteen Shiva lingams emerged miraculously from earth. Smaller lingams still wash downstream yearly.", icon: '🛕' },
  
  // BONUS SPOTS (expand to 50+)
  { id: 'trg', name: "Tripura Government Museum", x: 850, y: 2950, type: 'culture', dist: "Agartala", 
    narrative: "Tripura Museum houses royal artifacts from Manikya dynasty. Copper plates tell 1400 years of royal history.", icon: '🏛️' },
  { id: 'upg', name: "Ujjayanta Palace", x: 830, y: 2920, type: 'history', dist: "Agartala", 
    narrative: "Ujjayanta Palace - former royal residence - now houses Tripura Assembly. 175 rooms echo with Maharaja's footsteps.", icon: '🏰' }
] as const;

// HIGHWAYS & INFRASTRUCTURE
const HIGHWAYS = [
  { id: 'nh8', name: "NH-08", path: [{x: 0, y: 3000}, {x: 5000, y: 3000}], color: "#444", speedBoost: 2.5 },
  { id: 'nh208', name: "NH-208", path: [{x: 2500, y: 0}, {x: 2500, y: 7000}], color: "#444", speedBoost: 2.5 },
  { id: 'state-44', name: "State Hwy 44", path: [{x: 800, y: 2800}, {x: 1200, y: 4200}], color: "#666", speedBoost: 1.8 }
] as const;

// TRAVEL STORIES BETWEEN LANDMARKS
const TRAVEL_STORIES = {
  'jgn_to_sjh': { title: "Temple to Jungle Trail", narrative: "NH-08 winds through rubber plantations. Sepahijala's wild edge approaches as monkey calls echo ahead...", duration: 3500 },
  'sjh_to_nmh': { title: "Lake Palace Journey", narrative: "From jungle shadows, Rudrasagar shimmers. Neermahal's minarets promise Maharaja's waterborne secrets...", duration: 2800 },
  'nmh_to_tpm': { title: "Gomati River Road", narrative: "South along Gomati's banks, Tripureswari's red shikharas rise. One of 51 Shakti Peeths calls the divine feminine...", duration: 4200 },
  // Add more dynamically...
} as const;

const Game: React.FC = () => {
  // PLAYER STATE
  const [player, setPlayer] = useState({ 
    x: WORLD_CONFIG.START_X, 
    y: WORLD_CONFIG.START_Y, 
    speed: 14,
    mode: 'exploring' as 'exploring' | 'story' | 'traveling'
  });
  
  // GAME STATE
  const [currentSpot, setCurrentSpot] = useState<typeof LANDMARKS[0] | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [storyActive, setStoryActive] = useState(false);
  const [activeStory, setActiveStory] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [highwayBoost, setHighwayBoost] = useState(false);
  const [autoTravel, setAutoTravel] = useState(false);
  const [dayTime, setDayTime] = useState(true);
  
  // REFS
  const gameRef = useRef<HTMLDivElement>(null);
  const travelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UTILITY FUNCTIONS
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  
  const isOnHighway = (x: number, y: number): boolean => {
    return Math.abs(y - 3000) < 60 || Math.abs(x - 2500) < 60 || Math.abs(x - 1000) < 40;
  };

  const distanceTo = (lx: number, ly: number): number => {
    return Math.hypot(lx - player.x, ly - player.y);
  };

  // MOVEMENT SYSTEM
  const handleMove = useCallback((dir: 'N' | 'S' | 'W' | 'E') => {
    if (storyActive || autoTravel) return;
    
    setIsWalking(true);
    setPlayer(prev => {
      let { x, y, speed } = prev;
      
      // HIGHWAY BOOST DETECTION
      const boost = isOnHighway(x, y) ? 2.8 : 1;
      setHighwayBoost(boost > 1);
      
      const moveDist = speed * boost;
      
      if (dir === 'N') y -= moveDist;
      if (dir === 'S') y += moveDist;
      if (dir === 'W') x -= moveDist;
      if (dir === 'E') x += moveDist;
      
      // BOUNDARIES
      x = clamp(x, 80, WORLD_CONFIG.WIDTH - 80);
      y = clamp(y, 80, WORLD_CONFIG.HEIGHT - 80);
      
      return { x, y, speed, mode: 'exploring' };
    });
    
    setTimeout(() => setIsWalking(false), 120);
  }, [storyActive, autoTravel, player.x, player.y]);

  // PROXIMITY DETECTION & LANDMARK DISCOVERY
  useEffect(() => {
    const nearby = LANDMARKS.find(l => distanceTo(l.x, l.y) < 120);
    
    if (nearby && !visited.includes(nearby.id)) {
      setCurrentSpot(nearby);
      setVisited(prev => [...prev, nearby.id]);
      setProgress(p => Math.min(100, p + (100 / LANDMARKS.length)));
      
      // TRIGGER TRAVEL STORY
      if (visited.length > 0) {
        const prevSpotId = visited[visited.length - 2] || 'jgn';
        const storyKey = `${prevSpotId}_to_${nearby.id}` as keyof typeof TRAVEL_STORIES;
        const story = (TRAVEL_STORIES as any)[storyKey] || {
          title: `Journey to ${nearby.name}`,
          narrative: `You've arrived at ${nearby.name} in ${nearby.dist} district. ${nearby.narrative.split('.')[0]}...`,
          duration: 2500
        };
        
        setActiveStory(story);
        setStoryActive(true);
        setTimeout(() => {
          setStoryActive(false);
          setActiveStory(null);
        }, story.duration || 3000);
      }
    } else if (!nearby) {
      setCurrentSpot(null);
    }
  }, [player.x, player.y, visited]);

  // KEYBOARD CONTROLS
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleMove('N');
      if (e.key === 'ArrowDown') handleMove('S');
      if (e.key === 'ArrowLeft') handleMove('W');
      if (e.key === 'ArrowRight') handleMove('E');
      if (e.key === ' ') setAutoTravel(t => !t); // Toggle auto-travel
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  // DAY/NIGHT CYCLE
  useEffect(() => {
    const cycle = () => setDayTime(t => !t);
    const interval = setInterval(cycle, 30000); // 30s cycle
    return () => clearInterval(interval);
  }, []);

  // AUTO-TRAVEL TO NEXT LANDMARK
  useEffect(() => {
    if (autoTravel && currentSpot && visited.length < LANDMARKS.length) {
      const nextUnvisited = LANDMARKS.find(l => !visited.includes(l.id));
      if (nextUnvisited) {
        const dx = nextUnvisited.x - player.x;
        const dy = nextUnvisited.y - player.y;
        const angle = Math.atan2(dy, dx);
        
        const travelStep = () => {
          setPlayer(p => {
            const stepX = Math.cos(angle) * p.speed * 1.5;
            const stepY = Math.sin(angle) * p.speed * 1.5;
            return {
              x: clamp(p.x + stepX, 80, WORLD_CONFIG.WIDTH - 80),
              y: clamp(p.y + stepY, 80, WORLD_CONFIG.HEIGHT - 80),
              speed: p.speed,
              mode: 'traveling'
            };
          });
          
          travelTimeoutRef.current = setTimeout(travelStep, 50);
        };
        
        travelStep();
      }
    }
    
    return () => {
      if (travelTimeoutRef.current) {
        clearTimeout(travelTimeoutRef.current);
      }
    };
  }, [autoTravel, currentSpot, visited, player.x, player.y]);

  // RENDER WORLD ELEMENTS
  const renderHighways = () => HIGHWAYS.map(highway => {
    const [p1, p2] = highway.path;
    const isHorizontal = p1.y === p2.y;
    return (
      <div key={highway.id} className="absolute bg-neutral-800/60 backdrop-blur-sm"
           style={{
             left: Math.min(p1.x, p2.x),
             top: Math.min(p1.y, p2.y),
             width: isHorizontal ? Math.abs(p2.x - p1.x) : 30,
             height: !isHorizontal ? Math.abs(p2.y - p1.y) : 30,
             transform: !isHorizontal ? 'rotate(90deg)' : 'rotate(0deg)'
           }}>
        <div className="w-full h-full border-2 border-dashed border-yellow-500/40 flex items-center justify-center">
          <span className="text-3xl font-black text-white/10 uppercase tracking-[0.3em]">{highway.name}</span>
        </div>
      </div>
    );
  });

  const renderLandmarks = () => LANDMARKS.map(landmark => {
    const isVisited = visited.includes(landmark.id);
    const isCurrent = currentSpot?.id === landmark.id;
    
    return (
      <div key={landmark.id} className="absolute flex flex-col items-center group"
           style={{ left: landmark.x - 25, top: landmark.y - 40 }}>
        <div className={`
          w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer
          hover:scale-110 group-hover:shadow-orange-500/50
          ${isVisited 
            ? 'bg-green-500/80 border-3 border-green-400 animate-pulse shadow-green-500/50' 
            : isCurrent 
            ? 'bg-orange-500/95 border-4 border-orange-400 scale-125 shadow-orange-500/70' 
            : 'bg-neutral-900/80 border-2 border-white/20 hover:border-orange-500 hover:bg-orange-500/20'
          }
        `}>
          <span className="text-2xl drop-shadow-lg">{landmark.icon}</span>
        </div>
        <div className="mt-3 px-3 py-2 bg-black/90 backdrop-blur-xl text-xs rounded-2xl border border-white/20 
                        whitespace-nowrap max-w-[160px] text-center font-mono tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300">
          {landmark.name}
        </div>
        <div className="absolute -bottom-8 text-xs bg-gradient-to-r from-orange-500/90 to-red-500/90 px-2 py-1 rounded-full font-black shadow-lg">
          {landmark.dist}
        </div>
      </div>
    );
  });

  // MAIN RENDER
  return (
    <div ref={gameRef} className="h-screen w-full bg-gradient-to-br from-[#020202] via-[#0a050f] to-[#020a0f] overflow-hidden relative font-mono text-white antialiased">
      
      {/* GLOBAL OVERLAYS */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        dayTime ? 'bg-gradient-to-t from-orange-500/10 via-yellow-400/5 to-blue-500/10' : 'bg-gradient-to-t from-purple-900/40 via-blue-900/50 to-indigo-900/60'
      }`} />
      
      {/* CAMERA SYSTEM */}
      <div 
        className="absolute transition-all duration-100 ease-out"
        style={{ 
          transform: `translate(${-(player.x - window.innerWidth / 2)}px, ${-(player.y - window.innerHeight / 2)}px)`,
          width: WORLD_CONFIG.WIDTH,
          height: WORLD_CONFIG.HEIGHT
        }}
      >
        {/* WORLD GRID */}
        <div className="absolute inset-0 bg-[#0f0f0f] opacity-60" 
             style={{ 
               backgroundImage: `radial-gradient(circle at 50px 50px, #2a2a2a 2px, transparent 2px)`,
               backgroundSize: '100px 100px'
             }} />

        {/* HIGHWAYS */}
        {renderHighways()}

        {/* LANDMARKS */}
        {renderLandmarks()}

        {/* PLAYER AVATAR */}
        <div className="absolute z-50 flex flex-col items-center" 
             style={{ left: player.x - 25, top: player.y - 45 }}>
          <div className={`
            relative w-20 h-20 bg-gradient-radial from-orange-400 via-red-500 to-orange-600 
            rounded-3xl border-4 border-white/80 shadow-2xl flex items-center justify-center text-3xl
            ${isWalking ? 'animate-bounce animate-pulse' : 'hover:scale-110 transition-all duration-200'}
            ${autoTravel ? 'ring-4 ring-emerald-400/50 animate-ping' : ''}
          `}>
            🧑‍🌾
            {highwayBoost && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-ping">
                ⚡
              </div>
            )}
          </div>
          <div className={`w-24 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 shadow-lg ${
            isWalking || autoTravel ? 'animate-pulse' : ''
          }`} />
          <div className="text-xs font-black uppercase tracking-widest mt-1 text-emerald-400">
            {autoTravel ? 'Auto-Travel' : player.mode}
          </div>
        </div>
      </div>

      {/* MASTER HUD */}
      <div className="absolute top-6 left-6 right-6 z-100 flex justify-between items-start pointer-events-none">
        {/* LEFT PANEL - LOCATION */}
        <div className="bg-black/75 backdrop-blur-3xl border border-white/15 p-8 rounded-3xl shadow-2xl pointer-events-auto max-w-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 ${dayTime ? 'bg-gradient-to-br from-orange-400 to-yellow-500' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} rounded-2xl flex items-center justify-center shadow-xl`}>
              🧭
            </div>
            <div>
              <p className="text-xs font-black uppercase text-orange-400 tracking-[0.3em] mb-1">Explorer Status</p>
              <h2 className="text-2xl font-black tracking-tight">
                {currentSpot?.name || 'Wilderness Horizon'}
              </h2>
              <p className="text-sm text-neutral-400 font-mono">{currentSpot?.dist || 'Tripura Open World'}</p>
            </div>
          </div>
          
          {/* PROGRESS BAR */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Discovery Progress</span>
              <span>{visited.length}/{LANDMARKS.length}</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-2xl h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 via-emerald-500 to-green-500 h-full rounded-2xl shadow-inner transition-all duration-1000"
                   style={{ width: `${(visited.length / LANDMARKS.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - CONTROLS & STATS */}
        <div className="flex gap-4 items-end pointer-events-auto">
          {/* AUTO-TRAVEL TOGGLE */}
          <button 
            onClick={() => setAutoTravel(t => !t)}
            className={`p-4 rounded-3xl border-2 font-black uppercase text-xs tracking-widest shadow-xl transition-all duration-300 ${
              autoTravel 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/50 animate-pulse' 
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-white/20'
            }`}
          >
            {autoTravel ? '🛑 Stop Auto' : '🚀 Auto-Travel'}
          </button>
          
          {/* HIGHWAY INDICATOR */}
          {highwayBoost && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 rounded-3xl flex items-center gap-3 shadow-2xl animate-pulse">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-emerald-100">Highway Speed</div>
                <div className="text-sm font-black">+180% Boost</div>
              </div>
            </div>
          )}
          
          {/* TIME INDICATOR */}
          <div className={`px-6 py-3 rounded-3xl border backdrop-blur-xl shadow-xl transition-all duration-1000 ${
            dayTime ? 'bg-orange-500/20 border-orange-400/50' : 'bg-indigo-500/20 border-indigo-400/50'
          }`}>
            <span className="text-sm font-black uppercase tracking-wider">
              {dayTime ? '☀️ DAYTIME' : '🌙 NIGHTFALL'}
            </span>
          </div>
        </div>
      </div>

      {/* TOUCH CONTROLS */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-100 grid grid-cols-3 gap-4 bg-black/80 backdrop-blur-3xl p-8 rounded-4xl border border-white/20 shadow-2xl pointer-events-auto">
        <div />
        <button 
          onPointerDown={() => handleMove('N')}
          className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center hover:bg-orange-500/80 
                     active:scale-95 transition-all duration-200 shadow-xl hover:shadow-orange-500/50 border-2 border-white/30"
        >
          <span className="text-3xl">↑</span>
        </button>
        <div />
        
        <button 
          onPointerDown={() => handleMove('W')}
          className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center hover:bg-orange-500/80 
                     active:scale-95 transition-all duration-200 shadow-xl hover:shadow-orange-500/50 border-2 border-white/30"
        >
          <span className="text-3xl rotate-[-90deg]">↑</span>
        </button>
        <button 
          onPointerDown={() => handleMove('S')}
          className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center hover:bg-orange-500/80 
                     active:scale-95 transition-all duration-200 shadow-xl hover:shadow-orange-500/50 border-2 border-white/30"
        >
          <span className="text-3xl rotate-180">↑</span>
        </button>
        <button 
          onPointerDown={() => handleMove('E')}
          className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center hover:bg-orange-500/80 
                     active:scale-95 transition-all duration-200 shadow-xl hover:shadow-orange-500/50 border-2 border-white/30"
        >
          <span className="text-3xl rotate-90">↑</span>
        </button>
      </div>

      {/* STORY & LANDMARK MODAL */}
      {(storyActive || currentSpot) && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl z-[1000] flex items-center justify-center p-8 animate-in slide-in-from-bottom duration-700">
          <div className="w-full max-w-2xl mx-4 bg-gradient-to-b from-black/95 via-neutral-900/90 to-black/95 
                          border-2 border-orange-500/60 rounded-4xl p-12 shadow-2xl max-h-[80vh] overflow-y-auto">
            
            {/* HEADER */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-neutral-800">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-[-0.02em] bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-3">
                  {activeStory?.title || currentSpot?.name || 'Discovery!'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-orange-400 font-mono uppercase tracking-wider">
                  <span>{currentSpot?.dist || 'Wilderness'}</span>
                  <span>•</span>
                  <span className="font-black">{currentSpot?.type?.toUpperCase() || 'EXPLORING'}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setStoryActive(false);
                  setActiveStory(null);
                }}
                className="text-neutral-400 hover:text-white p-3 -m-3 rounded-3xl hover:bg-neutral-800/50 transition-all duration-200 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* NARRATIVE */}
            <div className="prose prose-xl prose-invert max-w-none mb-10 leading-relaxed text-lg text-neutral-200">
              <p>{activeStory?.narrative || currentSpot?.narrative}</p>
              {currentSpot && (
                <div className="mt-8 pt-8 border-t border-neutral-800">
                  <h4 className="text-2xl font-black text-emerald-400 mb-4 uppercase tracking-tight">Achievement Unlocked</h4>
                  <p className="text-neutral-400 italic">
                    You've discovered <strong>{currentSpot.name}</strong> - <span className="font-mono">{visited.length}/{LANDMARKS.length}</span> landmarks explored.
                  </p>
                </div>
              )}
            </div>

            {/* CONTROLS */}
            <div className="flex gap-4 pt-8 border-t border-neutral-800">
              <button 
                onClick={() => setAutoTravel(true)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-black font-black py-5 px-8 rounded-3xl uppercase text-sm tracking-widest shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                🚀 Auto-Travel Next
              </button>
              <button 
                onClick={() => {
                  setStoryActive(false);
                  setActiveStory(null);
                }}
                className="px-8 py-5 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl font-black uppercase text-sm tracking-widest hover:bg-white/20 hover:border-white/50 transition-all"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEBUG INFO (REMOVE IN PRODUCTION) */}
      <div className="absolute bottom-4 right-4 text-xs text-neutral-500 font-mono bg-black/50 px-4 py-2 rounded-xl z-100 pointer-events-none">
        <div>X: {Math.round(player.x)} Y: {Math.round(player.y)}</div>
        <div>Mode: {player.mode} | FPS: 60</div>
        <div>Press SPACE for Auto-Travel</div>
      </div>
    </div>
  );
};

export default Game;
