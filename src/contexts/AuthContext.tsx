import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null; // Added session for better mobile tracking
  loading: boolean;
  signUp: (email: string, password: string, referralCode?: string | null) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, referralCode?: string | null) => {
    // Mobile fix: Trim email to remove accidental trailing spaces from auto-complete
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({ 
      email: cleanEmail, 
      password,
      options: {
        data: {
          referred_by: referralCode || null,
          full_name: cleanEmail.split('@')[0],
        },
        // Mobile browsers handle email confirms better with a site URL
        emailRedirectTo: window.location.origin, 
      }
    });
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: cleanEmail, 
      password 
    });
    
    // Explicitly set user for mobile if listener is slow
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
    }
    
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {/* On mobile, we show a blank screen or spinner while loading 
        to prevent the AuthForm from flashing/crashing during init.
      */}
      {!loading ? children : (
        <div className="min-h-screen bg-white flex items-center justify-center">
           <div className="w-8 h-8 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}