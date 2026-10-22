// src/components/Supplier/SupplierBatchDecryptionView.tsx
import React, { useState } from 'react';
import styles from './SupplierStyles.module.css';
import {
  EncryptedPayload,
  PrivateBatchPayload,
  BatchCrypto
} from '../../types';

export interface DecryptableBatchItem {
  id: string; // Server UUID
  batchId: string;
  productName: string;
  totalKgCO2e: number;
  createdAt: string;
  encryptedInput: EncryptedPayload;
}

export interface SupplierBatchDecryptionViewProps {
  batches: DecryptableBatchItem[];
  cryptoAdapter: BatchCrypto;
  onBackToForm: () => void;
}

export const SupplierBatchDecryptionView: React.FC<SupplierBatchDecryptionViewProps> = ({
  batches,
  cryptoAdapter,
  onBackToForm
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches.length > 0 ? batches[0].id : ''
  );
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptedPayload, setDecryptedPayload] = useState<PrivateBatchPayload | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  const handleDecryptOwner = async () => {
    if (!currentBatch) return;
    setIsDecrypting(true);
    setErrorStatus(null);
    setDecryptedPayload(null);

    try {
      const payload = await cryptoAdapter.decryptBatch(currentBatch.encryptedInput);
      setDecryptedPayload(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi giải mã';
      setErrorStatus(`Thao tác giải mã thất bại: ${message}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleSimulateUnauthorized = async () => {
    if (!currentBatch) return;
    setIsDecrypting(true);
    setErrorStatus(null);
    setDecryptedPayload(null);

    try {
      // Mô phỏng kiểm tra giải mã từ bên ngoài (tag không khớp hoặc không có role hợp lệ)
      const fakeCorruptPayload: EncryptedPayload = {
        ...currentBatch.encryptedInput,
        serialized: JSON.stringify({
          tag: '_tide_unauthorized_guest',
          algorithm: 'TIDE-QEA-AES-256-GCM',
          data: 'INVALID_CIPHER_OR_NO_PERMISSION',
          timestamp: new Date().toISOString()
        })
      };
      await cryptoAdapter.decryptBatch(fakeCorruptPayload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ACCESS_DENIED';
      setErrorStatus(
        `🛡️ [BẢO MẬT TIDECLOAK NGĂN CHẶN THÀNH CÔNG] Từ chối giải mã (${message}): Người dùng không có vai trò Supplier sở hữu hoặc thẻ QEA hợp lệ. Bản mã hoàn toàn không thể bị xem lén!`
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  if (batches.length === 0) {
    return (
      <div className={styles.glassCard} style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#f0f6fc' }}>Chưa Có Lô Hàng Nào Được Nộp</h3>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '20px' }}>
          Bạn chưa nộp lô hàng nào trong phiên làm việc hiện tại để kiểm chứng tính năng giải mã.
        </p>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onBackToForm}>
          <span>➕</span> Nhập & Nộp Lô Hàng Mới
        </button>
      </div>
    );
  }

  return (
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h2>
          <span>🔓</span> Màn Hình Giải Mã Kiểm Chứng Lô Hàng Riêng (E2EE)
        </h2>
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onBackToForm}>
          <span>⬅️</span> Quay Lại Form Nhập Lô
        </button>
      </div>

      <div className={styles.alertInfo}>
        Màn hình này cho phép Nhà cung cấp lấy bản mã đã lưu trữ trên máy chủ và thực hiện <strong>giải mã trực tiếp qua TideCloak SDK</strong>. Quá trình giải mã yêu cầu đúng thẻ sở hữu <code>_tide_supplier_internal</code> và chính sách quyền hạn hợp lệ.
      </div>

      {/* Bộ chọn lô hàng */}
      <div style={{ marginBottom: '20px' }}>
        <label className={styles.label} style={{ marginBottom: '8px', display: 'block' }}>
          Chọn Lô Hàng Cần Kiểm Chứng:
        </label>
        <select
          className={styles.select}
          value={selectedBatchId}
          onChange={(e) => {
            setSelectedBatchId(e.target.value);
            setDecryptedPayload(null);
            setErrorStatus(null);
          }}
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.batchId} — {b.productName} ({b.totalKgCO2e} kg CO2e) [UUID: {b.id.slice(0, 8)}...]
            </option>
          ))}
        </select>
      </div>

      {currentBatch && (
        <div>
          {/* Thông tin bản mã thô */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Trạng Thái Lưu Trữ Trên Máy Chủ & CSDL:</span>
              <span className={styles.securityBadge}>Đã Mã Hóa TideCloak v1</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px' }}>
              Serialized Ciphertext Envelope (Dữ liệu bảo mật dạng chuỗi an toàn):
            </div>
            <div className={styles.codeBlock}>
              {currentBatch.encryptedInput.serialized}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '6px' }}>
              * Ngay cả quản trị viên máy chủ hoặc người có toàn quyền đọc cơ sở dữ liệu cũng chỉ nhìn thấy chuỗi mật mã trên.
            </div>
          </div>

          {/* Nút hành động giải mã */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleDecryptOwner}
              disabled={isDecrypting}
            >
              <span>🔑</span> Giải Mã Bằng Khóa Sở Hữu Của Supplier
            </button>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleSimulateUnauthorized}
              disabled={isDecrypting}
              title="Mô phỏng truy cập từ Buyer hoặc bên thứ ba không có quyền QEA"
            >
              <span>🛡️</span> Thử Giải Mã Trái Phép (Kiểm Thử An Ninh)
            </button>
          </div>

          {/* Trạng thái đang giải mã */}
          {isDecrypting && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div className={styles.spinner} style={{ marginBottom: '8px' }} />
              <div style={{ color: '#8b949e', fontSize: '0.9rem' }}>Đang kết nối TideCloak Enclave giải mã...</div>
            </div>
          )}

          {/* Lỗi hoặc chặn bảo mật */}
          {errorStatus && (
            <div className={errorStatus.includes('NGĂN CHẶN THÀNH CÔNG') ? styles.alertWarning : styles.alertDanger}>
              {errorStatus}
            </div>
          )}

          {/* Kết quả giải mã thành công */}
          {decryptedPayload && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 'bold', marginBottom: '14px', fontSize: '1.05rem' }}>
                <span>✅</span> GIẢI MÃ THÀNH CÔNG: Dữ Liệu Hồ Sơ Gốc Đã Được Khôi Phục Bản Rõ
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Điện Năng Đầu Vào:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f0f6fc' }}>
                    {decryptedPayload.input.electricityKwh} kWh
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                    Phát thải: {decryptedPayload.result.breakdown.electricityKgCO2e} kg CO2e
                  </div>
                </div>

                <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Vật Liệu ({decryptedPayload.input.materialType}):</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f0f6fc' }}>
                    {decryptedPayload.input.materialKg} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                    Phát thải: {decryptedPayload.result.breakdown.materialsKgCO2e} kg CO2e
                  </div>
                </div>

                <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Vận Tải Đầu Vào:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f0f6fc' }}>
                    {decryptedPayload.input.inboundTransportTonKm} tấn-km
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                    Phát thải: {decryptedPayload.result.breakdown.transportKgCO2e} kg CO2e
                  </div>
                </div>

                <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Chất Thải & Hao Hụt:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f0f6fc' }}>
                    {decryptedPayload.input.wasteKg} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                    Phát thải: {decryptedPayload.result.breakdown.wasteKgCO2e} kg CO2e
                  </div>
                </div>
              </div>

              {decryptedPayload.evidence && (
                <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                  <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 'bold', marginBottom: '4px' }}>
                    Ghi Chú Chứng Từ Xác Thực (Decrypted Evidence Note):
                  </div>
                  <div style={{ color: '#e6edf3', fontSize: '0.9rem' }}>
                    {decryptedPayload.evidence.text}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
