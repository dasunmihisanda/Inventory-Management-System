'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'abc_auth_user';

// Helper to decode Google JWT payload safely in browser
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT credential', e);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Load active session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to retrieve user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login via Google Identity Services JWT credential
  const loginWithGoogleCredential = async (credential: string): Promise<boolean> => {
    const payload = parseJwt(credential);
    if (!payload || !payload.email) {
      return false;
    }

    const newUser: UserProfile = {
      id: payload.sub || String(Date.now()),
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      avatar: payload.picture,
      role: 'Administrator',
      authProvider: 'google',
      lastLogin: new Date().toISOString(),
    };

    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to persist user session', e);
    }
    return true;
  };

  // Sign out user
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogleCredential,
        logout,
        googleClientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
