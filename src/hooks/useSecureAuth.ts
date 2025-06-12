
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Set up auth state listener with proper error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous operations here to prevent deadlocks
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null
        }));

        // Log security events without exposing sensitive data
        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed');
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'Authentication error occurred'
          }));
          return;
        }

        setAuthState({
          session,
          user: session?.user ?? null,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Unexpected auth error:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication system unavailable'
        }));
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Don't expose detailed error messages for security
        const userFriendlyError = error.message.includes('Invalid login credentials')
          ? 'Invalid email or password'
          : 'Sign in failed. Please try again.';
        
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: userFriendlyError 
        }));
        return { error: { message: userFriendlyError } };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = 'Sign in failed. Please try again.';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { error: { message: errorMessage } };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        // Don't expose detailed error messages for security
        const userFriendlyError = error.message.includes('already registered')
          ? 'An account with this email already exists'
          : 'Registration failed. Please try again.';
        
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: userFriendlyError 
        }));
        return { error: { message: userFriendlyError } };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = 'Registration failed. Please try again.';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Sign out failed' 
        }));
        return;
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Sign out failed' 
      }));
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!authState.user,
    isTeacher: authState.user?.user_metadata?.role === 'teacher',
    isAdmin: authState.user?.user_metadata?.role === 'admin'
  };
};
