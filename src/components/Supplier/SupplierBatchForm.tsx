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
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h2>
          <span>📝</span> Biểu Mẫu Nhập Hồ Sơ Phát Thải Lô Hàng
        </h2>
        <div className={styles.actionsHeader}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onFillDemo}
            title="Tải nhanh dữ liệu mẫu chuẩn DEMO-001 theo đặc tả"
          >
            <span>⚡</span> Điền Mẫu DEMO-001
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={onReset}
          >
            <span>🔄</span> Xóa Trắng
          </button>
        </div>
      </div>

      <div className={styles.alertInfo}>
        <strong>Quy định bảo mật ScopeZero:</strong> Dữ liệu hoạt động chi tiết (điện, nguyên liệu, vận tải, chất thải và chứng từ) sẽ được <strong>mã hóa E2EE bằng TideCloak SDK</strong> trực tiếp trên trình duyệt của bạn trước khi truyền tải. Chỉ kết quả phát thải tổng hợp được công khai.
      </div>

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
              Mã Lô Hàng (Batch ID) *
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
              <span className={styles.errorText}>⚠️ {errors['batchId']}</span>
            )}
          </div>

          {/* productName */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="productName">
              Tên Sản Phẩm Linh Kiện *
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
              <span className={styles.errorText}>⚠️ {errors['productName']}</span>
            )}
          </div>

          {/* quantity */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="quantity">
              Số Lượng Sản Phẩm (Quantity) *
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
              <span className={styles.errorText}>⚠️ {errors['quantity']}</span>
            )}
          </div>

          {/* electricityKwh */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="electricityKwh">
              Điện Năng Phân Bổ (kWh) *
            </label>
            <input
              id="electricityKwh"
              type="number"
              min="0"
              max="1000000000"
              step="any"
              placeholder="VD: 1200 (hệ số demo: 0.5 kg CO2e/kWh)"
              className={`${styles.input} ${errors['electricityKwh'] ? styles.inputError : ''}`}
              value={values.electricityKwh}
              onChange={(e) => onChange('electricityKwh', e.target.value)}
              disabled={isSubmitting}
            />
            {errors['electricityKwh'] && (
              <span className={styles.errorText}>⚠️ {errors['electricityKwh']}</span>
            )}
          </div>

          {/* materialType */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="materialType">
              Loại Vật Liệu (Material Type) *
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
              <span className={styles.errorText}>⚠️ {errors['materialType']}</span>
            )}
          </div>

          {/* materialKg */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="materialKg">
              Khối Lượng Vật Liệu (kg) *
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
              <span className={styles.errorText}>⚠️ {errors['materialKg']}</span>
            )}
          </div>

          {/* inboundTransportTonKm */}
          <div className={styles.formGroup}>
            <div className={styles.label}>
              <label htmlFor="inboundTransportTonKm">
                Vận Tải Đầu Vào (Tấn-km) *
              </label>
              <button
                type="button"
                className={styles.labelOptional}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#06b6d4', textDecoration: 'underline' }}
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
              placeholder="VD: 800 (hệ số demo: 0.1 kg CO2e/tấn-km)"
              className={`${styles.input} ${errors['inboundTransportTonKm'] ? styles.inputError : ''}`}
              value={values.inboundTransportTonKm}
              onChange={(e) => onChange('inboundTransportTonKm', e.target.value)}
              disabled={isSubmitting}
            />
            {errors['inboundTransportTonKm'] && (
              <span className={styles.errorText}>⚠️ {errors['inboundTransportTonKm']}</span>
            )}

            {/* Helper calculation box */}
            {showHelper && (
              <div className={styles.helperBox}>
                <div className={styles.helperTitle}>
                  <span>🧮</span> Công cụ quy đổi: (Khối lượng kg / 1000) × Quãng đường km
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
                  <span>×</span>
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
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={handleApplyHelper}
                  >
                    Áp Dụng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* wasteKg */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="wasteKg">
              Chất Thải & Hao Hụt (kg) *
            </label>
            <input
              id="wasteKg"
              type="number"
              min="0"
              max="1000000000"
              step="any"
              placeholder="VD: 20 (hệ số demo: 0.5 kg CO2e/kg)"
              className={`${styles.input} ${errors['wasteKg'] ? styles.inputError : ''}`}
              value={values.wasteKg}
              onChange={(e) => onChange('wasteKg', e.target.value)}
              disabled={isSubmitting}
            />
            {errors['wasteKg'] && (
              <span className={styles.errorText}>⚠️ {errors['wasteKg']}</span>
            )}
          </div>

          {/* evidence */}
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label} htmlFor="evidence">
              <span>Ghi Chú Chứng Từ Xác Thực (Evidence Note)</span>
              <span className={styles.labelOptional}>Tùy chọn - Giả lập demo-text</span>
            </label>
            <textarea
              id="evidence"
              placeholder="VD: Số hóa đơn điện, mã phiếu cân vật liệu, ghi chú quy trình sản xuất nội bộ..."
              className={`${styles.textarea} ${errors['evidence'] ? styles.inputError : ''}`}
              value={values.evidence || ''}
              onChange={(e) => onChange('evidence', e.target.value)}
              disabled={isSubmitting}
            />
            {errors['evidence'] && (
              <span className={styles.errorText}>⚠️ {errors['evidence']}</span>
            )}
            <span style={{ fontSize: '0.78rem', color: '#8b949e', marginTop: '4px' }}>
              Nội dung chứng từ này sẽ nằm hoàn toàn trong private payload được mã hóa, không xuất hiện trên bản tóm tắt công khai.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isSubmitting}
          >
            <span>🔍</span> Kiểm Tra & Tính Toán Dấu Chân Carbon (PCF)
          </button>
        </div>
      </form>
    </div>
  );
};
