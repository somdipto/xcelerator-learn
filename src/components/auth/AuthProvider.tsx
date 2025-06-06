
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';

interface AuthContextType {
  user: any;
  profile: any;
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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getInitialSession = async () => {
    try {
      const { user } = await supabaseService.getCurrentUser();
      if (user) {
        setUser(user);
        await loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error getting initial session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabaseService.getProfile(userId);
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await supabaseService.signIn(email, password);
    return result;
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    const result = await supabaseService.signUp(email, password, userData);
    return result;
  };

  const signOut = async () => {
    const result = await supabaseService.signOut();
    if (!result.error) {
      setUser(null);
      setProfile(null);
    }
    return result;
  };

  const value = {
    user,
    profile,
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
