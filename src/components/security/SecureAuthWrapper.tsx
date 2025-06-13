
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecureAuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin';
  requireVerifiedEmail?: boolean;
}

const SecureAuthWrapper: React.FC<SecureAuthWrapperProps> = ({
  children,
  requiredRole,
  requireVerifiedEmail = false
}) => {
  const { user, profile, loading } = useAuth();
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [securityCheck, setSecurityCheck] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      if (!user) {
        setSessionValid(false);
        return;
      }

      try {
        // Validate session freshness
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.warn('Invalid session detected, signing out');
          await supabase.auth.signOut();
          setSessionValid(false);
          return;
        }

        // Check session age (max 24 hours)
        const sessionTime = new Date(session.user.created_at);
        const now = new Date();
        const sessionAge = now.getTime() - sessionTime.getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge > maxAge) {
          console.warn('Session expired due to age');
          await supabase.auth.signOut();
          setSessionValid(false);
          return;
        }

        // Verify email if required
        if (requireVerifiedEmail && !user.email_confirmed_at) {
          setSecurityCheck(false);
          return;
        }

        // Check role permissions
        if (requiredRole && profile?.role !== requiredRole && !(profile?.role === 'admin' && requiredRole === 'teacher')) {
          setSecurityCheck(false);
          return;
        }

        setSessionValid(true);
      } catch (error) {
        console.error('Session validation error:', error);
        setSessionValid(false);
      }
    };

    if (!loading) {
      validateSession();
    }
  }, [user, profile, loading, requiredRole, requireVerifiedEmail]);

  if (loading || sessionValid === null) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-4 text-[#00E676]" />
          <p className="text-[#E0E0E0]">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            Authentication required. Please sign in to continue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!securityCheck) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <Alert className="max-w-md bg-yellow-500/10 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            {requireVerifiedEmail && !user?.email_confirmed_at 
              ? 'Please verify your email address to continue.'
              : 'You do not have permission to access this resource.'
            }
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecureAuthWrapper;
