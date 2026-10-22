// src/lib/auth/authStore.ts
'use client';

import { AppRole, AuthSession } from '../../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  company: string;
  role: AppRole;
  token?: string;
  createdAt: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  company: string;
  role: AppRole;
  password?: string;
  factoryCode?: string;
}

const STORAGE_KEY = 'scopezero_auth_user';

export const DEMO_USERS: Record<AppRole, AuthUser> = {
  supplier: {
    id: 'supplier-demo',
    email: 'supplier@companya.vn',
    name: 'Nguyễn Văn A',
    company: 'Công ty Cơ khí A',
    role: 'supplier',
    token: 'tide_token_supplier_internal_001',
    createdAt: '2026-10-20T08:00:00.000Z'
  },
  buyer: {
    id: 'buyer-demo',
    email: 'procurement@corpb.vn',
    name: 'Trần Thị B',
    company: 'Tập đoàn B',
    role: 'buyer',
    token: 'tide_token_buyer_public_002',
    createdAt: '2026-10-20T08:30:00.000Z'
  }
};

/** Lấy thông tin user hiện tại từ localStorage */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Chuyển đổi AuthUser sang AuthSession chuẩn v1 */
export function getAuthSession(user: AuthUser | null): AuthSession | null {
  if (!user) return null;
  return {
    subject: user.id,
    roles: [user.role]
  };
}

/** Đăng nhập */
export function login(email: string, role: AppRole = 'supplier', name?: string, company?: string): AuthUser {
  const user: AuthUser = {
    id: `usr_${Date.now()}`,
    email,
    name: name || email.split('@')[0],
    company: company || (role === 'supplier' ? 'Nhà cung cấp' : 'Bên mua'),
    role,
    token: `tide_token_${role}_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth_change'));
  }
  return user;
}

/** Đăng ký tài khoản mới */
export function register(payload: RegisterPayload): AuthUser {
  const user: AuthUser = {
    id: `usr_${Date.now()}`,
    email: payload.email,
    name: payload.name,
    company: payload.company,
    role: payload.role,
    token: `tide_token_${payload.role}_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth_change'));
  }
  return user;
}

/** Đăng nhập nhanh bằng tài khoản mẫu */
export function loginDemo(role: AppRole): AuthUser {
  const user = DEMO_USERS[role];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth_change'));
  }
  return user;
}

/** Đăng xuất */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('auth_change'));
  }
}
