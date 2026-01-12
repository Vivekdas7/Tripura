import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Data structure to handle multiple regions
const allTourData = {
  Tripura: [
    { id: "ujjayanta-palace", title: "Ujjayanta Palace", tag: "Agartala", price: "2,499", desc: "3D/2N", img: "https://imgs.search.brave.com/VKlKADSNjxB9inPbUnYd4Q6YsqlnVmVYZ-OWl306I6o/..." },
    { id: "neermahal", title: "Neermahal Palace", tag: "Melaghar", price: "1,250", desc: "2D/1N", img: "https://imgs.search.brave.com/8tSgzr_irvUwd6mQQnNXE-PQE6VFCs0zbmtaVSvOgZI/..." },
  ],
  Sikkim: [
    { id: "tsomgo-lake", title: "Tsomgo Lake", tag: "Gangtok", price: "5,500", desc: "4D/3N", img: "https://images.unsplash.com/photo-1589133036ef3-460d3765104d?auto=format&fit=crop&q=80&w=800" },
  ],
  Meghalaya: [
    { id: "dawki-river", title: "Umngot River", tag: "Dawki", price: "4,200", desc: "3D/2N", img: "https://images.unsplash.com/photo-1626082896492-766af4eb6501?auto=format&fit=crop&q=80&w=800" },
  ]
};

const RegionalSpecials = () => {
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState("Tripura");

  return (
    <section className="mb-3 md:mb-24 px-4 md:px-0 max-w-7xl mx-auto">
      {/* Header & Region Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            Discover <span className="text-indigo-600">India</span>
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold mt-1 uppercase tracking-wider">Handpicked regional getaways</p>
        </div>

        {/* Dynamic Region Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {Object.keys(allTourData).map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeRegion === region 
                ? "bg-indigo-600 text-white shadow-lg" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory pb-8">
        {allTourData[activeRegion].map((item, i) => (
          <div 
            key={item.id} 
            className="min-w-[85vw] sm:min-w-[45vw] md:min-w-full snap-center group relative rounded-[2.5rem] overflow-hidden h-[500px] shadow-2xl border border-slate-100"
          >
            {/* Image Layer */}
            <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" alt={item.title} />
            
            {/* Top Navigation Overlay */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
              <span className="bg-white/95 backdrop-blur-md text-indigo-900 text-[10px] font-black px-4 py-2 rounded-full uppercase shadow-xl">
                {item.tag}
              </span>
              <button 
                onClick={() => navigate(`/package/${item.id}`)}
                className="bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-indigo-900 px-5 py-2.5 rounded-full border border-white/30 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                View Details
              </button>
            </div>

            {/* Content Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
              <div className="mb-4">
                 <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">{item.desc} Package</p>
                 <h3 className="text-white text-3xl font-black leading-tight">{item.title}</h3>
              </div>

              {/* Price & Action Row */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/20">
                <div className="flex-1 pl-2">
                  <span className="text-white/60 text-[10px] font-bold uppercase block tracking-tighter">Starting from</span>
                  <p className="text-white text-2xl font-black leading-none mt-1">₹{item.price}</p>
                </div>
                <button 
                  onClick={() => navigate(`/book/${item.id}`)} 
                  className="bg-indigo-600 text-white px-8 py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-lg active:scale-95"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RegionalSpecials;