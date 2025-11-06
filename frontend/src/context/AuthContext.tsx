import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  token: string | null;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_user_v1';
const TOKEN_KEY = 'auth_token_v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const tokenRaw = localStorage.getItem(TOKEN_KEY);
      if (raw && tokenRaw) {
        setUser(JSON.parse(raw));
        setToken(tokenRaw);
      }
    } catch (e) {
      console.error('Failed to parse auth user from storage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [user, token]);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid credentials');
    }
    const data = await response.json();
    setToken(data.token);
    setUser({
      id: String(data.user.id),
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign up');
    }
    // Auto login after signup
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (name: string) => {
    if (!user || !token) return;
    // TODO: Implement profile update API endpoint
    setUser({ ...user, name });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !token) throw new Error('Not authenticated');
    // TODO: Implement change password API endpoint
    throw new Error('Change password not implemented yet');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, updateProfile, changePassword, token, isAdmin }),
    [user, loading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
