
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService, type Profile } from '@/services/authService';

interface SecureAuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isSessionValid: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData?: { full_name?: string; role?: string }) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  const validateSession = useCallback(async (currentSession: Session | null): Promise<boolean> => {
    if (!currentSession) return false;

    try {
      // Check session expiry
      const now = Math.floor(Date.now() / 1000);
      if (currentSession.expires_at && currentSession.expires_at <= now) {
        console.warn('Session expired');
        return false;
      }

      // Validate session with server
      const { data: { user: validUser }, error } = await supabase.auth.getUser();
      if (error || !validUser) {
        console.warn('Session validation failed:', error);
        return false;
      }

      // Check for suspicious session activity
      const sessionDuration = now - (currentSession.user.created_at ? new Date(currentSession.user.created_at).getTime() / 1000 : now);
      const maxSessionDuration = 24 * 60 * 60; // 24 hours

      if (sessionDuration > maxSessionDuration) {
        console.warn('Session duration exceeded maximum allowed time');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        await signOut();
        return;
      }

      if (refreshedSession) {
        const isValid = await validateSession(refreshedSession);
        if (isValid) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
          setIsSessionValid(true);
        } else {
          await signOut();
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      await signOut();
    }
  }, [validateSession]);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error } = await authService.getProfile(userId);
      if (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          const isValid = await validateSession(initialSession);
          if (isValid) {
            setSession(initialSession);
            setUser(initialSession.user);
            setIsSessionValid(true);
            await loadProfile(initialSession.user.id);
          } else {
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setProfile(null);
          setSession(null);
          setIsSessionValid(false);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const isValid = await validateSession(session);
          if (isValid) {
            setSession(session);
            setUser(session.user);
            setIsSessionValid(true);
            await loadProfile(session.user.id);
          } else {
            await supabase.auth.signOut();
          }
        }

        setLoading(false);
      }
    );

    // Set up periodic session validation
    sessionCheckInterval = setInterval(async () => {
      if (session) {
        const isValid = await validateSession(session);
        if (!isValid) {
          await signOut();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [session, validateSession, loadProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Basic input validation
      if (!email.trim() || !password.trim()) {
        return { data: null, error: { message: 'Email and password are required' } };
      }

      // Rate limiting check (simple client-side)
      const lastAttempt = localStorage.getItem('lastSignInAttempt');
      const now = Date.now();
      if (lastAttempt && now - parseInt(lastAttempt) < 1000) {
        return { data: null, error: { message: 'Please wait before trying again' } };
      }
      localStorage.setItem('lastSignInAttempt', now.toString());

      const result = await authService.signIn(email, password);
      
      if (result.error) {
        // Log failed attempt (without sensitive data)
        console.warn('Sign in failed:', { 
          email: email.substring(0, 3) + '***',
          timestamp: new Date().toISOString() 
        });
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name?: string; role?: string } = {}) => {
    try {
      setLoading(true);
      
      // Validate and sanitize input
      if (!email.trim() || !password.trim()) {
        return { data: null, error: { message: 'Email and password are required' } };
      }

      // Basic password strength check
      if (password.length < 8) {
        return { data: null, error: { message: 'Password must be at least 8 characters long' } };
      }

      // Sanitize user data
      const sanitizedUserData = {
        ...userData,
        full_name: userData.full_name?.trim().substring(0, 100),
        role: ['student', 'teacher'].includes(userData.role || '') ? userData.role : 'student'
      };

      const result = await authService.signUp(email, password, sanitizedUserData);
      
      if (!result.error) {
        console.log('User registered successfully:', {
          email: email.substring(0, 3) + '***',
          role: sanitizedUserData.role,
          timestamp: new Date().toISOString()
        });
      }
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local storage
      localStorage.removeItem('lastSignInAttempt');
      
      await authService.signOut();
      
      // Force state cleanup
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsSessionValid(false);
    } catch (error) {
      console.error('Sign out error:', error);
      // Force cleanup even on error
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsSessionValid(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isSessionValid,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
};
