
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'teacher' | 'student' | 'admin';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/teacher-login'
}) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user, 'profile:', profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // If user exists but profile is still loading, wait a bit more
  if (!profile) {
    console.log('User exists but no profile yet, showing loading...');
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (requiredRole && profile.role !== requiredRole) {
    console.log('Role mismatch. Required:', requiredRole, 'Actual:', profile.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Access granted for role:', profile.role);
  return <>{children}</>;
};

export default ProtectedRoute;
