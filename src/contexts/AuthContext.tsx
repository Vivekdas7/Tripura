import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, referralCode?: string | null) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>; // Added
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
        const { data: { session: initialSession } } = await supabase.auth.getSession();
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
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const signUp = async (email: string, password: string, referralCode?: string | null) => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({ 
      email: cleanEmail, 
      password,
      options: {
        data: { referred_by: referralCode || null, full_name: cleanEmail.split('@')[0] },
        emailRedirectTo: window.location.origin, 
      }
    });
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (data?.user) { setUser(data.user); setSession(data.session); }
    return { error };
  };

  // Google Sign In Logic
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Essential for mobile: redirects the whole page instead of a popup
        redirectTo: window.location.origin, 
        queryParams: { access_type: 'offline', prompt: 'select_account' }
      },
    });
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null); setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
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
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}