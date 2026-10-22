// src/components/Supplier/SupplierSubmissionModal.tsx
import React from 'react';
import styles from './SupplierStyles.module.css';
import { CreateBatchResponse, EncryptedPayload } from '../../types';

export type SubmissionStage = 'idle' | 'preparing' | 'encrypting' | 'submitting' | 'success' | 'conflict_409' | 'error';

export interface SupplierSubmissionModalProps {
  stage: SubmissionStage;
  errorMessage: string | null;
  batchId: string;
  encryptedPayload: EncryptedPayload | null;
  submissionResponse: CreateBatchResponse | null;
  onClose: () => void;
  onGoToDecryption?: () => void;
  onRetry?: () => void;
}

export const SupplierSubmissionModal: React.FC<SupplierSubmissionModalProps> = ({
  stage,
  errorMessage,
  batchId,
  encryptedPayload,
  submissionResponse,
  onClose,
  onGoToDecryption,
  onRetry
}) => {
  if (stage === 'idle') return null;

  const getStepStatus = (stepIndex: number) => {
    switch (stage) {
      case 'preparing':
        return stepIndex === 1 ? styles.stepCircleActive : styles.stepCircle;
      case 'encrypting':
        return stepIndex === 1 ? styles.stepCircleCompleted : stepIndex === 2 ? styles.stepCircleActive : styles.stepCircle;
      case 'submitting':
        return stepIndex <= 2 ? styles.stepCircleCompleted : stepIndex === 3 ? styles.stepCircleActive : styles.stepCircle;
      case 'success':
        return styles.stepCircleCompleted;
      case 'conflict_409':
      case 'error':
        return stepIndex <= 2 ? styles.stepCircleCompleted : styles.stepCircle;
      default:
        return styles.stepCircle;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Stepper Indicator */}
        <div className={styles.stepIndicator}>
          <div className={styles.stepItem}>
            <div className={getStepStatus(1)}>1</div>
            <span className={styles.stepLabel}>Chuẩn Bị</span>
          </div>
          <div className={styles.stepItem}>
            <div className={getStepStatus(2)}>2</div>
            <span className={styles.stepLabel}>Mã Hóa Tide</span>
          </div>
          <div className={styles.stepItem}>
            <div className={getStepStatus(3)}>3</div>
            <span className={styles.stepLabel}>Gửi API</span>
          </div>
          <div className={styles.stepItem}>
            <div className={stage === 'success' ? styles.stepCircleCompleted : styles.stepCircle}>
              {stage === 'success' ? '✓' : '4'}
            </div>
            <span className={styles.stepLabel}>Xác Nhận</span>
          </div>
        </div>

        {/* Content based on Stage */}
        {stage === 'preparing' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className={styles.spinner} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Đang chuẩn bị hồ sơ lô hàng...</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Trích xuất dữ liệu công khai và tổng hợp Private Batch Payload theo đúng chuẩn JSON.
            </p>
          </div>
        )}

        {stage === 'encrypting' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className={styles.spinner} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#059669' }}>Đang mã hóa đầu cuối với TideCloak SDK...</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Áp dụng thẻ quyền <code>_tide_supplier_internal</code> và thuật toán mật mã phần cứng.
            </p>
            {encryptedPayload && (
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Bản mã thô sinh ra từ SDK (Encrypted Ciphertext Preview):
                </span>
                <div className={styles.codeBlock}>
                  {encryptedPayload.serialized.slice(0, 150)}...
                </div>
              </div>
            )}
          </div>
        )}

        {stage === 'submitting' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className={styles.spinner} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#0284c7' }}>Đang gửi hồ sơ lên ScopeZero Backend...</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              POST /api/batches — Chỉ truyền tóm tắt công khai và bản mã hóa.
            </p>
          </div>
        )}

        {stage === 'success' && submissionResponse && (
          <div style={{ padding: '10px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '3rem', color: '#059669', marginBottom: '8px' }}>🎉</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Nộp Hồ Sơ Lô Hàng Thành Công!</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Hồ sơ đã được lưu trữ an toàn. Dữ liệu nguồn được bảo vệ bằng TideCloak E2EE.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Mã Lô Hàng (batchId):</span>
                <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{batchId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Định Danh Máy Chủ (UUID):</span>
                <span style={{ color: '#0284c7', fontFamily: 'monospace' }}>{submissionResponse.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Thời Gian Tiếp Nhận:</span>
                <span style={{ color: '#334155' }}>{new Date(submissionResponse.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onClose}
              >
                Tạo Lô Hàng Khác
              </button>
              {onGoToDecryption && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={onGoToDecryption}
                >
                  <span>🔓</span> Xem & Giải Mã Lô Này
                </button>
              )}
            </div>
          </div>
        )}

        {stage === 'conflict_409' && (
          <div style={{ padding: '10px 0' }}>
            <div className={styles.alertWarning} style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span> Lỗi 409: Trùng Lặp Mã Lô Hàng (Conflict)
              </strong>
              <p style={{ margin: '8px 0 0 0' }}>
                Mã lô hàng <strong>&ldquo;{batchId}&rdquo;</strong> đã tồn tại trong cơ sở dữ liệu của nhà cung cấp này. Quy chuẩn ScopeZero v1 không cho phép ghi đè tự động.
              </p>
              <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', color: '#34d399' }}>
                ✅ Toàn bộ dữ liệu bạn vừa nhập đã được giữ nguyên vẹn trên biểu mẫu. Bạn chỉ cần đổi mã lô hàng khác (VD: thêm hậu tố -v2 hoặc số lô mới) và bấm gửi lại.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onClose}
              >
                Đóng & Sửa Mã Lô Hàng
              </button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div style={{ padding: '10px 0' }}>
            <div className={styles.alertDanger} style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>❌</span> Thao Tác Thất Bại
              </strong>
              <p style={{ margin: '8px 0 0 0' }}>
                {errorMessage || 'Đã xảy ra lỗi không xác định trong quá trình xử lý hoặc kết nối.'}
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#c9d1d9', fontSize: '0.85rem' }}>
                Dữ liệu trên biểu mẫu của bạn đã được bảo toàn.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onClose}
              >
                Đóng
              </button>
              {onRetry && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={onRetry}
                >
                  Thử Lại
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
