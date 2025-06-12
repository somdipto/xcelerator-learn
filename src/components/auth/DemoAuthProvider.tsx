
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'admin';
  authenticated: boolean;
}

interface DemoAuthContextType {
  user: DemoUser | null;
  loading: boolean;
  signOut: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUser = localStorage.getItem('demoTeacherUser');
    if (demoUser) {
      try {
        const userData = JSON.parse(demoUser);
        if (userData.authenticated) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing demo user data:', error);
        localStorage.removeItem('demoTeacherUser');
      }
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem('demoTeacherUser');
    setUser(null);
  };

  return (
    <DemoAuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </DemoAuthContext.Provider>
  );
};
