// src/components/Supplier/SupplierSummaryPreview.tsx
import React from 'react';
import styles from './SupplierStyles.module.css';

export interface BatchInput {
  schemaVersion: 1;
  batchId: string;
  productName: string;
  quantity: number;
  electricityKwh: number;
  materialType: 'demo-material-A';
  materialKg: number;
  inboundTransportTonKm: number;
  wasteKg: number;
}

export interface PCFResult {
  totalKgCO2e: number;
  perProductKgCO2e: number;
  breakdown: {
    electricityKgCO2e: number;
    materialsKgCO2e: number;
    transportKgCO2e: number;
    wasteKgCO2e: number;
  };
  factorVersion: 'demo-factors-v1';
  calculationVersion: 'pcf-v1';
}

export interface SupplierSummaryPreviewProps {
  input: BatchInput;
  result: PCFResult;
  evidenceText?: string;
  onConfirmProceedToEncryption: () => void;
  onBackToEdit: () => void;
}

export const SupplierSummaryPreview: React.FC<SupplierSummaryPreviewProps> = ({
  input,
  result,
  evidenceText = '',
  onConfirmProceedToEncryption,
  onBackToEdit
}) => {
  // Tính toán số lượng suy đoán để hiển thị minh bạch cho nhà cung cấp
  const deducedQuantity = Math.round(result.totalKgCO2e / result.perProductKgCO2e);

  return (
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h2>
          <span>📊</span> Kết Quả Dấu Chân Carbon & Xem Trước Phân Định Dữ Liệu
        </h2>
        <div className={styles.badgeGroup}>
          <span className={styles.roleBadge}>Phiên bản: {result.calculationVersion}</span>
          <span className={styles.securityBadge}>Hệ số: {result.factorVersion}</span>
        </div>
      </div>

      {/* Hero Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ color: '#047857', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>Tổng Phát Thải Lô Hàng (Total)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065f46' }}>
            {result.totalKgCO2e.toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>kg CO2e</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Tính từ 4 nguồn phát thải phân bổ</div>
        </div>

        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ color: '#0369a1', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>Dấu Chân Carbon Mỗi Đơn Vị (PCF)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0c4a6e' }}>
            {result.perProductKgCO2e.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>kg CO2e / sản phẩm</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Chia đều cho {input.quantity.toLocaleString('vi-VN')} đơn vị sản phẩm</div>
        </div>
      </div>

      {/* CẢNH BÁO MINH BẠCH BẮT BUỘC (Mục 5 & Mục 11 trong docs/context.md) */}
      <div className={styles.alertWarning}>
        <strong>⚠️ Cảnh Báo Minh Bạch Khi Công Bố Dữ Liệu:</strong>
        <p style={{ margin: '8px 0 0 0' }}>
          Bản tóm tắt công khai (<strong>Public Summary</strong>) sẽ được hiển thị công khai cho tất cả Bên mua và khách vãng lai. Mặc dù số lượng sản phẩm nội bộ (<code>quantity</code>) không được công bố trực tiếp, việc công bố đồng thời <strong>Tổng phát thải</strong> ({result.totalKgCO2e} kg CO2e) và <strong>Phát thải trên mỗi sản phẩm</strong> ({result.perProductKgCO2e} kg CO2e) về mặt toán học sẽ cho phép bất kỳ ai tính ngược lại:
        </p>
        <div style={{ margin: '8px 0', padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', fontFamily: 'monospace', color: '#92400e' }}>
          Số lượng sản phẩm = {result.totalKgCO2e} / {result.perProductKgCO2e} = {deducedQuantity.toLocaleString('vi-VN')} sản phẩm
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>
          Hệ thống v1 chấp nhận việc công bố gián tiếp số lượng này để bảo toàn cả hai chỉ số phát thải. Bằng việc bấm tiếp tục, bạn xác nhận đã nắm rõ và đồng thuận với điều này.
        </p>
      </div>

      {/* Phân định ranh giới Public vs Private */}
      <div className={styles.splitGrid}>
        {/* Cột 1: Dữ liệu công khai (Public Summary) */}
        <div className={`${styles.columnCard} ${styles.columnPublic}`}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>
              <span>🌐</span> Bản Tóm Tắt Công Khai (Public)
            </span>
            <span className={styles.publicTag}>Ai cũng có thể xem</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#8b949e', margin: '0 0 16px 0' }}>
            Các trường này được lưu trữ bản rõ và cung cấp cho Bên mua để tích hợp báo cáo Scope 3:
          </p>

          <div className={styles.dataList}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Mã Lô Hàng (batchId):</span>
              <span className={styles.dataValue}>{input.batchId}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Tên Sản Phẩm (productName):</span>
              <span className={styles.dataValue}>{input.productName}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Tổng Phát Thải (totalKgCO2e):</span>
              <span className={styles.highlightValue}>{result.totalKgCO2e} kg CO2e</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Suất Phát Thải (perProductKgCO2e):</span>
              <span className={styles.highlightValue}>{result.perProductKgCO2e} kg CO2e</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Bộ Hệ Số (factorVersion):</span>
              <span className={styles.dataValue}>{result.factorVersion}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Phiên Bản Tính (calculationVersion):</span>
              <span className={styles.dataValue}>{result.calculationVersion}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Mức Đảm Bảo (assuranceLevel):</span>
              <span className={styles.dataValue}>supplier-reported</span>
            </div>
          </div>
        </div>

        {/* Cột 2: Dữ liệu mật được mã hóa (Private Payload) */}
        <div className={`${styles.columnCard} ${styles.columnPrivate}`}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>
              <span>🔒</span> Dữ Liệu Bảo Mật (Private Payload)
            </span>
            <span className={styles.privateTag}>Mã hóa E2EE TideCloak</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#8b949e', margin: '0 0 16px 0' }}>
            Tuyệt đối bảo mật, máy chủ và Bên mua không thể giải mã nếu không có quyền QEA:
          </p>

          <div className={styles.dataList}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Điện Năng Tiêu Thụ:</span>
              <span className={styles.dataValue}>{input.electricityKwh.toLocaleString('vi-VN')} kWh ({result.breakdown.electricityKgCO2e} kg CO2e)</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Khối Lượng Vật Liệu:</span>
              <span className={styles.dataValue}>{input.materialKg.toLocaleString('vi-VN')} kg ({result.breakdown.materialsKgCO2e} kg CO2e)</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Vận Tải Đầu Vào:</span>
              <span className={styles.dataValue}>{input.inboundTransportTonKm.toLocaleString('vi-VN')} tấn-km ({result.breakdown.transportKgCO2e} kg CO2e)</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Chất Thải & Hao Hụt:</span>
              <span className={styles.dataValue}>{input.wasteKg.toLocaleString('vi-VN')} kg ({result.breakdown.wasteKgCO2e} kg CO2e)</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Bằng Chứng / Chứng Từ (evidence):</span>
              <span className={styles.dataValue} style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {evidenceText.trim() ? evidenceText : 'Không đính kèm'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={onBackToEdit}
        >
          <span>⬅️</span> Quay Lại Chỉnh Sửa Biểu Mẫu
        </button>

        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onConfirmProceedToEncryption}
        >
          <span>🔐</span> Xác Nhận & Tiến Hành Mã Hóa E2EE
        </button>
      </div>
    </div>
  );
};
