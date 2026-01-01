const AboutUs = () => (
  <div className="bg-white min-h-screen">
    {/* Hero Header */}
    <section className="bg-indigo-950 py-20 text-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1621356880091-6f7773248c8b?q=80&w=1000" className="w-full h-full object-cover" alt="Heritage" />
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 italic">Our Journey</h1>
        <p className="text-orange-400 font-bold tracking-widest uppercase">Connecting the Queen of Hills to the World</p>
      </div>
    </section>

    <section className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <img src="https://images.unsplash.com/photo-1596401057633-5310024b652a?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-2xl" alt="Tripura Nature" />
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Who We Are</h2>
            <p className="text-slate-600 leading-relaxed">
              Founded in 2024, <strong>TripuraFly</strong> was born out of a simple necessity: making air travel to the Northeast affordable for everyone. Based in Agartala, we understand the unique geographic challenges of our region.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-100">
          <h3 className="text-2xl font-bold text-center mb-8">The TripuraFly Promise</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-2">💎</div>
              <h4 className="font-bold mb-2">Lowest Fares</h4>
              <p className="text-sm text-slate-500">Direct airline partnerships ensure you pay the actual cost, not the aggregator markup.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🤝</div>
              <h4 className="font-bold mb-2">Local Roots</h4>
              <p className="text-sm text-slate-500">Our customer support is based right here in Agartala, providing local expertise 24/7.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌿</div>
              <h4 className="font-bold mb-2">Eco-Tourism</h4>
              <p className="text-sm text-slate-500">A portion of every ticket goes toward preserving Tripura's heritage sites.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);