// src/lib/auth/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  RegisterPayload,
  DemoAccountKey,
  DEMO_ACCOUNTS,
  readServerUser,
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

  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try { setUser(await readServerUser()); }
    catch (error) { setUser(null); setError(error instanceof Error ? error.message : 'Không kết nối được backend.'); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const onChange = () => { void refresh(); };
    window.addEventListener('auth_change', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('auth_change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);
  async function authenticate(action: () => Promise<AuthUser>) {
    setError(null);
    try { const account = await action(); setUser(account); return account; }
    catch (error) { setError(error instanceof Error ? error.message : 'Không kết nối được backend.'); return null; }
  }
  const login = (email: string, role: AppRole, name?: string, company?: string) => authenticate(() => authLogin(email, role, name, company));
  const register = (payload: RegisterPayload) => authenticate(() => authRegister(payload));
  const loginDemo = (role: AppRole) => authenticate(() => authLoginDemo(role));
  const loginAsPreset = (key: DemoAccountKey) => authenticate(() => authLoginAsPreset(key));
  const logout = async () => {
    try { await authLogout(); setUser(null); setError(null); }
    catch (error) { setError(error instanceof Error ? error.message : 'Không đăng xuất được.'); }
  };

  return {
    user,
    error,
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
