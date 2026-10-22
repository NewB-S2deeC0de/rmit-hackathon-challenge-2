// src/app/auth/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';
import { useAuth } from '../../lib/auth/useAuth';
import { AppRole } from '../../types';
import { DemoAccountKey, DEMO_ACCOUNTS } from '../../lib/auth/authStore';
import { DemoAssistant } from '../../components/Demo/DemoAssistant';

export default function AuthPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, register, logout, loginAsPreset } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'demo'>('login');
  const [role, setRole] = useState<AppRole>('supplier');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Vui lòng nhập email hoặc tên đăng nhập', type: 'error' });
      return;
    }
    const loggedIn = login(email, role, name, company);
    setMessage({ text: `Đăng nhập thành công với vai trò ${loggedIn.role === 'supplier' ? 'Nhà cung cấp' : 'Bên mua'}.`, type: 'success' });
    setTimeout(() => {
      router.push(loggedIn.role === 'supplier' ? '/supplier' : '/buyer');
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !company) {
      setMessage({ text: 'Vui lòng điền đầy đủ các thông tin bắt buộc', type: 'error' });
      return;
    }
    const registered = register({ email, name, company, role, password });
    setMessage({ text: 'Đăng ký tài khoản thành công! Đang chuyển hướng...', type: 'success' });
    setTimeout(() => {
      router.push(registered.role === 'supplier' ? '/supplier' : '/buyer');
    }, 500);
  };

  const handleSelectMockAccount = (key: DemoAccountKey) => {
    const account = loginAsPreset(key);
    setMessage({ text: `Đã kích hoạt tài khoản: ${account.company} (${account.name})`, type: 'success' });
    setTimeout(() => {
      router.push(account.role === 'supplier' ? '/supplier' : '/buyer');
    }, 400);
  };

  return (
    <div className={styles.authPage}>
      {/* Universal Topbar */}
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="ScopeZero">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M21 5H10a5 5 0 0 0 0 10h8a4 4 0 0 1 0 8H7" stroke="currentColor" strokeWidth="2.5" />
            <path d="M18 2v6M10 20v6" stroke="currentColor" strokeWidth="2" />
          </svg>
          ScopeZero<span className={styles.brandDivider}>/</span><span className={styles.brandScope}>Auth</span>
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Tổng quan</Link>
          <Link href="/supplier" className={styles.navLink}>Nhà cung cấp</Link>
          <Link href="/buyer" className={styles.navLink}>Bên mua</Link>
        </nav>
      </header>

      {/* Interactive 2-Minute Demo Assistant Bar */}
      <DemoAssistant />

      <main className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h1>Cổng Xác Thực Tài Khoản</h1>
            <p className={styles.cardSubtitle}>
              Quản lý danh tính và phân quyền truy cập cho chuỗi cung ứng
            </p>
          </div>

          {message && (
            <div className={`${styles.statusMessage} ${message.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
              {message.text}
            </div>
          )}

          {/* Nếu đã đăng nhập: hiển thị thẻ thông tin tài khoản hiện tại & các nút chuyển vai trò */}
          {isAuthenticated && user ? (
            <div>
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <div className={styles.profileName}>{user.company}</div>
                  <span className={`${styles.profileRoleBadge} ${user.role === 'supplier' ? styles.badgeSupplier : styles.badgeBuyer}`}>
                    {user.role === 'supplier' ? 'Nhà cung cấp (Supplier)' : 'Bên mua (Buyer)'}
                  </span>
                </div>
                <div className={styles.profileDetails}>
                  <div>Người dùng: <strong>{user.name}</strong></div>
                  <div>Email: <strong>{user.email}</strong></div>
                  <div>Mã phiên: <code style={{ fontFamily: 'monospace' }}>{user.id}</code></div>
                </div>
              </div>

              <div className={styles.actionsRow} style={{ marginBottom: '16px' }}>
                <Link
                  href={user.role === 'supplier' ? '/supplier' : '/buyer'}
                  className={styles.btnPrimary}
                  style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}
                >
                  Vào không gian {user.role === 'supplier' ? 'Nhà cung cấp' : 'Bên mua'} →
                </Link>
              </div>

              <div className={styles.divider}>
                <span>Chuyển nhanh tài khoản demo khác</span>
              </div>

              <div className={styles.presetGroup}>
                {(Object.keys(DEMO_ACCOUNTS) as DemoAccountKey[]).map((key) => {
                  const acc = DEMO_ACCOUNTS[key];
                  const isCurrent = user.id === acc.id;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={styles.presetBtn}
                      style={{ opacity: isCurrent ? 0.6 : 1 }}
                      disabled={isCurrent}
                      onClick={() => handleSelectMockAccount(key)}
                    >
                      <div>
                        <strong>{acc.company}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{acc.roleLabel}</div>
                      </div>
                      <span className={styles.presetBadge}>
                        {isCurrent ? 'Đang dùng' : acc.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className={styles.btnDanger}
                  style={{ width: '100%' }}
                  onClick={logout}
                >
                  Đăng xuất khỏi hệ thống
                </button>
              </div>
            </div>
          ) : (
            /* Biểu mẫu Đăng nhập / Đăng ký / Tài khoản mẫu */
            <div>
              {/* Tab Navigation */}
              <div className={styles.tabNav} style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${tab === 'login' ? styles.tabBtnActive : ''}`}
                  onClick={() => { setTab('login'); setMessage(null); }}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${tab === 'demo' ? styles.tabBtnActive : ''}`}
                  onClick={() => { setTab('demo'); setMessage(null); }}
                >
                  Mock Demo (1-Click)
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${tab === 'register' ? styles.tabBtnActive : ''}`}
                  onClick={() => { setTab('register'); setMessage(null); }}
                >
                  Đăng ký
                </button>
              </div>

              {tab === 'demo' ? (
                /* Tab Danh sách tài khoản Mock Demo */
                <div className={styles.presetGroup}>
                  {(Object.keys(DEMO_ACCOUNTS) as DemoAccountKey[]).map((key) => {
                    const acc = DEMO_ACCOUNTS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        className={styles.presetBtn}
                        style={{ padding: '12px', alignItems: 'flex-start' }}
                        onClick={() => handleSelectMockAccount(key)}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                            {acc.company}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                            {acc.roleLabel} — {acc.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {acc.description}
                          </div>
                        </div>
                        <span className={styles.presetBadge} style={{ alignSelf: 'center' }}>
                          {acc.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  {/* Lựa chọn vai trò */}
                  <div className={styles.roleSelector}>
                    <button
                      type="button"
                      className={`${styles.roleOption} ${role === 'supplier' ? styles.roleOptionActive : ''}`}
                      onClick={() => setRole('supplier')}
                    >
                      <div className={styles.roleTitle}>Nhà cung cấp</div>
                      <div className={styles.roleDesc}>Khai báo phát thải & mã hóa E2EE</div>
                    </button>
                    <button
                      type="button"
                      className={`${styles.roleOption} ${role === 'buyer' ? styles.roleOptionActive : ''}`}
                      onClick={() => setRole('buyer')}
                    >
                      <div className={styles.roleTitle}>Bên mua hàng</div>
                      <div className={styles.roleDesc}>Tra cứu báo cáo công khai Scope 3</div>
                    </button>
                  </div>

                  {tab === 'login' ? (
                    /* Form Đăng Nhập */
                    <form onSubmit={handleLogin} className={styles.form}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="login-email">
                          Tên đăng nhập hoặc Email
                        </label>
                        <input
                          id="login-email"
                          type="text"
                          placeholder={role === 'supplier' ? 'supplier@company.vn' : 'buyer@corp.vn'}
                          className={styles.input}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="login-password">
                          Mật khẩu
                        </label>
                        <input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className={styles.input}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <button type="submit" className={styles.btnPrimary}>
                        Đăng nhập ({role === 'supplier' ? 'Supplier' : 'Buyer'})
                      </button>
                    </form>
                  ) : (
                    /* Form Tạo Tài Khoản */
                    <form onSubmit={handleRegister} className={styles.form}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="reg-company">
                          Tên công ty / Doanh nghiệp *
                        </label>
                        <input
                          id="reg-company"
                          type="text"
                          placeholder={role === 'supplier' ? 'VD: Công ty Cơ khí & Linh kiện A' : 'VD: Tập đoàn Sản xuất B'}
                          className={styles.input}
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="reg-name">
                          Họ và tên người đại diện *
                        </label>
                        <input
                          id="reg-name"
                          type="text"
                          placeholder="VD: Nguyễn Văn A"
                          className={styles.input}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="reg-email">
                          Email làm việc *
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          placeholder="name@company.com"
                          className={styles.input}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="reg-password">
                          Mật khẩu khởi tạo
                        </label>
                        <input
                          id="reg-password"
                          type="password"
                          placeholder="Tối thiểu 6 ký tự"
                          className={styles.input}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <button type="submit" className={styles.btnPrimary}>
                        Tạo tài khoản & Đăng nhập ngay
                      </button>
                    </form>
                  )}

                  {/* Fast 1-Click Demo Section */}
                  <div className={styles.divider}>
                    <span>Hoặc đăng nhập nhanh bằng tài khoản mẫu</span>
                  </div>

                  <div className={styles.presetGroup}>
                    <button
                      type="button"
                      className={styles.presetBtn}
                      onClick={() => handleSelectMockAccount('supplier')}
                    >
                      <span>Supplier chính: <strong>Công ty Cơ khí A</strong></span>
                      <span className={styles.presetBadge}>Demo E2EE</span>
                    </button>
                    <button
                      type="button"
                      className={styles.presetBtn}
                      onClick={() => handleSelectMockAccount('buyer')}
                    >
                      <span>Bên mua: <strong>Tập đoàn Mua Hàng B</strong></span>
                      <span className={styles.presetBadge}>Demo Scope 3</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
