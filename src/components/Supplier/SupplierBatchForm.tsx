// src/components/Supplier/SupplierBatchForm.tsx
import React, { useState } from 'react';
import styles from './SupplierStyles.module.css';

export interface BatchFormValues {
  batchId: string;
  productName: string;
  quantity: string;
  electricityKwh: string;
  materialType: 'demo-material-A';
  materialKg: string;
  inboundTransportTonKm: string;
  wasteKg: string;
  evidence?: string;
}

export interface SupplierBatchFormProps {
  values: BatchFormValues;
  errors: Record<string, string>; // path -> error message
  isSubmitting?: boolean;
  onChange: (field: keyof BatchFormValues, value: string) => void;
  onFillDemo: () => void;
  onReset: () => void;
  onSubmitCalculate: () => void;
}

export const SupplierBatchForm: React.FC<SupplierBatchFormProps> = ({
  values,
  errors,
  isSubmitting = false,
  onChange,
  onFillDemo,
  onReset,
  onSubmitCalculate
}) => {
  // State công cụ hỗ trợ quy đổi tấn-km: (kg / 1000) * km
  const [showHelper, setShowHelper] = useState(false);
  const [helperKg, setHelperKg] = useState('');
  const [helperKm, setHelperKm] = useState('');

  const handleApplyHelper = () => {
    const kg = parseFloat(helperKg);
    const km = parseFloat(helperKm);
    if (!isNaN(kg) && !isNaN(km) && kg >= 0 && km >= 0) {
      const tonKm = (kg / 1000) * km;
      onChange('inboundTransportTonKm', tonKm.toString());
      setShowHelper(false);
    }
  };

  return (
    <div className={styles.contentGrid}>
      {/* Cột chính: Biểu mẫu nhập liệu */}
      <section className={styles.mainPanel} aria-labelledby="form-panel-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="form-panel-title" className={styles.panelTitle}>
              Thông tin hoạt động phát thải lô hàng
            </h2>
            <p className={styles.muted} style={{ marginTop: '2px' }}>
              Nhập các chỉ số tiêu thụ và thông tin định danh lô linh kiện để tính toán dấu chân carbon.
            </p>
          </div>
          <div className={styles.headingActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={onReset}
              disabled={isSubmitting}
            >
              Làm mới
            </button>
          </div>
        </div>

        <div className={styles.alertInfo} style={{ marginBottom: '20px' }}>
          <strong>Bảo mật E2EE:</strong> Dữ liệu hoạt động và chứng từ được mã hóa bằng TideCloak SDK tại trình duyệt trước khi gửi.
        </div>

        {errors['root'] && (
          <div className={styles.alertDanger} style={{ marginBottom: '20px' }}>
            {errors['root']}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitCalculate();
          }}
        >
          <div className={styles.formGrid}>
            {/* batchId */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="batchId">
                Mã lô hàng (Batch ID) *
              </label>
              <input
                id="batchId"
                type="text"
                placeholder="VD: DEMO-001 hoặc LOT-2026-X"
                className={`${styles.input} ${errors['batchId'] ? styles.inputError : ''}`}
                value={values.batchId}
                onChange={(e) => onChange('batchId', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['batchId'] && (
                <span className={styles.errorText}>{errors['batchId']}</span>
              )}
            </div>

            {/* productName */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="productName">
                Tên sản phẩm linh kiện *
              </label>
              <input
                id="productName"
                type="text"
                placeholder="VD: Demo fastener, Linh kiện điện tử A"
                className={`${styles.input} ${errors['productName'] ? styles.inputError : ''}`}
                value={values.productName}
                onChange={(e) => onChange('productName', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['productName'] && (
                <span className={styles.errorText}>{errors['productName']}</span>
              )}
            </div>

            {/* quantity */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="quantity">
                Số lượng sản phẩm trong lô *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="1000000000"
                step="1"
                placeholder="VD: 1000 (đơn vị sản phẩm)"
                className={`${styles.input} ${errors['quantity'] ? styles.inputError : ''}`}
                value={values.quantity}
                onChange={(e) => onChange('quantity', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['quantity'] && (
                <span className={styles.errorText}>{errors['quantity']}</span>
              )}
            </div>

            {/* electricityKwh */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="electricityKwh">
                Điện năng phân bổ (kWh) *
              </label>
              <input
                id="electricityKwh"
                type="number"
                min="0"
                max="1000000000"
                step="any"
                placeholder="VD: 1200 (hệ số: 0.5 kg CO2e/kWh)"
                className={`${styles.input} ${errors['electricityKwh'] ? styles.inputError : ''}`}
                value={values.electricityKwh}
                onChange={(e) => onChange('electricityKwh', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['electricityKwh'] && (
                <span className={styles.errorText}>{errors['electricityKwh']}</span>
              )}
            </div>

            {/* materialType */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="materialType">
                Loại vật liệu (Material Type) *
              </label>
              <select
                id="materialType"
                className={`${styles.select} ${errors['materialType'] ? styles.inputError : ''}`}
                value={values.materialType}
                onChange={(e) => onChange('materialType', e.target.value as 'demo-material-A')}
                disabled={isSubmitting}
              >
                <option value="demo-material-A">demo-material-A (Hệ số: 2.0 kg CO2e/kg)</option>
              </select>
              {errors['materialType'] && (
                <span className={styles.errorText}>{errors['materialType']}</span>
              )}
            </div>

            {/* materialKg */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="materialKg">
                Khối lượng vật liệu (kg) *
              </label>
              <input
                id="materialKg"
                type="number"
                min="0"
                max="1000000000"
                step="any"
                placeholder="VD: 500"
                className={`${styles.input} ${errors['materialKg'] ? styles.inputError : ''}`}
                value={values.materialKg}
                onChange={(e) => onChange('materialKg', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['materialKg'] && (
                <span className={styles.errorText}>{errors['materialKg']}</span>
              )}
            </div>

            {/* inboundTransportTonKm */}
            <div className={styles.formGroup}>
              <div className={styles.label}>
                <label htmlFor="inboundTransportTonKm">
                  Vận tải đầu vào (Tấn-km) *
                </label>
                <button
                  type="button"
                  className={styles.labelOptional}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', textDecoration: 'underline' }}
                  onClick={() => setShowHelper(!showHelper)}
                >
                  {showHelper ? 'Đóng công cụ' : 'Tính từ kg & km'}
                </button>
              </div>
              <input
                id="inboundTransportTonKm"
                type="number"
                min="0"
                max="1000000000"
                step="any"
                placeholder="VD: 800 (hệ số: 0.1 kg CO2e/tấn-km)"
                className={`${styles.input} ${errors['inboundTransportTonKm'] ? styles.inputError : ''}`}
                value={values.inboundTransportTonKm}
                onChange={(e) => onChange('inboundTransportTonKm', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['inboundTransportTonKm'] && (
                <span className={styles.errorText}>{errors['inboundTransportTonKm']}</span>
              )}

              {/* Helper calculation box */}
              {showHelper && (
                <div className={styles.helperBox}>
                  <div className={styles.helperTitle}>
                    Công cụ quy đổi: (Khối lượng kg / 1000) × Quãng đường km
                  </div>
                  <div className={styles.helperInputs}>
                    <input
                      type="number"
                      min="0"
                      placeholder="Khối lượng (kg)"
                      className={styles.helperInput}
                      value={helperKg}
                      onChange={(e) => setHelperKg(e.target.value)}
                    />
                    <span style={{ color: 'var(--muted)' }}>×</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Quãng đường (km)"
                      className={styles.helperInput}
                      value={helperKm}
                      onChange={(e) => setHelperKm(e.target.value)}
                    />
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      style={{ padding: '6px 12px', fontSize: '12px', minHeight: '32px' }}
                      onClick={handleApplyHelper}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* wasteKg */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="wasteKg">
                Chất thải & hao hụt (kg) *
              </label>
              <input
                id="wasteKg"
                type="number"
                min="0"
                max="1000000000"
                step="any"
                placeholder="VD: 20 (hệ số: 0.5 kg CO2e/kg)"
                className={`${styles.input} ${errors['wasteKg'] ? styles.inputError : ''}`}
                value={values.wasteKg}
                onChange={(e) => onChange('wasteKg', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['wasteKg'] && (
                <span className={styles.errorText}>{errors['wasteKg']}</span>
              )}
            </div>

            {/* evidence */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label} htmlFor="evidence">
                <span>Ghi chú chứng từ xác thực (Evidence Note)</span>
                <span className={styles.labelOptional}>Tùy chọn</span>
              </label>
              <textarea
                id="evidence"
                placeholder="VD: Số hóa đơn điện, mã phiếu cân vật liệu, biên bản giao nhận xưởng cơ khí..."
                className={`${styles.textarea} ${errors['evidence'] ? styles.inputError : ''}`}
                value={values.evidence || ''}
                onChange={(e) => onChange('evidence', e.target.value)}
                disabled={isSubmitting}
              />
              {errors['evidence'] && (
                <span className={styles.errorText}>{errors['evidence']}</span>
              )}
              <span className={styles.muted} style={{ fontSize: '12px', marginTop: '4px' }}>
                Chứng từ này sẽ được đưa vào Private Payload và mã hóa bằng TideCloak SDK.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--rule)' }}>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={isSubmitting}
            >
              Kiểm tra & Tính toán PCF →
            </button>
          </div>
        </form>
      </section>

      {/* Cột phụ: Bảng công cụ hỗ trợ & Tham chiếu quy chuẩn */}
      <aside className={styles.asidePanel} aria-labelledby="form-aside-title">
        <h3 id="form-aside-title" className={styles.asideTitle}>
          Hỗ trợ & Tham chiếu
        </h3>

        {/* Thao tác nhanh */}
        <div className={styles.asideCard}>
          <div className={styles.asideCardTitle}>
            Dữ liệu mẫu DEMO-001
          </div>
          <p className={styles.muted}>
            Nạp nhanh 8 trường dữ liệu kiểm thử chuẩn của ScopeZero để tính và mã hóa E2EE.
          </p>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onFillDemo}
            disabled={isSubmitting}
          >
            Điền mẫu DEMO-001
          </button>
        </div>

        {/* Bảng hệ số phát thải */}
        <div className={styles.asideCard}>
          <div className={styles.asideCardTitle}>
            Hệ số phát thải (demo-factors-v1)
          </div>
          <dl className={styles.metadata}>
            <div>
              <dt>Điện năng</dt>
              <dd>0.5 kg CO₂e / kWh</dd>
            </div>
            <div>
              <dt>Vật liệu demo-A</dt>
              <dd>2.0 kg CO₂e / kg</dd>
            </div>
            <div>
              <dt>Vận tải đường bộ</dt>
              <dd>0.1 kg CO₂e / tấn-km</dd>
            </div>
            <div>
              <dt>Chất thải rắn</dt>
              <dd>0.5 kg CO₂e / kg</dd>
            </div>
          </dl>
        </div>

        {/* Cam kết bảo mật */}
        <div className={styles.asideCard}>
          <div className={styles.asideCardTitle}>
            Bảo vệ bí mật kinh doanh
          </div>
          <p className={styles.muted} style={{ lineHeight: '1.5' }}>
            Toàn bộ công thức tính toán và mã hóa được thực hiện tại client. Bên mua chỉ nhận được tổng phát thải và suất phát thải.
          </p>
        </div>
      </aside>
    </div>
  );
};
