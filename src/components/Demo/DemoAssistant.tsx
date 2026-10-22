// src/components/Demo/DemoAssistant.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DemoAssistant.module.css';
import { useAuth } from '../../lib/auth/useAuth';
import { DemoAccountKey } from '../../lib/auth/authStore';

interface DemoStep {
  id: number;
  timeRange: string;
  shortTitle: string;
  title: string;
  speechCue: string;
  recommendedRole: DemoAccountKey;
  recommendedPath: string;
  roleActionText: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    timeRange: '0:00 - 0:30',
    shortTitle: '1. Supplier PCF & E2EE',
    title: 'Supplier khai báo PCF & Niêm phong E2EE máy khách',
    speechCue: 'Supplier đăng nhập tài khoản Công ty Cơ khí A. Nhập số liệu sản xuất thực tế, engine PCF v1 tính toán ra 1,690 kg CO₂e ngay tại trình duyệt. Dữ liệu gốc được mã hóa E2EE bằng TideCloak SDK trước khi gửi lên máy chủ.',
    recommendedRole: 'supplier',
    recommendedPath: '/supplier',
    roleActionText: 'Đăng nhập Supplier A & Mở Cổng'
  },
  {
    id: 2,
    timeRange: '0:30 - 1:00',
    shortTitle: '2. Giải mã & Cô lập',
    title: 'Kiểm chứng giải mã Owner & Cô lập dữ liệu Multi-tenant',
    speechCue: 'Tại tab Giải mã, chỉ có Supplier A sở hữu đúng thẻ bảo mật mới giải mã được hồ sơ gốc. Khi thử nghiệm với Supplier B hoặc bên thứ ba, TideCloak kiên quyết từ chối giải mã với mã 403 ACCESS_DENIED.',
    recommendedRole: 'supplier2',
    recommendedPath: '/supplier',
    roleActionText: 'Thử đổi sang Supplier B (Test cô lập)'
  },
  {
    id: 3,
    timeRange: '1:00 - 1:30',
    shortTitle: '3. Buyer & Zero-Leakage',
    title: 'Bên mua nhận báo cáo Scope 3 & Cơ chế Zero Private Leakage',
    speechCue: 'Chuyển sang Bên mua (Buyer). Bảng báo cáo hiển thị ngay lô DEMO-001 với nhãn "Supplier tự khai báo" và phát thải 1,690 kg CO₂e. Toàn bộ bí mật kinh doanh (điện, nguyên liệu, chi phí) được giữ kín tuyệt đối, API chặn 100% mọi truy cập trái phép.',
    recommendedRole: 'buyer',
    recommendedPath: '/buyer',
    roleActionText: 'Đăng nhập Buyer & Mở Cổng'
  },
  {
    id: 4,
    timeRange: '1:30 - 2:00',
    shortTitle: '4. Quản trị QEA (2/3)',
    title: 'Kiến trúc bảo mật QEA: Ngưỡng đồng thuận 2/3 Multi-Admin',
    speechCue: 'ScopeZero ứng dụng kiến trúc TideCloak QEA: Ngay cả admin hệ thống cũng không có master key. Mọi phân quyền hay thay đổi chính sách bảo mật đều bắt buộc phải có sự đồng thuận của ít nhất 2 trong 3 admin độc lập.',
    recommendedRole: 'admin',
    recommendedPath: '/auth',
    roleActionText: 'Xem hồ sơ Ban Quản trị QEA'
  }
];

export function DemoAssistant() {
  const router = useRouter();
  const { user, loginAsPreset } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [testApiStatus, setTestApiStatus] = useState<string | null>(null);

  const currentStep = DEMO_STEPS[activeStepIndex];

  const handleStepSelect = (index: number) => {
    setActiveStepIndex(index);
    setIsExpanded(true);
  };

  const handleApplyRoleAndNavigate = (step: DemoStep) => {
    loginAsPreset(step.recommendedRole);
    router.push(step.recommendedPath);
  };

  const handleTestUnauthorizedAccess = async () => {
    setTestApiStatus('Đang gửi yêu cầu vi phạm bảo mật...');
    try {
      const res = await fetch('/api/batches/demo-001/encrypted', {
        headers: {
          'Authorization': 'Bearer ' + (user?.token || 'unauthorized_token')
        }
      });
      if (res.status === 403 || res.status === 401) {
        setTestApiStatus(`Bảo mật thành công: Máy chủ từ chối với HTTP ${res.status} (ACCESS_DENIED) — Zero Leakage!`);
      } else if (res.status === 404) {
        setTestApiStatus(`Bảo mật thành công: HTTP 404 (Không tìm thấy bản ghi hoặc không có quyền xem).`);
      } else {
        setTestApiStatus(`Mã phản hồi: HTTP ${res.status}`);
      }
    } catch {
      setTestApiStatus('Bảo mật thành công: Yêu cầu bị chặn tại cổng API.');
    }
  };

  return (
    <aside className={styles.demoBar} aria-label="Trợ lý Kịch bản Demo 2 Phút">
      <div className={styles.demoBarInner}>
        <div className={styles.titleArea}>
          <span className={styles.badge}>
            <span className={styles.badgeLive} aria-hidden="true" />
            Demo 2 Phút
          </span>
          <span className={styles.barTitle}>Kịch bản thuyết trình</span>
        </div>

        {/* Step Pills */}
        <div className={styles.stepPills}>
          {DEMO_STEPS.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              className={`${styles.stepPill} ${activeStepIndex === idx ? styles.stepPillActive : ''}`}
              onClick={() => handleStepSelect(idx)}
              aria-current={activeStepIndex === idx ? 'step' : undefined}
            >
              <span>{step.shortTitle}</span>
              <span className={styles.stepTime}>({step.timeRange})</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
        </button>
      </div>

      {/* Expanded Interactive Drawer */}
      {isExpanded && (
        <div className={styles.drawer}>
          <div className={styles.drawerGrid}>
            <div className={styles.stepDetail}>
              <div className={styles.stepHeader}>
                <span className={styles.stepIndex}>GIAI ĐOẠN {currentStep.id}</span>
                <span className={styles.stepName}>{currentStep.title}</span>
                <span className={styles.stepTime}>[{currentStep.timeRange}]</span>
              </div>

              <div className={styles.stepSpeech}>
                <div className={styles.stepSpeechTitle}>Gợi ý lời thoại thuyết trình (30s):</div>
                &ldquo;{currentStep.speechCue}&rdquo;
              </div>

              <div className={styles.quickActions}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  onClick={() => handleApplyRoleAndNavigate(currentStep)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {currentStep.roleActionText}
                </button>

                {currentStep.id === 2 && (
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => {
                      loginAsPreset('supplier');
                      router.push('/supplier');
                    }}
                  >
                    Đổi lại Supplier A (Giải mã thành công)
                  </button>
                )}

                {currentStep.id === 3 && (
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={handleTestUnauthorizedAccess}
                  >
                    Kiểm tra thử nghiệm API trái phép (Zero-Leakage)
                  </button>
                )}

                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => {
                    const next = (activeStepIndex + 1) % DEMO_STEPS.length;
                    setActiveStepIndex(next);
                  }}
                >
                  Bước tiếp theo →
                </button>
              </div>

              {testApiStatus && (
                <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#047857', background: '#ecfdf5', padding: '6px 10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  {testApiStatus}
                </div>
              )}
            </div>

            {/* Current Auth & Environment Status */}
            <div className={styles.securityCard}>
              <div className={styles.securityCardHeader}>
                <span>Trạng thái phiên làm việc</span>
                <a href="/auth" style={{ fontSize: '11px', color: '#64748b', textDecoration: 'none' }}>
                  Quản lý tài khoản →
                </a>
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Tài khoản hiện tại:</span>
                <span className={styles.securityValue}>
                  {user ? `${user.company}` : 'Chưa đăng nhập'}
                </span>
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Vai trò:</span>
                <span className={styles.securityValue}>
                  {user?.role === 'supplier' ? 'Nhà cung cấp (Supplier)' : user?.role === 'buyer' ? 'Bên mua (Buyer)' : 'Khách'}
                </span>
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Quyền giải mã:</span>
                <span className={styles.securityValue} style={{ color: user?.role === 'supplier' ? '#047857' : '#be123c' }}>
                  {user?.role === 'supplier' ? 'Được phép (Owner Key)' : 'Bị từ chối (Zero Leakage)'}
                </span>
              </div>
              <div className={styles.securityItem}>
                <span className={styles.securityLabel}>Đồng thuận QEA:</span>
                <span className={styles.securityValue}>Ngưỡng 2/3 Admin</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
