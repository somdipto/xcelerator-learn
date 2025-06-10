
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/components/auth/AuthProvider';
import { SecurityValidator } from '@/utils/validation';
import { toast } from '@/hooks/use-toast';

interface AuthError {
  message: string;
  code?: string;
}

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  sessionTimeout: boolean;
}

export const useSecureAuth = () => {
  const { user, session, loading, signIn, signUp, signOut } = useAuth();
  const [authState, setAuthState] = useState<SecureAuthState>({
    user,
    session,
    loading,
    error: null,
    sessionTimeout: false
  });

  // Session timeout check (30 minutes)
  useEffect(() => {
    if (session) {
      const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
      const maxAge = 30 * 60 * 1000; // 30 minutes
      
      if (sessionAge > maxAge) {
        setAuthState(prev => ({ ...prev, sessionTimeout: true }));
        toast({
          title: "Session Expired",
          description: "Please sign in again for security",
          variant: "destructive"
        });
        signOut();
      }
    }
  }, [session, signOut]);

  const secureSignIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!SecurityValidator.checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
      const error = { message: "Too many login attempts. Please try again in 15 minutes." };
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error };
    }

    // Input validation
    const emailValidation = SecurityValidator.validateEmail(email);
    if (!emailValidation.isValid) {
      const error = { message: emailValidation.errors[0] };
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error };
    }

    if (password.length < 8) {
      const error = { message: "Password must be at least 8 characters long" };
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await signIn(email, password);
      
      if (result.error) {
        // Map Supabase errors to user-friendly messages
        let message = "Authentication failed";
        if (result.error.message.includes("Invalid login credentials")) {
          message = "Invalid email or password";
        } else if (result.error.message.includes("Email not confirmed")) {
          message = "Please check your email and confirm your account";
        } else if (result.error.message.includes("Too many requests")) {
          message = "Too many attempts. Please try again later";
        }
        
        setAuthState(prev => ({ ...prev, error: { message, code: result.error.message } }));
      } else {
        setAuthState(prev => ({ ...prev, error: null }));
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in",
        });
      }
      
      return result;
    } catch (error: any) {
      const authError = { message: "An unexpected error occurred" };
      setAuthState(prev => ({ ...prev, error: authError }));
      return { data: null, error: authError };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const secureSignUp = async (email: string, password: string, userData: { full_name?: string; role?: string } = {}) => {
    // Rate limiting check
    if (!SecurityValidator.checkRateLimit(`signup_${email}`, 3, 60 * 60 * 1000)) {
      const error = { message: "Too many signup attempts. Please try again in 1 hour." };
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error };
    }

    // Input validation
    const emailValidation = SecurityValidator.validateEmail(email);
    if (!emailValidation.isValid) {
      const error = { message: emailValidation.errors[0] };
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error };
    }

    // Password strength validation
    if (password.length < 8) {
      const error = { message: "Password must be at least 8 characters long" };
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error };
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      const error = { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" };
      setAuthState(prev => ({ ...prev, error }));
      return { data: null, error };
    }

    // Validate full name if provided
    if (userData.full_name) {
      const nameValidation = SecurityValidator.validateTextInput(userData.full_name, 100);
      if (!nameValidation.isValid) {
        const error = { message: nameValidation.errors[0] };
        setAuthState(prev => ({ ...prev, error }));
        return { data: null, error };
      }
      userData.full_name = SecurityValidator.sanitizeHtml(userData.full_name);
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await signUp(email, password, userData);
      
      if (result.error) {
        let message = "Registration failed";
        if (result.error.message.includes("already registered")) {
          message = "An account with this email already exists";
        } else if (result.error.message.includes("Password")) {
          message = result.error.message;
        }
        
        setAuthState(prev => ({ ...prev, error: { message, code: result.error.message } }));
      } else {
        setAuthState(prev => ({ ...prev, error: null }));
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account",
        });
      }
      
      return result;
    } catch (error: any) {
      const authError = { message: "An unexpected error occurred during registration" };
      setAuthState(prev => ({ ...prev, error: authError }));
      return { data: null, error: authError };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const secureSignOut = async () => {
    try {
      await signOut();
      setAuthState(prev => ({ 
        ...prev, 
        error: null, 
        sessionTimeout: false 
      }));
      toast({
        title: "Signed out",
        description: "You have been securely signed out",
      });
    } catch (error) {
      console.error('Error during signout:', error);
    }
  };

  return {
    ...authState,
    signIn: secureSignIn,
    signUp: secureSignUp,
    signOut: secureSignOut,
    clearError: () => setAuthState(prev => ({ ...prev, error: null }))
  };
};
