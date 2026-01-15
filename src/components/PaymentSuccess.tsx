import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const processBooking = async () => {
      // PayU sends payment details back in the URL or POST body
      const txnid = searchParams.get('txnid');
      const amount = searchParams.get('amount');
      const status = searchParams.get('status');

      if (status === 'success') {
        // Here you would update your Supabase 'bookings' table 
        // to set status = 'confirmed' based on the txnid
        setStatus('success');
      } else {
        setStatus('failed');
      }
    };

    processBooking();
  }, [searchParams]);

  if (status === 'processing') {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="mt-4 font-bold text-slate-600">Verifying Payment...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
        <CheckCircle2 size={40} />
      </div>
      <h1 className="text-3xl font-black text-slate-900">Payment Successful!</h1>
      <p className="text-slate-500 mt-2">Your E-Ticket has been sent to your email.</p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold"
      >
        Go to My Bookings
      </button>
    </div>
  );
}