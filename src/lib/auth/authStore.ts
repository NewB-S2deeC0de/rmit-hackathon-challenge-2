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

export type DemoAccountKey = 'supplier' | 'supplier2' | 'buyer' | 'admin';

export interface DemoAccountInfo extends AuthUser {
  description: string;
  roleLabel: string;
  badge: string;
}

export const DEMO_ACCOUNTS: Record<DemoAccountKey, DemoAccountInfo> = {
  supplier: {
    id: 'supplier-demo',
    email: 'supplier@companya.vn',
    name: 'Nguyễn Văn A',
    company: 'Công ty Cơ khí A',
    role: 'supplier',
    token: 'tide_token_supplier_internal_001',
    createdAt: '2026-10-20T08:00:00.000Z',
    roleLabel: 'Nhà cung cấp chính (Owner)',
    badge: 'Chủ sở hữu DEMO-001',
    description: 'Khai báo PCF tại máy khách, mã hóa E2EE và có khóa giải mã dữ liệu nội bộ.'
  },
  supplier2: {
    id: 'supplier-other',
    email: 'supplier2@companyb.vn',
    name: 'Lê Văn B',
    company: 'Công ty Điện tử B',
    role: 'supplier',
    token: 'tide_token_supplier_other_003',
    createdAt: '2026-10-20T09:15:00.000Z',
    roleLabel: 'Nhà cung cấp phụ (Tenant khác)',
    badge: 'Cô lập Multi-tenant',
    description: 'Thử nghiệm cô lập dữ liệu: Không thể giải mã hoặc can thiệp vào lô hàng của Công ty Cơ khí A.'
  },
  buyer: {
    id: 'buyer-demo',
    email: 'procurement@corpb.vn',
    name: 'Trần Thị B',
    company: 'Tập đoàn Mua Hàng B',
    role: 'buyer',
    token: 'tide_token_buyer_public_002',
    createdAt: '2026-10-20T08:30:00.000Z',
    roleLabel: 'Bên mua hàng (Procurement)',
    badge: 'Scope 3 Consumer',
    description: 'Chỉ xem báo cáo phát thải công bố. Không thể truy cập dữ liệu hoạt động nội bộ (Zero Leakage).'
  },
  admin: {
    id: 'admin-council',
    email: 'audit@qea.network',
    name: 'Hội đồng Bảo mật QEA',
    company: 'Ban Quản trị QEA Council',
    role: 'buyer',
    token: 'tide_token_admin_001',
    createdAt: '2026-10-20T07:00:00.000Z',
    roleLabel: 'Kiểm toán viên QEA Quorum',
    badge: 'QEA 2/3 Multi-Admin',
    description: 'Minh họa cơ chế QEA: Cần ít nhất 2 trong 3 admin đồng thuận mới có thể cập nhật chính sách.'
  }
};

export const DEMO_USERS: Record<AppRole, AuthUser> = {
  supplier: DEMO_ACCOUNTS.supplier,
  buyer: DEMO_ACCOUNTS.buyer
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

/** Đăng nhập nhanh bằng tài khoản mẫu cơ bản */
export function loginDemo(role: AppRole): AuthUser {
  const user = DEMO_USERS[role];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth_change'));
  }
  return user;
}

/** Đăng nhập nhanh theo kịch bản mẫu (Supplier A, Supplier B, Buyer, Admin QEA) */
export function loginAsPreset(key: DemoAccountKey): AuthUser {
  const account = DEMO_ACCOUNTS[key];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    window.dispatchEvent(new Event('auth_change'));
  }
  return account;
}

/** Đăng xuất */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('auth_change'));
  }
}
