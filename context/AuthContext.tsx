// context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';

interface User { name: string; email: string; }
interface AuthContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, setUser: () => {}, logout: async () => {}, loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('banking_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
    setLoading(false);
  }, []);

  const logout = async () => {
    try { await apiRequest('/users/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('banking_user');
    setUser(null);
  };

  const setUserAndStore = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('banking_user', JSON.stringify(u));
    else localStorage.removeItem('banking_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndStore, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);