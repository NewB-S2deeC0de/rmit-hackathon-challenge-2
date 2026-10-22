import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Global Navigation Header */}
      <header className={styles.navHeader}>
        <div className={`${styles.container} ${styles.navInner}`}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandIcon}>🌱</div>
            <span className={styles.brandText}>ScopeZero</span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Trang Chủ
            </Link>
            <Link href="/supplier" className={styles.navLink}>
              🏢 Cổng Nhà Cung Cấp
            </Link>
            <Link href="/buyer" className={styles.navLink}>
              🛒 Cổng Bên Mua
            </Link>
            <a
              href="https://docs.tide.org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navBtn}
            >
              TideCloak Docs ↗
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span>🛡️</span> RMIT Hackathon Challenge 2 · TideCloak E2EE & QEA
          </div>
          <h1 className={styles.heroTitle}>
            Chia sẻ Phát thải <span className={styles.gradientText}>Scope 3</span> mà Không Lộ{' '}
            <span className={styles.gradientText}>Bí Mật Kinh Doanh</span>
          </h1>
          <p className={styles.heroSubtitle}>
            ScopeZero giải quyết mâu thuẫn cốt lõi trong chuỗi cung ứng: Nhà cung cấp muốn chia sẻ
            dấu chân carbon (PCF) cho bên mua nhưng cần bảo vệ tuyệt đối dữ liệu điện năng, nguyên
            vật liệu và công suất nhà máy.
          </p>
        </section>

        {/* Portals Gateway Cards */}
        <section className={styles.portalsGrid}>
          {/* Supplier Card */}
          <article className={styles.portalCard}>
            <div className={styles.cardGlowSupplier} />
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🏢</div>
              <div>
                <div className={styles.cardRole}>Dành Cho Nhà Cung Cấp</div>
                <h2 className={styles.cardTitle}>Cổng Nhà Cung Cấp (Supplier)</h2>
              </div>
            </div>
            <p className={styles.cardDesc}>
              Nhập số liệu tiêu thụ, tự động tính toán PCF trực tiếp trên trình duyệt, xem trước minh
              bạch các trường công bố và mã hóa E2EE bằng TideCloak SDK trước khi gửi.
            </p>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>
                  <strong>Tính toán PCF tại máy khách:</strong> Công thức thuần túy, tất định,
                  không phụ thuộc server.
                </span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>
                  <strong>Mã hóa E2EE TideCloak:</strong> Input, breakdown và bằng chứng được mã
                  hóa bằng thẻ nội bộ <code>TAG_SUPPLIER_INTERNAL</code>.
                </span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>
                  <strong>Quyền giải mã chính chủ:</strong> Chỉ Supplier sở hữu lô mới có khả
                  năng giải mã lại dữ liệu gốc.
                </span>
              </li>
            </ul>
            <Link href="/supplier" className={styles.cardCtaSupplier}>
              <span>Vào Cổng Nhà Cung Cấp</span>
              <span>➔</span>
            </Link>
          </article>

          {/* Buyer Card */}
          <article className={styles.portalCard}>
            <div className={styles.cardGlowBuyer} />
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🛒</div>
              <div>
                <div className={`${styles.cardRole} ${styles.cardRoleBuyer}`}>
                  Dành Cho Doanh Nghiệp Mua Hàng
                </div>
                <h2 className={styles.cardTitle}>Cổng Bên Mua (Buyer)</h2>
              </div>
            </div>
            <p className={styles.cardDesc}>
              Tra cứu danh sách kết quả phát thải carbon của các lô linh kiện được công bố công khai.
              Đánh giá nhà cung cấp chuỗi cung ứng mà không xâm phạm dữ liệu riêng tư.
            </p>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>
                  <strong>Xem báo cáo không cần đăng nhập:</strong> Đọc trực tiếp tổng phát thải và
                  phát thải trên 1 sản phẩm.
                </span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>
                  <strong>Gán nhãn minh bạch:</strong> Thể hiện rõ mức độ đảm bảo{' '}
                  <code>supplier-reported</code> (chưa qua kiểm toán).
                </span>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>
                  <strong>Ngăn chặn vượt quyền:</strong> Bên mua bị từ chối 100% khi cố gắng giải
                  mã hoặc truy cập hồ sơ chi phí nội bộ.
                </span>
              </li>
            </ul>
            <Link href="/buyer" className={styles.cardCtaBuyer}>
              <span>Vào Cổng Bên Mua</span>
              <span>➔</span>
            </Link>
          </article>
        </section>

        {/* Security & Architecture Section */}
        <section className={styles.architectureSection}>
          <div className={styles.sectionHeader}>
            <h2>Kiến Trúc Ranh Giới Tin Cậy & Quản Trị QEA</h2>
            <p>Bảo vệ toàn vẹn dữ liệu từ trình duyệt máy khách đến hạ tầng lưu trữ</p>
          </div>

          <div className={styles.archGrid}>
            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 1</span>
              <h3 className={styles.stepTitle}>Máy Khách Supplier</h3>
              <p className={styles.stepDesc}>
                Validate form và tính PCF cục bộ trên dữ liệu rõ. Phân tách ranh giới rõ ràng giữa
                Summary và Private Payload.
              </p>
            </div>

            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 2</span>
              <h3 className={styles.stepTitle}>Mã Hóa E2EE Client</h3>
              <p className={styles.stepDesc}>
                TideCloak SDK mã hóa private payload (JSON.stringify) với thẻ{' '}
                <code>_tide_supplier_internal</code> trước khi gửi qua mạng.
              </p>
            </div>

            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 3</span>
              <h3 className={styles.stepTitle}>Backend ScopeZero</h3>
              <p className={styles.stepDesc}>
                Chỉ lưu trữ <code>publicSummary</code> và bản mã <code>encryptedInput</code>. Không
                giải mã, không lưu số liệu thô.
              </p>
            </div>

            <div className={styles.archStep}>
              <span className={styles.stepNum}>BƯỚC 4</span>
              <h3 className={styles.stepTitle}>Quorum QEA 3 Admin</h3>
              <p className={styles.stepDesc}>
                Chính sách cấp quyền nhạy cảm yêu cầu tối thiểu 2/3 admin phê duyệt. Một admin đơn lẻ
                không thể tự thay đổi quyền.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div>
            <strong>ScopeZero</strong> · Privacy-Preserving PCF Calculator
          </div>
          <div>Đồng bộ Kiến trúc & Hợp đồng v1 (Nhóm 2, 3, 4)</div>
        </div>
      </footer>
    </div>
  );
}
