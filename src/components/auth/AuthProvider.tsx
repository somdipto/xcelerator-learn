
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role: 'teacher' | 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const loadUserProfile = useCallback(async (userId: string) => {
    if (profileLoaded) return; // Prevent multiple calls
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (!data) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || user?.email,
            role: user?.user_metadata?.role || 'student'
          })
          .select()
          .maybeSingle();

        if (!createError && newProfile) {
          setProfile(newProfile as Profile);
        }
      } else {
        setProfile(data as Profile);
      }
      setProfileLoaded(true);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, [profileLoaded, user]);

  useEffect(() => {
    let mounted = true;
    let profileTimeout: NodeJS.Timeout;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && mounted) {
        // Defer profile loading to prevent blocking
        profileTimeout = setTimeout(() => {
          if (mounted && !profileLoaded) {
            loadUserProfile(session.user.id);
          }
        }, 100);
      } else {
        setProfile(null);
        setProfileLoaded(false);
      }
      
      setLoading(false);
    };

    // Get initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuthStateChange('INITIAL_SESSION', session);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      if (profileTimeout) clearTimeout(profileTimeout);
      subscription.unsubscribe();
    };
  }, [loadUserProfile, profileLoaded]);

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return result;
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return result;
  };

  const signOut = async () => {
    const result = await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setProfileLoaded(false);
    return result;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
