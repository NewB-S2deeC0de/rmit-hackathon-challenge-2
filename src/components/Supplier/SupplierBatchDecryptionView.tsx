// src/components/Supplier/SupplierBatchDecryptionView.tsx
import React, { useState } from 'react';
import styles from './SupplierStyles.module.css';
import {
  EncryptedPayload,
  PrivateBatchPayload,
  BatchCrypto
} from '../../types';
import { httpBatchApiClient } from '../../lib/batches/apiClient';

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

const numberFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC'
});

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

  const handleSelectBatch = (id: string) => {
    setSelectedBatchId(id);
    setDecryptedPayload(null);
    setErrorStatus(null);
  };

  const handleDecryptOwner = async () => {
    if (!currentBatch) return;
    setIsDecrypting(true);
    setErrorStatus(null);
    setDecryptedPayload(null);

    try {
      let payloadToDecrypt = currentBatch.encryptedInput;

      // Kiểm chứng kết nối backend: Thử tải bản mã từ GET /api/batches/:id/encrypted
      try {
        const remoteCipher = await httpBatchApiClient.getEncryptedBatch(currentBatch.id);
        if (remoteCipher && remoteCipher.serialized) {
          payloadToDecrypt = remoteCipher;
        }
      } catch {
        // Dùng bản mã hiện tại nếu offline / local
      }

      const payload = await cryptoAdapter.decryptBatch(payloadToDecrypt);
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
        `[Bảo mật TideCloak] Từ chối giải mã (${message}): Quyền truy cập bị từ chối do không có thẻ quyền _tide_supplier_internal hoặc vai trò hợp lệ.`
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  if (batches.length === 0) {
    return (
      <div className={styles.mainPanel} style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)', fontSize: '17px' }}>
          Chưa có lô hàng nào được nộp trong phiên
        </h3>
        <p className={styles.muted} style={{ maxWidth: '420px', margin: '0 auto 20px auto' }}>
          Sau khi gửi lô hàng, bạn có thể kiểm chứng bản mã E2EE và tính năng giải mã tại đây.
        </p>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onBackToForm}>
          + Khai báo lô hàng mới
        </button>
      </div>
    );
  }

  return (
    <div className={styles.contentGrid}>
      {/* Cột chính: Bảng danh sách lô hàng đã nộp */}
      <section className={styles.mainPanel} aria-labelledby="decryption-table-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="decryption-table-title" className={styles.panelTitle}>
              Danh sách lô hàng của nhà cung cấp ({batches.length})
            </h2>
            <p className={styles.muted} style={{ marginTop: '2px' }}>
              Chọn một lô hàng để kiểm chứng bản mã E2EE và chạy thử nghiệm giải mã trực tiếp.
            </p>
          </div>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onBackToForm}>
            + Khai báo thêm
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Lô hàng / Sản phẩm</th>
                <th scope="col" className={styles.numeric}>Tổng phát thải (kg CO₂e)</th>
                <th scope="col">Bản mã E2EE</th>
                <th scope="col">Thời gian (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const isSelected = selectedBatchId === batch.id;
                return (
                  <tr
                    key={batch.id}
                    className={isSelected ? styles.selectedRow : undefined}
                    onClick={() => handleSelectBatch(batch.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <button
                        type="button"
                        className={styles.batchButton}
                        onClick={() => handleSelectBatch(batch.id)}
                      >
                        {batch.batchId}
                        <span>{batch.productName}</span>
                      </button>
                    </td>
                    <td className={`${styles.numeric} ${styles.highlightValue}`}>
                      {numberFormat.format(batch.totalKgCO2e)}
                    </td>
                    <td>
                      <span className={styles.securityBadge} style={{ fontSize: '11px', padding: '2px 8px' }}>
                        _tide_supplier_internal
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '12.5px' }}>
                      {dateFormat.format(new Date(batch.createdAt))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Kết quả giải mã thành công hiển thị ở cột chính nếu có */}
        {decryptedPayload && (
          <div style={{ marginTop: '20px', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 600, marginBottom: '14px', fontSize: '14px' }}>
              <span>✓</span> GIẢI MÃ THÀNH CÔNG: Dữ liệu hoạt động gốc đã được khôi phục nguyên vẹn
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Điện năng</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.input.electricityKwh)} kWh
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.result.breakdown.electricityKgCO2e)} kg CO₂e
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Vật liệu ({decryptedPayload.input.materialType})</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.input.materialKg)} kg
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.result.breakdown.materialsKgCO2e)} kg CO₂e
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Vận tải đầu vào</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.input.inboundTransportTonKm)} tấn-km
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.result.breakdown.transportKgCO2e)} kg CO₂e
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Chất thải & hao hụt</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.input.wasteKg)} kg
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                  {numberFormat.format(decryptedPayload.result.breakdown.wasteKgCO2e)} kg CO₂e
                </div>
              </div>
            </div>

            {decryptedPayload.evidence && (
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600, marginBottom: '4px' }}>
                  Ghi chú chứng từ xác thực đã giải mã:
                </div>
                <div style={{ color: 'var(--text)', fontSize: '13px' }}>
                  {decryptedPayload.evidence.text}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Cột phụ: Kiểm chứng mật mã (Cryptographic Inspector) */}
      <aside className={styles.asidePanel} aria-labelledby="inspector-aside-title">
        <h3 id="inspector-aside-title" className={styles.asideTitle}>
          Kiểm chứng mật mã E2EE
        </h3>

        {currentBatch && (
          <>
            <div className={styles.asideCard}>
              <div className={styles.asideCardTitle}>
                Lô được chọn: {currentBatch.batchId}
              </div>
              <dl className={styles.metadata}>
                <div>
                  <dt>Sản phẩm</dt>
                  <dd>{currentBatch.productName}</dd>
                </div>
                <div>
                  <dt>UUID Bản ghi</dt>
                  <dd style={{ fontFamily: 'monospace', fontSize: '11.5px' }}>
                    {currentBatch.id.slice(0, 16)}...
                  </dd>
                </div>
                <div>
                  <dt>Thẻ niêm phong</dt>
                  <dd>_tide_supplier_internal</dd>
                </div>
              </dl>
            </div>

            <div className={styles.asideCard}>
              <div className={styles.asideCardTitle}>
                Bản mã thô lưu trên server
              </div>
              <p className={styles.muted} style={{ fontSize: '12px' }}>
                Cơ sở dữ liệu chỉ nhìn thấy chuỗi an toàn sau:
              </p>
              <div className={styles.codeBlock} style={{ maxHeight: '120px' }}>
                {currentBatch.encryptedInput.serialized}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleDecryptOwner}
                disabled={isDecrypting}
              >
                {isDecrypting ? 'Đang giải mã...' : 'Giải mã bằng khóa Supplier'}
              </button>

              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleSimulateUnauthorized}
                disabled={isDecrypting}
                title="Mô phỏng truy cập khi không có quyền hợp lệ"
              >
                Thử giải mã trái phép (Kiểm thử)
              </button>
            </div>

            {errorStatus && (
              <div
                className={errorStatus.includes('NGĂN CHẶN THÀNH CÔNG') ? styles.alertWarning : styles.alertDanger}
                style={{ marginTop: '8px' }}
              >
                {errorStatus}
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
};
