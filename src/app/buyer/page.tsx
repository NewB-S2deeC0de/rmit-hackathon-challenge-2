// src/app/buyer/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BuyerWorkspace } from '../../components/Buyer/BuyerWorkspace';
import { useAuth } from '../../lib/auth/useAuth';
import { AuthGate } from '../../components/Auth/AuthGate';
import { DemoAssistant } from '../../components/Demo/DemoAssistant';
import styles from '../../components/Buyer/BuyerWorkspace.module.css';

export default function BuyerPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand} aria-label="ScopeZero — Trang chủ">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M21 5H10a5 5 0 0 0 0 10h8a4 4 0 0 1 0 8H7" stroke="currentColor" strokeWidth="2.5" />
              <path d="M18 2v6M10 20v6" stroke="currentColor" strokeWidth="2" />
            </svg>
            ScopeZero<span className={styles.brandDivider}>/</span><span className={styles.brandScope}>Buyer</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Điều hướng chính">
            <Link href="/" className={styles.navLink}>Tổng quan</Link>
            <Link href="/supplier" className={styles.navLink}>Nhà cung cấp</Link>
            <Link href="/buyer" className={`${styles.navLink} ${styles.navLinkActive}`} aria-current="page">Bên mua</Link>
            <Link href="/auth" className={styles.navLink}>
              {user ? `${(user as { company?: string }).company}` : 'Tài khoản'}
            </Link>
          </nav>
          <span className={styles.publicLabel}>Báo cáo công khai</span>
        </header>

        <DemoAssistant />

        <AuthGate
          requiredRole="buyer"
          portalName="Cổng Bên mua (Buyer)"
          description="Tra cứu và giám sát báo cáo phát thải Scope 3 công bố từ các đối tác nhà cung cấp."
        />

        <footer className={styles.footer}>
          <span>ScopeZero · Buyer workspace</span>
          <span>Bảo mật dữ liệu bằng TideCloak E2EE</span>
        </footer>
      </div>
    );
  }

  return (
    <div>
      <DemoAssistant />
      <BuyerWorkspace initialMode="sample" />
    </div>
  );
}
