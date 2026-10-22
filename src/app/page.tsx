// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '../lib/auth/useAuth';
import { DemoAssistant } from '../components/Demo/DemoAssistant';
import { DemoAccountKey } from '../lib/auth/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, loginAsPreset, logout, error } = useAuth();

  const handleQuickLogin = async (key: DemoAccountKey, targetPath: string) => {
    if (!await loginAsPreset(key)) return;
    router.push(targetPath);
  };

  return (
    <div className={styles.page}>
      {error && <p role="alert">{error}</p>}
      {/* Navigation Header */}
      <header className={styles.navHeader}>
        <div className={`${styles.container} ${styles.navInner}`}>
          <Link href="/" className={styles.brand} aria-label="ScopeZero">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M21 5H10a5 5 0 0 0 0 10h8a4 4 0 0 1 0 8H7" stroke="currentColor" strokeWidth="2.5" />
              <path d="M18 2v6M10 20v6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className={styles.brandText}>ScopeZero</span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Tổng quan</Link>
            <Link href="/supplier" className={styles.navLink}>Nhà cung cấp</Link>
            <Link href="/buyer" className={styles.navLink}>Bên mua</Link>
            <Link href="/auth" className={styles.navBtn}>
              {isAuthenticated && user ? `${user.company}` : 'Đăng nhập'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Interactive 2-Minute Demo Assistant Bar */}
      <DemoAssistant />

      {/* Hero Section */}
      <main className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            TideCloak E2EE & QEA Architecture
          </div>
          <h1 className={styles.heroTitle}>
            Chia sẻ phát thải Scope 3.<br />Bảo vệ bí mật kinh doanh.
          </h1>
          <p className={styles.heroSubtitle}>
            Giải pháp công bố dấu chân carbon (PCF v1) không để lộ dữ liệu điện năng, nguyên vật liệu và công suất nhà máy.
          </p>

          {/* Auth Gate Reminder & 1-Click Mock Preset Selector */}
          <div className={styles.authStatusBanner}>
            <div className={styles.authBannerHeader}>
              <div className={styles.authNoticeText}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {isAuthenticated && user ? (
                  <span>Đang đăng nhập: <strong>{user.company}</strong> ({user.name})</span>
                ) : (
                  <span>Bắt buộc đăng nhập để truy cập workspace — Chọn nhanh tài khoản mock:</span>
                )}
              </div>
              {isAuthenticated && user && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={styles.authActiveBadge}>
                    {user.role === 'supplier' ? 'Supplier Active' : 'Buyer Active'}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    style={{ background: 'none', border: 'none', color: '#be123c', fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            <div className={styles.quickLoginRow}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Mock 1-Click:</span>
              <button
                type="button"
                className={`${styles.quickChip} ${user?.id === 'supplier-demo' ? styles.quickChipActive : ''}`}
                onClick={() => handleQuickLogin('supplier', '/supplier')}
              >
                Supplier A (Cơ khí A - Owner)
              </button>
              <button
                type="button"
                className={`${styles.quickChip} ${user?.id === 'supplier-other' ? styles.quickChipActive : ''}`}
                onClick={() => handleQuickLogin('supplier2', '/supplier')}
              >
                Supplier B (Điện tử B - Tenant khác)
              </button>
              <button
                type="button"
                className={`${styles.quickChip} ${user?.id === 'buyer-demo' ? styles.quickChipActive : ''}`}
                onClick={() => handleQuickLogin('buyer', '/buyer')}
              >
                Buyer (Tập đoàn Mua Hàng B)
              </button>
              <Link href="/auth" className={styles.quickChip}>
                Tất cả tài khoản / Tự nhập →
              </Link>
            </div>
          </div>
        </section>

        {/* Portals Gateway Cards */}
        <section className={styles.portalsGrid}>
          {/* Supplier Card */}
          <article className={styles.portalCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3l3-2 3 2v4H9z" />
                </svg>
              </div>
              <div>
                <div className={styles.cardRole}>Nhà cung cấp</div>
                <h2 className={styles.cardTitle}>Cổng Supplier</h2>
              </div>
            </div>
            <p className={styles.cardDesc}>
              Nhập số liệu tiêu thụ, tự động tính toán PCF tại trình duyệt và mã hóa E2EE trước khi lưu trữ.
            </p>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Tính PCF cục bộ, kết quả tất định không qua máy chủ.</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Mã hóa E2EE bằng thẻ nội bộ <code>_tide_supplier_internal</code>.</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Chỉ chủ sở hữu lô hàng mới có quyền giải mã.</span>
              </li>
            </ul>
            <Link href="/supplier" className={styles.cardCtaSupplier}>
              Vào không gian Supplier →
            </Link>
          </article>

          {/* Buyer Card */}
          <article className={styles.portalCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <div>
                <div className={`${styles.cardRole} ${styles.cardRoleBuyer}`}>Bên mua hàng</div>
                <h2 className={styles.cardTitle}>Cổng Buyer</h2>
              </div>
            </div>
            <p className={styles.cardDesc}>
              Tra cứu báo cáo phát thải carbon được công bố công khai để tích hợp vào báo cáo Scope 3.
            </p>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Đọc tổng phát thải và suất phát thải sau khi đăng nhập.</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Gán nhãn minh bạch: <code>supplier-reported</code>.</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Không có quyền truy cập dữ liệu hoạt động nguồn (Zero Leakage).</span>
              </li>
            </ul>
            <Link href="/buyer" className={styles.cardCtaBuyer}>
              Vào không gian Buyer →
            </Link>
          </article>
        </section>

        {/* Security Architecture Flow */}
        <section className={styles.architectureSection}>
          <div className={styles.sectionHeader}>
            <h2>Quy trình liên kết Supplier - Buyer & Bảo mật E2EE</h2>
            <p>Bảo đảm tính toàn vẹn và phân định ranh giới dữ liệu từ máy khách đến bên mua</p>
          </div>

          <div className={styles.archGrid}>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 1</span>
              <h3 className={styles.stepTitle}>Tính toán cục bộ</h3>
              <p className={styles.stepDesc}>
                Nhập liệu và tính toán phát thải (1,690 kg CO₂e) ngay trên máy khách Supplier.
              </p>
            </div>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 2</span>
              <h3 className={styles.stepTitle}>Niêm phong E2EE</h3>
              <p className={styles.stepDesc}>
                Mã hóa dữ liệu nhạy cảm bằng TideCloak SDK thẻ <code>_tide_supplier_internal</code> trước khi truyền.
              </p>
            </div>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 3</span>
              <h3 className={styles.stepTitle}>Lưu trữ an toàn</h3>
              <p className={styles.stepDesc}>
                Máy chủ chỉ lưu trữ bản tóm tắt công khai và envelope mã hóa. Zero Private Leakage.
              </p>
            </div>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 4</span>
              <h3 className={styles.stepTitle}>Công bố cho Buyer</h3>
              <p className={styles.stepDesc}>
                Bên mua nhận chỉ số phát thải mà không thể truy cập hay giải mã dữ liệu gốc.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <span>ScopeZero · Quản lý dấu chân carbon chuỗi cung ứng</span>
          <span>Bảo mật bằng TideCloak E2EE</span>
        </div>
      </footer>
    </div>
  );
}
