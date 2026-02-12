import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap, ArrowRight } from 'lucide-react';

export default function AppOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onboardingSteps = [
    {
      title: "SEARCH FOR\nFLIGHTS TO YOUR\nDESTINATION",
      subtitle: "Discover the hidden gems of Tripura with ease and speed.",
      image: "https://images.pexels.com/photos/1376889/pexels-photo-1376889.jpeg",
      tag: "EXPLORE ANYWHERE"
    },
    {
      title: "BOOK YOUR\nJOURNEY IN\nSECONDS",
      subtitle: "Experience the fastest PNR generation in the Northeast.",
      image: "https://images.pexels.com/photos/15404469/pexels-photo-15404469.jpeg",
      tag: "LIGHTNING FAST"
    },
    {
      title: "SAFE & SECURE\nPAYMENTS\nALWAYS",
      subtitle: "Your security is our priority. Encrypted by PayU.",
      image: "https://images.pexels.com/photos/8788658/pexels-photo-8788658.jpeg",
      tag: "SECURE TRAVEL"
    }
  ];

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => setIsAnimating(false), 800);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-hidden font-sans select-none">
      
      {/* --- BACKGROUND WITH OVERLAY --- */}
      <div className="absolute inset-0 z-0">
        {onboardingSteps.map((step, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentStep === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={step.image} 
              className={`w-full h-full object-cover brightness-[0.45] transition-transform duration-[10s] ease-out ${
                currentStep === index ? 'scale-110' : 'scale-100'
              }`} 
              alt="Background" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
          </div>
        ))}
      </div>

      {/* --- MOBILE OPTIMIZED HEADER --- */}
      <div className="relative z-50 flex justify-between items-center px-6 pt-6 ">
        <div className="flex items-center">
          {/* LOGO FIX: 
              - Increased height to h-16 (64px) or h-20 (80px) for visibility.
              - Used max-w-[50vw] to ensure it doesn't crash into the Skip button.
              - Added drop-shadow-xl to separate it from high-contrast backgrounds.
          */}
          <img 
            src='assets/logo1.png' 
            alt="TripuraFly" 
            className="h-24 md:h-20 w-auto max-w-[55vw] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" 
          />
        </div>
        
        <button 
          onClick={() => navigate('/auth')}
          className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] active:scale-90 transition-all"
        >
          Skip
        </button>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="relative z-10 mt-auto p-8 pb-12">
        
        {/* Progress Bar Indicators */}
        <div className="flex gap-2 mb-8">
          {onboardingSteps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentStep === i ? 'w-14 bg-[#FF5722]' : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>

        <div key={currentStep} className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-4 bg-[#FF5722] rounded-full" />
             <span className="text-[11px] font-black text-[#FF5722] uppercase tracking-[0.4em]">
               {onboardingSteps[currentStep].tag}
             </span>
          </div>

          <h2 className="text-[42px] leading-[1] font-black text-white tracking-tighter uppercase italic">
            {onboardingSteps[currentStep].title}
          </h2>

          <p className="text-white/50 font-bold text-lg max-w-[280px] leading-tight">
            {onboardingSteps[currentStep].subtitle}
          </p>
        </div>

        {/* --- DUAL ACTION BUTTONS (MOBILE FRIENDLY SIZE) --- */}
        <div className="flex items-center gap-4 mt-10">
          <button 
            onClick={handleNext}
            className="flex-[3] bg-white h-16 rounded-2xl flex items-center justify-center gap-3 text-black font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-2xl"
          >
            {currentStep === onboardingSteps.length - 1 ? 'Start Journey' : 'Next Step'}
            <ArrowRight size={18} />
          </button>

          <button 
            onClick={handleNext}
            className="flex-1 bg-[#FF5722] h-16 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all shadow-lg shadow-[#FF5722]/30"
          >
            {currentStep === 2 ? <Zap size={24} fill="white" /> : <ChevronRight size={28} />}
          </button>
        </div>

        {/* Brand Slogan */}
        <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] mt-8">
          Tripura's Leading Travel Partner
        </p>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}