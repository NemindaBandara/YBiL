import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface AuthUser {
  id: string;
  username: string;
  role: 'PASSENGER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: { accessToken: string; refreshToken?: string; user?: AuthUser }) => void;
  register: (payload: { accessToken: string; refreshToken?: string; user?: AuthUser }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Decode JWT payload safely without extra dependencies
  const parseUserFromJwt = (token: string): AuthUser | null => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      return {
        id: payload.userId || payload.sub || '',
        username: payload.username || payload.sub || 'Passenger',
        role: payload.role?.replace('ROLE_', '') || 'PASSENGER',
      };
    } catch {
      return null;
    }
  };

  // Synchronize authentication tokens and update React state immediately
  const persistSession = (data: { accessToken: string; refreshToken?: string; user?: AuthUser }) => {
    localStorage.setItem('access_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }

    const resolvedUser = data.user || parseUserFromJwt(data.accessToken);
    if (resolvedUser) {
      localStorage.setItem('user_data', JSON.stringify(resolvedUser));
      setUser(resolvedUser);
    }
  };

  // Restore session on initial mount / reload
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_data');

    if (token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          return;
        } catch {
          // Fallback to token parsing if JSON is corrupt
        }
      }
      const extracted = parseUserFromJwt(token);
      if (extracted) {
        setUser(extracted);
      }
    }
  }, []);

  const login = (payload: { accessToken: string; refreshToken?: string; user?: AuthUser }) => {
    persistSession(payload);
  };

  const register = (payload: { accessToken: string; refreshToken?: string; user?: AuthUser }) => {
    // Automatically authenticate the session upon successful registration
    persistSession(payload);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};