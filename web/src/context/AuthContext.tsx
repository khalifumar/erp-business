'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { mockUsers } from '@/lib/mockData';

interface AuthContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default logged in as Sales representative (Shalsabilla Redwina)
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[2]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('digipack_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('digipack_user', JSON.stringify(currentUser));
    }
  }, [currentUser, isLoaded]);

  const switchRole = (role: UserRole) => {
    const targetUser = mockUsers.find(u => u.role === role) || mockUsers[2];
    setCurrentUser(targetUser);
  };

  const logout = () => {
    setCurrentUser(mockUsers[2]);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchRole,
      setCurrentUser,
      isAuthenticated: true,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
