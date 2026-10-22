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

function generateJwtToken(id: string, role: AppRole, name: string): string {
  const toBase64Url = (obj: Record<string, unknown>) => {
    const json = JSON.stringify(obj);
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(json, 'utf8').toString('base64url');
    }
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const header = toBase64Url({ alg: 'EdDSA', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url({
    sub: id,
    preferred_username: name,
    name: name,
    exp: now + 3600 * 24,
    nbf: now - 60,
    realm_access: { roles: [role, '_tide_pcf.selfencrypt'] }
  });
  return `${header}.${payload}.tide-sig-${Date.now()}`;
}

export const DEMO_USERS: Record<AppRole, AuthUser> = {
  supplier: {
    id: 'supplier-demo',
    email: 'supplier@companya.vn',
    name: 'Nguyễn Văn A',
    company: 'Công ty Cơ khí A',
    role: 'supplier',
    token: generateJwtToken('supplier-demo', 'supplier', 'Nguyễn Văn A'),
    createdAt: '2026-10-20T08:00:00.000Z'
  },
  buyer: {
    id: 'buyer-demo',
    email: 'procurement@corpb.vn',
    name: 'Trần Thị B',
    company: 'Tập đoàn B',
    role: 'buyer',
    token: generateJwtToken('buyer-demo', 'buyer', 'Trần Thị B'),
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
  const id = `usr_${Date.now()}`;
  const userName = name || email.split('@')[0];
  const user: AuthUser = {
    id,
    email,
    name: userName,
    company: company || (role === 'supplier' ? 'Nhà cung cấp' : 'Bên mua'),
    role,
    token: generateJwtToken(id, role, userName),
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
  const id = `usr_${Date.now()}`;
  const user: AuthUser = {
    id,
    email: payload.email,
    name: payload.name,
    company: payload.company,
    role: payload.role,
    token: generateJwtToken(id, payload.role, payload.name),
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
