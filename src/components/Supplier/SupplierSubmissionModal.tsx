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
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalContent}>
        {/* Stepper Indicator */}
        <div className={styles.stepIndicator}>
          <div className={styles.stepItem}>
            <div className={getStepStatus(1)}>1</div>
            <span className={styles.stepLabel}>Chuẩn bị</span>
          </div>
          <div className={styles.stepItem}>
            <div className={getStepStatus(2)}>2</div>
            <span className={styles.stepLabel}>Mã hóa demo</span>
          </div>
          <div className={styles.stepItem}>
            <div className={getStepStatus(3)}>3</div>
            <span className={styles.stepLabel}>Gửi API</span>
          </div>
          <div className={styles.stepItem}>
            <div className={stage === 'success' ? styles.stepCircleCompleted : styles.stepCircle}>
              {stage === 'success' ? '✓' : '4'}
            </div>
            <span className={styles.stepLabel}>Xác nhận</span>
          </div>
        </div>

        {/* Content based on Stage */}
        {stage === 'preparing' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className={styles.spinner} style={{ marginBottom: '16px' }} />
            <h3 id="modal-title" style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600 }}>
              Đang chuẩn bị hồ sơ lô hàng...
            </h3>
            <p className={styles.muted}>
              Trích xuất dữ liệu công khai và tổng hợp Private Batch Payload theo đúng chuẩn hợp đồng.
            </p>
          </div>
        )}

        {stage === 'encrypting' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className={styles.spinner} style={{ marginBottom: '16px' }} />
            <h3 id="modal-title" style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: '#047857' }}>
              Đang mã hóa AES-GCM tại trình duyệt...
            </h3>
            <p className={styles.muted} style={{ marginBottom: '16px' }}>
              Dùng khóa demo công khai trong mã nguồn, chỉ dành cho dữ liệu thử nghiệm.
            </p>
            {encryptedPayload && (
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  Bản mã AES-GCM demo:
                </span>
                <div className={styles.codeBlock} style={{ maxHeight: '100px' }}>
                  {encryptedPayload.serialized.slice(0, 160)}...
                </div>
              </div>
            )}
          </div>
        )}

        {stage === 'submitting' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className={styles.spinner} style={{ marginBottom: '16px' }} />
            <h3 id="modal-title" style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: '#0369a1' }}>
              Đang gửi hồ sơ lên ScopeZero Backend...
            </h3>
            <p className={styles.muted}>
              POST /api/batches — Chỉ truyền tóm tắt công khai và bản mã hóa.
            </p>
          </div>
        )}

        {stage === 'success' && submissionResponse && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                ✓
              </div>
              <h3 id="modal-title" style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Nộp hồ sơ lô hàng thành công
              </h3>
              <p className={styles.muted}>
                Backend đã lưu hồ sơ. Dữ liệu nguồn được mã hóa bằng AES-GCM demo.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <dl className={styles.metadata}>
                <div>
                  <dt>Mã lô hàng (batchId)</dt>
                  <dd>{batchId}</dd>
                </div>
                <div>
                  <dt>Định danh máy chủ (UUID)</dt>
                  <dd style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0369a1' }}>
                    {submissionResponse.id}
                  </dd>
                </div>
                <div>
                  <dt>Thời gian tiếp nhận (UTC)</dt>
                  <dd>{new Date(submissionResponse.createdAt).toISOString()}</dd>
                </div>
              </dl>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onClose}
              >
                Khai báo lô khác
              </button>
              {onGoToDecryption && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={onGoToDecryption}
                >
                  Xem & Giải mã lô này →
                </button>
              )}
            </div>
          </div>
        )}

        {stage === 'conflict_409' && (
          <div style={{ padding: '8px 0' }}>
            <div className={styles.alertWarning} style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Lỗi 409: Trùng lặp mã lô hàng (Conflict)
              </strong>
              <p style={{ margin: '8px 0 0 0' }}>
                Mã lô hàng <strong>&ldquo;{batchId}&rdquo;</strong> đã tồn tại trong hệ thống. Quy chuẩn ScopeZero v1 không cho phép tự động ghi đè bản ghi cũ.
              </p>
              <p style={{ margin: '8px 0 0 0', fontWeight: 600, color: '#047857' }}>
                Toàn bộ dữ liệu bạn đã nhập được giữ nguyên trên biểu mẫu. Vui lòng đổi mã lô hàng khác (VD: thêm số đuôi hoặc hậu tố) rồi bấm gửi lại.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onClose}
              >
                Đóng & Đổi mã lô hàng
              </button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div style={{ padding: '8px 0' }}>
            <div className={styles.alertDanger} style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Thao tác gửi hồ sơ thất bại
              </strong>
              <p style={{ margin: '8px 0 0 0' }}>
                {errorMessage || 'Đã xảy ra sự cố trong quá trình mã hóa hoặc kết nối mạng máy chủ.'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                Dữ liệu trên biểu mẫu của bạn đã được bảo toàn nguyên vẹn.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                  Thử lại
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
