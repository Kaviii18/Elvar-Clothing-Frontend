import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiUrl } from '../config/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  token: string | null;
  loginAsCustomer: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginAsAdmin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [user, setUser]       = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken]     = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('elvar_token');
    const storedUser  = localStorage.getItem('elvar_user');
    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
      } catch {
        localStorage.removeItem('elvar_token');
        localStorage.removeItem('elvar_user');
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (tkn: string, usr: User): void => {
    localStorage.setItem('elvar_token', tkn);
    localStorage.setItem('elvar_user', JSON.stringify(usr));
  };

  const loginAsCustomer = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res  = await fetch(apiUrl('/api/auth/login'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsAdmin(data.user.role === 'admin');
        persist(data.token, data.user);
      }
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const loginAsAdmin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res  = await fetch(apiUrl('/api/auth/admin-login'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsAdmin(true);
        persist(data.token, data.user);
      }
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res  = await fetch(apiUrl('/api/auth/register'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsAdmin(false);
        persist(data.token, data.user);
      }
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('elvar_token');
    localStorage.removeItem('elvar_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, token, loginAsCustomer, loginAsAdmin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
