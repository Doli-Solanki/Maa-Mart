// frontend/src/context/AuthContext.tsx
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

// Read API base from Vite env
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || '';

/** Small helper for authenticated JSON requests */
async function jsonFetch<T>(
  path: string,
  opts: RequestInit = {},
  token?: string | null
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {
      // ignore json parse error
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Boot: restore from localStorage
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

  // Persist to localStorage
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
    const data = await jsonFetch<{ token: string; user: AuthUser }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    setToken(data.token);
    setUser({
      id: String(data.user.id),
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    await jsonFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    // Auto-login after signup
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (name: string) => {
    if (!user || !token) return;
    // If you have a profile endpoint, call it here, e.g.:
    // await jsonFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ name }) }, token);
    setUser({ ...user, name });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !token) throw new Error('Not authenticated');
    // If your backend has this route, uncomment:
    // await jsonFetch('/api/auth/change-password', {
    //   method: 'PUT',
    //   body: JSON.stringify({ currentPassword, newPassword }),
    // }, token);

    // Temporary no-op to satisfy TypeScript until backend route exists:
    void currentPassword;
    void newPassword;
    return Promise.resolve();
  };

  const isAdmin = () => user?.role === 'admin';

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
      token,
      isAdmin,
    }),
    [user, loading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
