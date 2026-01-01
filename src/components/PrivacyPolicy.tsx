import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#f8fafc] min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-3xl bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
        <Link 
          to="/" 
          className="inline-flex items-center text-indigo-600 font-bold mb-8 hover:gap-2 transition-all"
        >
          ← <span className="ml-2">Back to Booking</span>
        </Link>

        <h1 className="text-4xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-10 font-medium uppercase tracking-widest text-[10px]">
          Last Updated: January 2026
        </p>

        <div className="space-y-10">
          <section>
            <h3 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              1. Information We Collect
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We collect personal information that you provide to us, including your name, email address, contact number, and payment details during the booking process. We also collect travel document details required by airlines and government authorities.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              2. How We Use Your Data
            </h3>
            <ul className="space-y-3">
              {[
                "To process and confirm your flight bookings.",
                "To send flight updates and itinerary changes.",
                "To comply with MBB Airport security regulations.",
                "For fraud prevention and secure payment processing."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600">
                  <span className="text-indigo-500 mt-1">✓</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🔒</div>
            <h3 className="text-indigo-900 font-black mb-3">3. Data Security</h3>
            <p className="text-indigo-800/80 text-sm leading-relaxed">
              TripuraFly uses 256-bit SSL encryption to protect your data. We do not store full credit card information on our servers; all payments are handled through PCI-DSS compliant payment gateways.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;