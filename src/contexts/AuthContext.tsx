
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock admin user for frontend-only demo
const ADMIN_USER: User = {
  id: 'admin-1',
  email: 'admin@test.com',
  role: 'admin',
  full_name: 'Admin User'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('cms_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('cms_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // Simple frontend authentication - accept any teacher@test.com or admin@test.com
    if ((email === 'teacher@test.com' || email === 'admin@test.com') && password === 'teacher123') {
      const userData = {
        ...ADMIN_USER,
        email,
        role: email.includes('admin') ? 'admin' as const : 'teacher' as const
      };
      
      setUser(userData);
      localStorage.setItem('cms_user', JSON.stringify(userData));
      setLoading(false);
      
      return { data: { user: userData }, error: null };
    }
    
    setLoading(false);
    return { data: null, error: { message: 'Invalid email or password' } };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('cms_user');
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher' || user?.role === 'admin', // Admin can access teacher features
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
