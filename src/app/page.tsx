// src/app/page.tsx
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
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
            <Link href="/auth" className={styles.navBtn}>Tài khoản</Link>
          </nav>
        </div>
      </header>

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
                <span>Đọc tổng phát thải và suất phát thải không cần đăng nhập.</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Gán nhãn minh bạch: <code>supplier-reported</code>.</span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>—</span>
                <span>Không có quyền truy cập dữ liệu hoạt động nguồn.</span>
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
            <h2>Quy trình phân định ranh giới dữ liệu</h2>
            <p>Bảo đảm tính toàn vẹn và bảo mật từ máy khách đến lưu trữ</p>
          </div>

          <div className={styles.archGrid}>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 1</span>
              <h3 className={styles.stepTitle}>Tính toán cục bộ</h3>
              <p className={styles.stepDesc}>
                Nhập liệu và tính toán phát thải ngay trên máy khách Supplier.
              </p>
            </div>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 2</span>
              <h3 className={styles.stepTitle}>Niêm phong E2EE</h3>
              <p className={styles.stepDesc}>
                Mã hóa dữ liệu nhạy cảm bằng TideCloak SDK trước khi truyền.
              </p>
            </div>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 3</span>
              <h3 className={styles.stepTitle}>Lưu trữ an toàn</h3>
              <p className={styles.stepDesc}>
                Máy chủ chỉ lưu trữ bản tóm tắt công khai và envelope mã hóa.
              </p>
            </div>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 4</span>
              <h3 className={styles.stepTitle}>Công bố cho Buyer</h3>
              <p className={styles.stepDesc}>
                Bên mua nhận chỉ số phát thải mà không truy cập được dữ liệu gốc.
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
