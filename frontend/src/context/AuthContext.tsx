import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_user_v1';
const CREDENTIALS_KEY = 'auth_credentials_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Record<string, string>>({}); // email -> password

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
      const credRaw = localStorage.getItem(CREDENTIALS_KEY);
      if (credRaw) setCredentials(JSON.parse(credRaw));
    } catch (e) {
      console.error('Failed to parse auth user from storage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (e) {
      console.error('Failed to persist auth credentials', e);
    }
  }, [credentials]);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 300));
    const existingPassword = credentials[email];
    if (existingPassword !== undefined) {
      if (existingPassword !== password) {
        throw new Error('Invalid credentials');
      }
      // keep existing user if same email
      setUser((prev) => prev?.email === email ? prev : { id: crypto.randomUUID(), name: email.split('@')[0] || 'User', email });
    } else {
      // First-time login for unknown email: auto-create (mock)
      setCredentials((prev) => ({ ...prev, [email]: password }));
      setUser({ id: crypto.randomUUID(), name: email.split('@')[0] || 'User', email });
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    setCredentials((prev) => ({ ...prev, [email]: password }));
    setUser({ id: crypto.randomUUID(), name: name || email.split('@')[0] || 'User', email });
  };

  const logout = () => setUser(null);

  const updateProfile = async (name: string) => {
    if (!user) return;
    await new Promise((r) => setTimeout(r, 200));
    setUser({ ...user, name });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    const existing = credentials[user.email];
    if (existing === undefined) throw new Error('Account not found');
    if (existing !== currentPassword) throw new Error('Current password is incorrect');
    await new Promise((r) => setTimeout(r, 300));
    setCredentials((prev) => ({ ...prev, [user.email]: newPassword }));
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, updateProfile, changePassword }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
