// src/lib/auth/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  RegisterPayload,
  DemoAccountKey,
  DEMO_ACCOUNTS,
  getCurrentUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  loginDemo as authLoginDemo,
  loginAsPreset as authLoginAsPreset
} from './authStore';
import { AppRole } from '../../types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handleAuthChange = () => refresh();
    window.addEventListener('auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [refresh]);

  const login = (email: string, role: AppRole, name?: string, company?: string) => {
    const loggedIn = authLogin(email, role, name, company);
    setUser(loggedIn);
    return loggedIn;
  };

  const register = (payload: RegisterPayload) => {
    const registered = authRegister(payload);
    setUser(registered);
    return registered;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const loginDemo = (role: AppRole) => {
    const demo = authLoginDemo(role);
    setUser(demo);
    return demo;
  };

  const loginAsPreset = (key: DemoAccountKey) => {
    const preset = authLoginAsPreset(key);
    setUser(preset);
    return preset;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSupplier: user?.role === 'supplier',
    isBuyer: user?.role === 'buyer',
    demoAccounts: DEMO_ACCOUNTS,
    login,
    register,
    logout,
    loginDemo,
    loginAsPreset
  };
}
