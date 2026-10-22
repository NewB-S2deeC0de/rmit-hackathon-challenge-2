// src/components/Auth/AuthGate.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import styles from './AuthGate.module.css';
import { useAuth } from '../../lib/auth/useAuth';
import { AppRole } from '../../types';
import { DemoAccountKey } from '../../lib/auth/authStore';

interface AuthGateProps {
  requiredRole: AppRole;
  portalName: string;
  description: string;
}

export function AuthGate({ requiredRole, portalName, description }: AuthGateProps) {
  const { user, loginAsPreset, error } = useAuth();

  const handleQuickLogin = (key: DemoAccountKey) => {
    loginAsPreset(key);
  };

  const isRoleMismatch = user && user.role !== requiredRole;

  return (
    <div className={styles.gateContainer}>
      <div className={styles.gateCard}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {error && <p role="alert">{error}</p>}
        <h1 className={styles.title}>Yêu cầu đăng nhập</h1>
        <p className={styles.subtitle}>
          Không gian <strong>{portalName}</strong> yêu cầu xác thực tài khoản để đảm bảo tính bảo mật và phân quyền dữ liệu chuỗi cung ứng.
        </p>

        {isRoleMismatch && (
          <div className={styles.roleMismatchBanner}>
            <div className={styles.roleMismatchTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Vai trò không phù hợp
            </div>
            <div>
              Bạn đang đăng nhập với tài khoản <strong>{user.company}</strong> (Vai trò: {user.role === 'buyer' ? 'Bên mua' : 'Nhà cung cấp'}).
              Vui lòng chuyển sang tài khoản {requiredRole === 'supplier' ? 'Nhà cung cấp' : 'Bên mua'} bên dưới.
            </div>
          </div>
        )}

        <div className={styles.presetsSection}>
          <div className={styles.presetsTitle}>
            Đăng nhập nhanh tài khoản mẫu (1-Click Demo)
          </div>

          <div className={styles.presetList}>
            {requiredRole === 'supplier' ? (
              <>
                <button
                  type="button"
                  className={styles.presetItem}
                  onClick={() => handleQuickLogin('supplier')}
                >
                  <div className={styles.presetInfo}>
                    <span className={styles.presetName}>Công ty Cơ khí A</span>
                    <span className={styles.presetDesc}>Supplier chính — Chủ sở hữu lô DEMO-001 & Khóa E2EE</span>
                  </div>
                  <span className={styles.presetBadge}>Đăng nhập →</span>
                </button>

                <button
                  type="button"
                  className={styles.presetItem}
                  onClick={() => handleQuickLogin('supplier2')}
                >
                  <div className={styles.presetInfo}>
                    <span className={styles.presetName}>Công ty Điện tử B</span>
                    <span className={styles.presetDesc}>Supplier phụ — Kiểm chứng cô lập dữ liệu Multi-tenant</span>
                  </div>
                  <span className={styles.presetBadge}>Đăng nhập →</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.presetItem}
                onClick={() => handleQuickLogin('buyer')}
              >
                <div className={styles.presetInfo}>
                  <span className={styles.presetName}>Tập đoàn Mua Hàng B</span>
                  <span className={styles.presetDesc}>Bên mua (Procurement) — Xem báo cáo công bố Scope 3</span>
                </div>
                <span className={styles.presetBadge}>Đăng nhập →</span>
              </button>
            )}
          </div>
        </div>

        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        <div>
          <Link href="/auth" className={styles.manualAuthLink}>
            Tự tạo tài khoản mới hoặc Đăng nhập thủ công →
          </Link>
        </div>
      </div>
    </div>
  );
}
