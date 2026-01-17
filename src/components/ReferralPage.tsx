import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Share2, Copy, Gift, Wallet, CheckCircle2, Users, Trophy, 
  Crown, Medal, ArrowRight, Star, Zap, TrendingUp, Sparkles,
  Info, ShieldCheck, QrCode, ArrowUpRight, Clock, AlertCircle
} from 'lucide-react';

interface LeaderboardUser {
  referrer_id: string;
  total_earned: number;
  referral_count: number;
  display_name: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  upi_id: string;
}

const ReferralPage = () => {
  const [user, setUser] = useState<any>(null);
  const [referralStats, setStats] = useState({ totalEarned: 0, count: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      // 1. Fetch Personal Stats
      const { data: personalRefs } = await supabase
        .from('referrals')
        .select('amount')
        .eq('referrer_id', user.id)
        .eq('status', 'credited');
      
      const total = personalRefs?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      setStats({ totalEarned: total, count: personalRefs?.length || 0 });

      // 2. Fetch Withdrawal History
      const { data: withdrawData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setWithdrawals(withdrawData || []);

      // 3. Fetch Leaderboard Data
      const { data: allRefs } = await supabase
        .from('referrals')
        .select('referrer_id, amount')
        .eq('status', 'credited');

      if (allRefs) {
        const grouped = allRefs.reduce((acc: any, curr) => {
          if (!acc[curr.referrer_id]) {
            acc[curr.referrer_id] = { total: 0, count: 0 };
          }
          acc[curr.referrer_id].total += Number(curr.amount);
          acc[curr.referrer_id].count += 1;
          return acc;
        }, {});

        const sortedBoard = Object.keys(grouped)
          .map(id => ({
            referrer_id: id,
            total_earned: grouped[id].total,
            referral_count: grouped[id].count,
            display_name: id === user.id ? "You" : `User ${id.substring(0, 4)}`
          }))
          .sort((a, b) => b.total_earned - a.total_earned)
          .slice(0, 5);

        setLeaderboard(sortedBoard);
      }
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    const MIN_BALANCE = 500;
    if (referralStats.totalEarned < MIN_BALANCE) {
      alert(`Minimum ₹${MIN_BALANCE} required to withdraw. You need ₹${MIN_BALANCE - referralStats.totalEarned} more!`);
      return;
    }

    const upiId = prompt("Enter your UPI ID (e.g., name@okaxis):");
    if (!upiId || upiId.length < 3) return;

    setWithdrawing(true);
    try {
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount: referralStats.totalEarned,
        upi_id: upiId,
        status: 'pending'
      });

      if (error) throw error;

      // WhatsApp Notification
      const text = `*Withdrawal Request - TripuraFly*%0A%0AUser: ${user.email}%0AAmount: ₹${referralStats.totalEarned}%0AUPI: ${upiId}`;
      window.open(`https://wa.me/919366159066?text=${text}`, '_blank');
      
      alert("Request submitted! Our team will verify and pay within 24 hours.");
      fetchData();
    } catch (err) {
      alert("Request failed. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const shareLink = `https://tripurafly.com/signup?ref=${user?.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 pt-16 pb-32 px-6 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10 max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles size={12} /> TripuraFly Rewards
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">REFER & EARN</h1>
          <p className="text-slate-400 text-xs font-bold leading-relaxed">Refer friends traveling from Agartala and earn rewards.</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-20 relative z-20 space-y-6">
        
        {/* WITHDRAWAL CARD */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white">
           <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                <p className="text-4xl font-black text-slate-900 italic">₹{referralStats.totalEarned}</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                 <Wallet size={24} />
              </div>
           </div>
           
           <button 
             onClick={handleWithdraw}
             disabled={withdrawing}
             className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
           >
              {withdrawing ? "Processing..." : "Withdraw to UPI"} <ArrowUpRight size={18} />
           </button>
           <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-tighter">Minimum withdrawal: ₹500</p>
        </div>

        {/* LEADERBOARD */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Trophy size={16} className="text-orange-500" /> Leaderboard
            </h3>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-lg border border-white overflow-hidden">
             {leaderboard.map((item, index) => (
               <div key={item.referrer_id} className="p-4 flex items-center justify-between border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-300 w-4">#{index + 1}</span>
                    <p className="text-[11px] font-black text-slate-700">{item.display_name}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">₹{item.total_earned}</p>
               </div>
             ))}
          </div>
        </div>

        {/* WITHDRAWAL HISTORY */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest px-4 flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" /> Payout History
          </h3>
          <div className="space-y-3">
             {withdrawals.length > 0 ? withdrawals.map((w) => (
               <div key={w.id} className="bg-white p-5 rounded-[2rem] flex items-center justify-between border border-white shadow-sm">
                  <div>
                     <p className="text-[11px] font-black text-slate-900 italic">₹{w.amount}</p>
                     <p className="text-[9px] font-bold text-slate-400">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                    w.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                     {w.status}
                  </div>
               </div>
             )) : (
               <div className="text-center py-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">No withdrawals yet</p>
               </div>
             )}
          </div>
        </div>

        {/* SHARE SECTION */}
        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white space-y-4">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Share Link</p>
           <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between gap-2 border border-white/10">
              <span className="text-[10px] font-bold truncate opacity-80">{shareLink}</span>
              <button onClick={handleCopy} className="shrink-0 bg-white text-indigo-600 p-2 rounded-lg">
                 {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ReferralPage;