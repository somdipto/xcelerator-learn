
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'teacher' | 'admin';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/teacher-login'
}) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user);

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

  if (requiredRole && user.role !== requiredRole && !(user.role === 'admin' && requiredRole === 'teacher')) {
    console.log('Role mismatch. Required:', requiredRole, 'Actual:', user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Access granted for role:', user.role);
  return <>{children}</>;
};

export default ProtectedRoute;
