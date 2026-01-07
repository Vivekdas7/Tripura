import { ArrowLeft, ShieldCheck, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Mini Header */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm uppercase tracking-tight">Back to Search</span>
          </Link>
          <span className="text-slate-400 font-black italic">TripuraFly</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last Updated: January 2026</p>
        </header>

        <div className="space-y-10">
          {/* Section 1 */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              <Eye size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">Data Collection</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              At TripuraFly, we collect only the essential information needed to book your flights and packages, 
              including your name, phone number, and travel preferences. We do not sell your personal data 
              to third-party advertisers.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <Lock size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">Booking Security</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Your contact details are shared only with our verified local partners in Agartala and 
              airline carriers to ensure your booking is processed within our 15-minute guarantee window.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">Contact Our Privacy Team</h2>
            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-widest">Support Office</p>
              <p className="text-slate-900 font-black">Maharaja Bir Bikram Airport, Agartala, Tripura</p>
              <p className="text-indigo-600 font-bold mt-2 underline">support@tripurafly.in</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;