// src/app/supplier/page.tsx
'use client';

import React, { useState } from 'react';
import styles from '../../components/Supplier/SupplierStyles.module.css';
import {
  SupplierBatchForm,
  BatchFormValues
} from '../../components/Supplier/SupplierBatchForm';
import {
  SupplierSummaryPreview,
  BatchInput,
  PCFResult
} from '../../components/Supplier/SupplierSummaryPreview';
import {
  SupplierSubmissionModal,
  SubmissionStage
} from '../../components/Supplier/SupplierSubmissionModal';
import {
  SupplierBatchDecryptionView,
  DecryptableBatchItem
} from '../../components/Supplier/SupplierBatchDecryptionView';
import {
  preparePrivatePayload,
  preparePublicSummary
} from '../../components/Supplier/SupplierCryptoService';

// Import các engine logic PCF và adapter mock từ src/lib và src/mocks
import { parseBatchForm } from '../../lib/pcf/validate';
import { calculatePCF } from '../../lib/pcf/calculate';
import { mockBatchCrypto, mockBatchApi, mockSupplierFormPresets } from '../../mocks/fixtures';
import { EncryptedPayload, CreateBatchResponse } from '../../types';

// Sử dụng các adapter đã chuẩn hóa
const defaultCryptoAdapter = mockBatchCrypto;
const defaultBatchApi = mockBatchApi;

const initialEmptyValues: BatchFormValues = {
  batchId: '',
  productName: '',
  quantity: '',
  electricityKwh: '',
  materialType: 'demo-material-A',
  materialKg: '',
  inboundTransportTonKm: '',
  wasteKg: '',
  evidence: ''
};

export default function SupplierPage() {
  // Trạng thái điều hướng giao diện: 'form' | 'preview' | 'decryption'
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'decryption'>('form');

  // Trạng thái biểu mẫu
  const [formValues, setFormValues] = useState<BatchFormValues>(initialEmptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Kết quả tính toán PCF sau validate
  const [validatedInput, setValidatedInput] = useState<BatchInput | null>(null);
  const [pcfResult, setPcfResult] = useState<PCFResult | null>(null);

  // Trạng thái quy trình nộp & mã hóa
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPayload | null>(null);
  const [submissionResponse, setSubmissionResponse] = useState<CreateBatchResponse | null>(null);

  // Danh sách các lô hàng đã nộp trong phiên làm việc để kiểm chứng giải mã
  const [submittedBatches, setSubmittedBatches] = useState<DecryptableBatchItem[]>([]);

  // 1. Thay đổi giá trị trường nhập liệu
  const handleFieldChange = (field: keyof BatchFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
    // Xóa lỗi của trường tương ứng khi người dùng nhập lại
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // 2. Điền dữ liệu mẫu chuẩn DEMO-001
  const handleFillDemo = () => {
    setFormValues({
      ...mockSupplierFormPresets.standardFastener,
      evidence: 'Hóa đơn tiền điện tháng 9/2026 và phiếu cân nguyên vật liệu xưởng cơ khí A'
    });
    setErrors({});
  };

  // 3. Xóa trắng form
  const handleResetForm = () => {
    setFormValues(initialEmptyValues);
    setErrors({});
    setValidatedInput(null);
    setPcfResult(null);
  };

  // 4. Kiểm tra dữ liệu & Tính toán PCF
  const handleSubmitCalculate = () => {
    const parseResult = parseBatchForm(formValues);

    if (!parseResult.ok) {
      // Ánh xạ lỗi trả về theo đúng path để hiển thị tại từng ô nhập
      const fieldErrorsMap: Record<string, string> = {};
      parseResult.errors.forEach((err) => {
        fieldErrorsMap[err.path] = err.message;
      });
      setErrors(fieldErrorsMap);
      return;
    }

    try {
      const input = parseResult.value;
      const result = calculatePCF(input);
      setValidatedInput(input);
      setPcfResult(result);
      setErrors({});
      setActiveTab('preview');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi tính toán PCF';
      setErrors({ root: message });
    }
  };

  // 5. Xác nhận nộp & Kích hoạt luồng mã hóa TideCloak
  const handleConfirmAndSubmit = async () => {
    if (!validatedInput || !pcfResult) return;

    setSubmissionStage('preparing');
    setErrorMessage(null);
    setEncryptedPayload(null);
    setSubmissionResponse(null);

    try {
      // Bước A: Chuẩn bị Private Payload & Public Summary
      const privatePayload = preparePrivatePayload(
        validatedInput,
        pcfResult,
        formValues.evidence
      );
      const publicSummary = preparePublicSummary(validatedInput, pcfResult);

      // Bước B: Mã hóa bằng TideCloak SDK (Bắt buộc JSON.stringify theo Lưu ý 1)
      setSubmissionStage('encrypting');
      await new Promise((r) => setTimeout(r, 600)); // Hiệu ứng trực quan chuyển bước

      const encrypted = await defaultCryptoAdapter.encryptBatch(privatePayload);
      setEncryptedPayload(encrypted);

      // Bước C: Nộp lên API
      setSubmissionStage('submitting');
      await new Promise((r) => setTimeout(r, 600));

      const response = await defaultBatchApi.submitBatch({
        schemaVersion: 1,
        publicSummary,
        encryptedInput: encrypted
      });

      // Bước D: Thành công
      setSubmissionResponse(response);
      setSubmissionStage('success');

      // Lưu vào danh sách lô hàng phục vụ kiểm chứng giải mã
      const newBatchItem: DecryptableBatchItem = {
        id: response.id,
        batchId: validatedInput.batchId,
        productName: validatedInput.productName,
        totalKgCO2e: pcfResult.totalKgCO2e,
        createdAt: response.createdAt,
        encryptedInput: encrypted
      };
      setSubmittedBatches((prev) => [newBatchItem, ...prev]);
    } catch (err: unknown) {
      // XỬ LÝ LỖI ĐẶC BIỆT: HTTP 409 CONFLICT (Trùng mã lô)
      // Giữ nguyên 100% dữ liệu biểu mẫu để người dùng không bị mất công nhập
      const isConflict =
        err && typeof err === 'object' && ('status' in err && (err as { status: number }).status === 409);

      if (isConflict) {
        setSubmissionStage('conflict_409');
      } else {
        const msg = err instanceof Error ? err.message : 'Lỗi trong quá trình gửi';
        setErrorMessage(msg);
        setSubmissionStage('error');
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Header & Identity */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>
            <span>🌱</span> ScopeZero — Cổng Nhà Cung Cấp (Supplier Portal)
          </h1>
          <p>
            Khai báo dấu chân carbon sản phẩm Scope 3 & Bảo vệ bí mật kinh doanh bằng TideCloak E2EE
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div className={styles.badgeGroup}>
            <a href="/" style={{ color: '#334155', textDecoration: 'none', padding: '5px 12px', fontSize: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 500 }}>
              🏠 Trang Chủ
            </a>
            <a href="/buyer" style={{ color: '#0369a1', textDecoration: 'none', padding: '5px 12px', fontSize: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', fontWeight: 500 }}>
              🛒 Sang Cổng Bên Mua ➔
            </a>
          </div>
          <div className={styles.badgeGroup}>
            <span className={styles.roleBadge}>
              <span>🏢</span> Role: supplier (Company A)
            </span>
            <span className={styles.securityBadge}>
              <span>🛡️</span> TideCloak E2EE Active
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'form' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <span>📝</span> 1. Khai Báo Lô Hàng
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.tabBtnActive : ''}`}
          onClick={() => {
            if (validatedInput && pcfResult) {
              setActiveTab('preview');
            } else {
              handleSubmitCalculate();
            }
          }}
        >
          <span>📊</span> 2. Xem Trước PCF & Phân Định Dữ Liệu
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'decryption' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('decryption')}
        >
          <span>🔓</span> 3. Giải Mã Lô Của Tôi ({submittedBatches.length})
        </button>
      </nav>

      {/* Main Tab Panels */}
      <main>
        {activeTab === 'form' && (
          <SupplierBatchForm
            values={formValues}
            errors={errors}
            onChange={handleFieldChange}
            onFillDemo={handleFillDemo}
            onReset={handleResetForm}
            onSubmitCalculate={handleSubmitCalculate}
          />
        )}

        {activeTab === 'preview' && validatedInput && pcfResult && (
          <SupplierSummaryPreview
            input={validatedInput}
            result={pcfResult}
            evidenceText={formValues.evidence}
            onBackToEdit={() => setActiveTab('form')}
            onConfirmProceedToEncryption={handleConfirmAndSubmit}
          />
        )}

        {activeTab === 'decryption' && (
          <SupplierBatchDecryptionView
            batches={submittedBatches}
            cryptoAdapter={defaultCryptoAdapter}
            onBackToForm={() => setActiveTab('form')}
          />
        )}
      </main>

      {/* Modal Tiến Trình Mã Hóa & Nộp Hồ Sơ */}
      <SupplierSubmissionModal
        stage={submissionStage}
        errorMessage={errorMessage}
        batchId={formValues.batchId}
        encryptedPayload={encryptedPayload}
        submissionResponse={submissionResponse}
        onClose={() => {
          if (submissionStage === 'success') {
            // Sau khi nộp thành công, làm mới form cho lô tiếp theo
            handleResetForm();
            setActiveTab('form');
          } else if (submissionStage === 'conflict_409') {
            // Nếu trùng mã lô, quay lại form và giữ nguyên dữ liệu
            setActiveTab('form');
          }
          setSubmissionStage('idle');
        }}
        onGoToDecryption={() => {
          setSubmissionStage('idle');
          setActiveTab('decryption');
        }}
        onRetry={handleConfirmAndSubmit}
      />
    </div>
  );
}
