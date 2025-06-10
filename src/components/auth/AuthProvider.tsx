
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { authService, type Profile } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData?: { full_name?: string; role?: string }) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, set loading to false and return
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured. Authentication features will be disabled.');
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        // Validate session security
        if (initialSession) {
          const now = new Date();
          const sessionTime = new Date(initialSession.user.created_at);
          const sessionAge = now.getTime() - sessionTime.getTime();
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge > maxSessionAge) {
            console.warn('Session expired due to age, signing out');
            await supabase.auth.signOut();
            return;
          }
        }
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          // Use setTimeout to defer the profile fetch to avoid auth state conflicts
          setTimeout(async () => {
            try {
              const { data: profileData } = await authService.getProfile(initialSession.user.id);
              setProfile(profileData);
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Clear potentially corrupted session
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with enhanced security
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Enhanced security checks for auth events
        if (event === 'SIGNED_IN' && session) {
          // Verify the session is recent
          const now = new Date();
          const sessionTime = new Date(session.user.created_at);
          const sessionAge = now.getTime() - sessionTime.getTime();
          
          if (sessionAge > 5 * 60 * 1000) { // 5 minutes for new sessions
            console.warn('Potentially stale session detected');
          }
          
          // Log successful authentication for audit
          console.log('User authenticated:', {
            userId: session.user.id,
            email: session.user.email,
            timestamp: now.toISOString()
          });
        }
        
        if (event === 'SIGNED_OUT') {
          // Clear all local state on signout
          setProfile(null);
          console.log('User signed out, clearing local state');
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to defer profile fetching and avoid infinite loops
          setTimeout(async () => {
            try {
              const { data: profileData } = await authService.getProfile(session.user.id);
              setProfile(profileData);
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            }
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    try {
      const result = await authService.signIn(email, password);
      
      // Additional security logging for failed attempts
      if (result.error) {
        console.warn('Authentication failed:', {
          email: email.substring(0, 3) + '***', // Partially mask email
          error: result.error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      return result;
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name?: string; role?: string } = {}) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    try {
      // Sanitize user data before signup
      const sanitizedUserData = { ...userData };
      if (sanitizedUserData.full_name) {
        sanitizedUserData.full_name = sanitizedUserData.full_name.trim().substring(0, 100);
      }
      if (sanitizedUserData.role && !['teacher', 'student', 'admin'].includes(sanitizedUserData.role)) {
        sanitizedUserData.role = 'student'; // Default to student for security
      }
      
      const result = await authService.signUp(email, password, sanitizedUserData);
      
      // Log registration attempts for audit
      if (!result.error) {
        console.log('New user registered:', {
          email: email.substring(0, 3) + '***',
          role: sanitizedUserData.role || 'student',
          timestamp: new Date().toISOString()
        });
      }
      
      return result;
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      console.warn('Cannot sign out: Supabase not configured');
      return;
    }
    
    try {
      // Log signout for audit
      if (user) {
        console.log('User signing out:', {
          userId: user.id,
          timestamp: new Date().toISOString()
        });
      }
      
      await authService.signOut();
      
      // Ensure complete cleanup
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Force cleanup even if signout fails
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
