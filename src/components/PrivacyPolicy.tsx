import { ArrowLeft, ShieldCheck, Lock, Eye, Cookie, Share2, Database, Bell, HelpCircle } from 'lucide-react';
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
          <p className="text-slate-500 font-medium">Last Updated: January 07, 2026</p>
        </header>

        <div className="space-y-8">
          {/* Section 1: Introduction */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">
              Welcome to TripuraFly. We value your privacy and are committed to protecting your personal data. This policy explains how we handle your information when you use our flight booking services and tour packages in Tripura and beyond.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              By using our platform, you consent to the practices described in this policy. We ensure that all data processing is compliant with Indian IT Laws and local regulations.
            </p>
          </section>

          {/* Section 2: Data Collection */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              <Eye size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">2. Information We Collect</h2>
            </div>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex gap-3">
                <span className="text-indigo-500 font-black">•</span>
                <span><strong>Personal Identifiers:</strong> Name, age, gender, and government-issued ID numbers (required by airlines).</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-500 font-black">•</span>
                <span><strong>Contact Information:</strong> Phone number and email address for sending tickets and flight updates.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-500 font-black">•</span>
                <span><strong>Travel Preferences:</strong> Meal choices, seat preferences, and frequent flyer details.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-500 font-black">•</span>
                <span><strong>Usage Data:</strong> Device IP address, browser type, and interaction with our booking engine.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Booking Security */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <Lock size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">3. Security & Payments</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">
              Your contact details are shared only with our verified local partners in Agartala and 
              airline carriers to ensure your booking is processed within our 15-minute guarantee window.
            </p>
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <p className="text-orange-800 text-sm font-bold">
                Note: We use SSL encryption for all transactions. TripuraFly does not store your full Credit/Debit card numbers on our local servers.
              </p>
            </div>
          </section>

          {/* Section 4: Cookies */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
              <Cookie size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">4. Cookie Policy</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              We use cookies to improve your searching experience, remember your recent flight searches, and maintain your session while you complete a booking. You can disable cookies in your browser settings, but some features of TripuraFly may become unavailable.
            </p>
          </section>

          {/* Section 5: Third Party Disclosure */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <Share2 size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">5. Third-Party Sharing</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium mb-4">
              We share your data only when necessary:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                <p className="font-bold text-slate-800">Airlines</p>
                <p className="text-sm text-slate-500">To issue your PNR and flight tickets.</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                <p className="font-bold text-slate-800">Payment Gateways</p>
                <p className="text-sm text-slate-500">To process secure UPI and card payments.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Data Retention */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <Database size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">6. Data Retention</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              We keep your booking information for as long as necessary to fulfill travel requirements and for legal, accounting, or reporting reasons. After this period, your data is securely deleted or anonymized.
            </p>
          </section>

          {/* Section 7: User Rights */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-purple-600">
              <Bell size={22} />
              <h2 className="text-xl font-black uppercase tracking-tight">7. Your Rights</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              You have the right to access your data, request corrections, or ask for the deletion of your account. To exercise these rights, please contact our support desk with your registered phone number.
            </p>
          </section>

          {/* Section 8: Contact */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle size={22} className="text-slate-400" />
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Contact Our Privacy Team</h2>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Main Support Hub</p>
              <p className="text-slate-900 font-black text-lg">Maharaja Bir Bikram Airport</p>
              <p className="text-slate-600 font-medium">Agartala, Tripura - 799009</p>
              
              <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Call/WhatsApp</p>
                  <p className="text-indigo-600 font-black text-xl">+91 93661 59066</p>
                </div>
                <div className="sm:ml-auto">
                  <p className="text-xs text-slate-400 font-bold uppercase">Email Support</p>
                  <p className="text-slate-900 font-black">dasvivek398@gmail.com</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} TripuraFly. Part of Tripura Travel Solutions Pvt Ltd.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;