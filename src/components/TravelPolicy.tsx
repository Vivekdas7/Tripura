const TravelPolicy = () => (
  <div className="bg-[#f8fafc] min-h-screen py-16 px-4">
    <div className="container mx-auto max-w-4xl bg-white p-8 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50">
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6">Travel & Refund Policy</h1>
      
      <div className="space-y-10">
        <section>
          <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">✈️</span> Flight Rules
          </h2>
          <ul className="list-disc ml-12 space-y-3 text-slate-600">
            <li>Check-in counters close 60 minutes prior to departure for all Agartala-bound flights.</li>
            <li>Valid Government ID (Aadhar, Passport, or Voter ID) is mandatory for airport entry.</li>
            <li>Standard baggage allowance: 15kg check-in and 7kg hand luggage.</li>
          </ul>
        </section>

        <section className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
          <h2 className="flex items-center gap-3 text-xl font-bold text-red-900 mb-4">
            <span className="p-2 bg-red-100 text-red-600 rounded-lg">💰</span> Refund & Cancellation
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-red-50">
              <h3 className="font-bold text-slate-800 mb-2">Before 72 Hours</h3>
              <p className="text-sm text-slate-600">Full refund minus a flat convenience fee of ₹499 per passenger.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-red-50">
              <h3 className="font-bold text-slate-800 mb-2">Within 24 Hours</h3>
              <p className="text-sm text-slate-600">Non-refundable. However, date changes are permitted with a fee of ₹1,200.</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-red-700 font-medium italic">*Refunds are processed to the original payment method within 5-7 business days.</p>
        </section>
      </div>
    </div>
  </div>
);