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

const numberFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const unitFormat = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export const SupplierSummaryPreview: React.FC<SupplierSummaryPreviewProps> = ({
  input,
  result,
  evidenceText = '',
  onConfirmProceedToEncryption,
  onBackToEdit
}) => {
  // Tính toán số lượng suy đoán theo toán học để minh bạch
  const deducedQuantity = Math.round(result.totalKgCO2e / result.perProductKgCO2e);

  return (
    <div className={styles.contentGrid}>
      {/* Cột chính: Kết quả PCF & Phân định ranh giới */}
      <section className={styles.mainPanel} aria-labelledby="preview-panel-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="preview-panel-title" className={styles.panelTitle}>
              Kết quả tính toán PCF & Phân định dữ liệu
            </h2>
            <p className={styles.muted} style={{ marginTop: '2px' }}>
              Kiểm tra tính toán trước khi kích hoạt quy trình mã hóa bảo mật TideCloak E2EE.
            </p>
          </div>
          <div className={styles.headingActions}>
            <span className={styles.securityBadge}>
              Phương pháp: {result.calculationVersion}
            </span>
          </div>
        </div>

        {/* Hero Stats */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <span className={styles.statLabel}>Tổng phát thải lô hàng</span>
            <div className={styles.statValue}>
              {numberFormat.format(result.totalKgCO2e)}
              <span className={styles.statUnit}>kg CO₂e</span>
            </div>
            <span className={styles.statDesc}>
              Tính từ 4 nguồn phát thải phân bổ nội bộ
            </span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardBlue}`}>
            <span className={styles.statLabel}>Suất phát thải mỗi sản phẩm</span>
            <div className={styles.statValue}>
              {unitFormat.format(result.perProductKgCO2e)}
              <span className={styles.statUnit}>kg CO₂e / sp</span>
            </div>
            <span className={styles.statDesc}>
              Chia đều cho {numberFormat.format(input.quantity)} đơn vị sản phẩm
            </span>
          </div>
        </div>

        {/* Cảnh báo minh bạch theo Mục 5 & Mục 11 */}
        <div className={styles.alertWarning}>
          <strong>Lưu ý về tính suy đoán số lượng (Mục 5 & 11):</strong>
          <p style={{ margin: '6px 0 8px 0' }}>
            Bản tóm tắt công khai (<strong>Public Summary</strong>) sẽ được bên mua nhìn thấy. Việc công bố đồng thời <strong>Tổng phát thải</strong> ({numberFormat.format(result.totalKgCO2e)} kg CO₂e) và <strong>Suất phát thải</strong> ({unitFormat.format(result.perProductKgCO2e)} kg CO₂e/sp) về mặt toán học cho phép người nhận suy ngược lại:
          </p>
          <div style={{ padding: '6px 12px', background: '#fef3c7', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', color: '#92400e' }}>
            Số lượng = {numberFormat.format(result.totalKgCO2e)} ÷ {unitFormat.format(result.perProductKgCO2e)} ≈ {numberFormat.format(deducedQuantity)} sản phẩm
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
            Đặc tả ScopeZero v1 chấp nhận điều này để bảo toàn cả hai chỉ số phát thải cho bên mua.
          </p>
        </div>

        {/* Phân định 2 cột Public vs Private */}
        <div className={styles.splitGrid}>
          {/* Cột 1: Dữ liệu công khai (Public Summary) */}
          <div className={`${styles.columnCard} ${styles.columnPublic}`}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>
                <span>🌐</span> Bản tóm tắt công khai
              </span>
              <span className={styles.publicTag}>Bên mua xem được</span>
            </div>
            <p className={styles.columnNote}>
              Các trường này lưu trữ bản rõ trên hệ thống để chia sẻ cho Bên mua:
            </p>

            <dl className={styles.metadata}>
              <div>
                <dt>Mã lô hàng (batchId)</dt>
                <dd>{input.batchId}</dd>
              </div>
              <div>
                <dt>Tên sản phẩm (productName)</dt>
                <dd>{input.productName}</dd>
              </div>
              <div>
                <dt>Tổng phát thải (totalKgCO2e)</dt>
                <dd className={styles.highlightValue}>{numberFormat.format(result.totalKgCO2e)} kg CO₂e</dd>
              </div>
              <div>
                <dt>Suất phát thải (perProductKgCO2e)</dt>
                <dd className={styles.highlightValue}>{unitFormat.format(result.perProductKgCO2e)} kg CO₂e/sp</dd>
              </div>
              <div>
                <dt>Bộ hệ số (factorVersion)</dt>
                <dd>{result.factorVersion}</dd>
              </div>
              <div>
                <dt>Phiên bản tính (calculationVersion)</dt>
                <dd>{result.calculationVersion}</dd>
              </div>
              <div>
                <dt>Mức đảm bảo (assuranceLevel)</dt>
                <dd>supplier-reported</dd>
              </div>
            </dl>
          </div>

          {/* Cột 2: Dữ liệu mật (Private Payload) */}
          <div className={`${styles.columnCard} ${styles.columnPrivate}`}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>
                <span>🔒</span> Dữ liệu mật (Private Payload)
              </span>
              <span className={styles.privateTag}>Mã hóa E2EE TideCloak</span>
            </div>
            <p className={styles.columnNote}>
              Máy chủ backend và Bên mua hoàn toàn không thể giải mã nội dung này:
            </p>

            <dl className={styles.metadata}>
              <div>
                <dt>Điện năng tiêu thụ</dt>
                <dd>{numberFormat.format(input.electricityKwh)} kWh ({numberFormat.format(result.breakdown.electricityKgCO2e)} kg CO₂e)</dd>
              </div>
              <div>
                <dt>Khối lượng vật liệu</dt>
                <dd>{numberFormat.format(input.materialKg)} kg ({numberFormat.format(result.breakdown.materialsKgCO2e)} kg CO₂e)</dd>
              </div>
              <div>
                <dt>Vận tải đầu vào</dt>
                <dd>{numberFormat.format(input.inboundTransportTonKm)} tấn-km ({numberFormat.format(result.breakdown.transportKgCO2e)} kg CO₂e)</dd>
              </div>
              <div>
                <dt>Chất thải & hao hụt</dt>
                <dd>{numberFormat.format(input.wasteKg)} kg ({numberFormat.format(result.breakdown.wasteKgCO2e)} kg CO₂e)</dd>
              </div>
              <div>
                <dt>Chứng từ kèm theo</dt>
                <dd style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evidenceText.trim() ? evidenceText : 'Không có'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Thanh nút bấm hành động */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--rule)' }}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onBackToEdit}
          >
            ← Sửa lại biểu mẫu
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onConfirmProceedToEncryption}
          >
            Xác nhận & Tiến hành mã hóa E2EE →
          </button>
        </div>
      </section>

      {/* Cột phụ: Tóm tắt phạm vi & Quy trình mã hóa */}
      <aside className={styles.asidePanel} aria-labelledby="preview-aside-title">
        <h3 id="preview-aside-title" className={styles.asideTitle}>
          Quy chế công bố
        </h3>

        <div className={styles.asideCard}>
          <div className={styles.asideCardTitle}>
            <span>📋</span> Mức độ bảo đảm
          </div>
          <p className={styles.muted}>
            Hồ sơ sẽ mang nhãn <strong>&ldquo;supplier-reported&rdquo;</strong> (nhà cung cấp tự khai báo). Tuyệt đối không tự ý gán nhãn đã kiểm toán hay bảo đảm độc lập.
          </p>
        </div>

        <div className={styles.asideCard}>
          <div className={styles.asideCardTitle}>
            <span>🔐</span> Thẻ phân quyền TideCloak
          </div>
          <p className={styles.muted} style={{ fontSize: '12px' }}>
            Bản mã được niêm phong bằng thẻ nội bộ <code>_tide_supplier_internal</code>. Chỉ tài khoản sở hữu hoặc quy trình giải mã được cấp phép mới giải mã được.
          </p>
        </div>
      </aside>
    </div>
  );
};
