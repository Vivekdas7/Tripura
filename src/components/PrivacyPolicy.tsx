const PrivacyPolicy = () => (
  <div className="bg-white py-16 px-4">
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-3xl font-black text-slate-900 mb-4">Privacy Policy</h1>
      <p className="text-slate-500 mb-10 italic">Last Updated: January 2026</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">1. Information We Collect</h3>
          <p className="text-slate-600 leading-relaxed">
            We collect personal information that you provide to us, including your name, email address, contact number, and payment details during the booking process. We also collect travel document details required by airlines and government authorities.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">2. How We Use Your Data</h3>
          <ul className="list-disc ml-6 text-slate-600 space-y-2">
            <li>To process and confirm your flight bookings.</li>
            <li>To send flight updates and itinerary changes.</li>
            <li>To comply with MBB Airport security regulations.</li>
            <li>For fraud prevention and secure payment processing.</li>
          </ul>
        </div>

        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <h3 className="text-indigo-900 font-bold mb-2">3. Data Security</h3>
          <p className="text-indigo-800 text-sm">
            TripuraFly uses 256-bit SSL encryption to protect your data. We do not store full credit card information on our servers; all payments are handled through PCI-DSS compliant payment gateways.
          </p>
        </div>
      </div>
    </div>
  </div>
);