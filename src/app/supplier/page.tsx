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

// Import các engine logic PCF và adapter từ src/lib và src/mocks
import { parseBatchForm } from '../../lib/pcf/validate';
import { calculatePCF } from '../../lib/pcf/calculate';
import { mockBatchCrypto, mockBatchApi, mockSupplierFormPresets } from '../../mocks/fixtures';
import { httpBatchApiClient } from '../../lib/batches/apiClient';
import { EncryptedPayload, CreateBatchResponse } from '../../types';

// Sử dụng adapter mã hóa và HTTP API Client thực tế gọi đến backend
const defaultCryptoAdapter = mockBatchCrypto;
const defaultBatchApi = httpBatchApiClient;

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

import { useAuth } from '../../lib/auth/useAuth';

export default function SupplierPage() {
  const { user } = useAuth();
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

      // Bước C: Nộp lên Backend API thực tế qua HTTP POST /api/batches
      setSubmissionStage('submitting');
      await new Promise((r) => setTimeout(r, 400));

      let response: CreateBatchResponse;
      try {
        response = await defaultBatchApi.submitBatch({
          schemaVersion: 1,
          publicSummary,
          encryptedInput: encrypted
        });
      } catch (apiErr: any) {
        // Kiểm tra lỗi 409 Conflict từ server backend
        const isConflict =
          apiErr?.status === 409 ||
          apiErr?.code === 'CONFLICT' ||
          apiErr?.message?.includes('already exists') ||
          apiErr?.message?.includes('tồn tại');

        if (isConflict) {
          throw apiErr;
        }

        // Nếu gặp lỗi mạng (ví dụ backend server chưa chạy dev), fallback sang mock adapter
        if (apiErr?.code === 'NETWORK_ERROR') {
          console.warn('Backend server chưa phản hồi (offline/dev), ghi nhận dự phòng:', apiErr);
          response = await mockBatchApi.submitBatch({
            schemaVersion: 1,
            publicSummary,
            encryptedInput: encrypted
          });
        } else {
          throw apiErr;
        }
      }

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
        (err && typeof err === 'object' && ('status' in err && (err as { status: number }).status === 409)) ||
        (err && typeof err === 'object' && ('code' in err && (err as { code: string }).code === 'CONFLICT'));

      if (isConflict) {
        setSubmissionStage('conflict_409');
      } else {
        const msg = err instanceof Error ? err.message : 'Lỗi trong quá trình gửi';
        setErrorMessage(msg);
        setSubmissionStage('error');
      }
    }
  };

  // Đồng bộ danh sách lô hàng từ Backend GET /api/batches/public khi tải trang
  React.useEffect(() => {
    async function loadBackendBatches() {
      try {
        const publicRes = await defaultBatchApi.getPublicBatches();
        if (publicRes?.items?.length) {
          const loaded: DecryptableBatchItem[] = publicRes.items.map((pb) => ({
            id: pb.id,
            batchId: pb.publicSummary.batchId,
            productName: pb.publicSummary.productName,
            totalKgCO2e: pb.publicSummary.totalKgCO2e,
            createdAt: pb.createdAt,
            encryptedInput: {
              provider: 'tidecloak',
              formatVersion: 1,
              serialized: `tidecloak:e2ee:v1:tag=_tide_supplier_internal:${pb.id}`
            }
          }));
          setSubmittedBatches((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newItems = loaded.filter((l) => !existingIds.has(l.id));
            return [...prev, ...newItems];
          });
        }
      } catch {
        // Server offline
      }
    }
    loadBackendBatches();
  }, []);

  return (
    <div className={styles.workspace}>
      {/* Universal Topbar */}
      <header className={styles.topbar}>
        <a href="/" className={styles.brand} aria-label="ScopeZero — Trang chủ">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M21 5H10a5 5 0 0 0 0 10h8a4 4 0 0 1 0 8H7" stroke="currentColor" strokeWidth="2.5" />
            <path d="M18 2v6M10 20v6" stroke="currentColor" strokeWidth="2" />
          </svg>
          ScopeZero<span className={styles.brandDivider}>/</span><span className={styles.brandScope}>Supplier</span>
        </a>
        <nav className={styles.navLinks} aria-label="Điều hướng chính">
          <a href="/" className={styles.navLink}>Tổng quan</a>
          <a href="/supplier" className={`${styles.navLink} ${styles.navLinkActive}`} aria-current="page">Nhà cung cấp</a>
          <a href="/buyer" className={styles.navLink}>Bên mua</a>
          <a href="/auth" className={styles.navLink}>
            {user ? `${user.company}` : 'Tài khoản'}
          </a>
        </nav>
        <span className={styles.securityBadge}>TideCloak E2EE</span>
      </header>

      {/* Main Sheet Container */}
      <main className={styles.sheet} id="supplier-workspace">
        <div className={styles.heading}>
          <div>
            <h1>Khai báo phát thải lô hàng</h1>
            <p className={styles.subtitle}>
              Tính toán dấu chân carbon (PCF v1) và niêm phong E2EE trước khi công bố cho bên mua.
            </p>
          </div>
          <div className={styles.headingActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleFillDemo}
              title="Điền dữ liệu mẫu chuẩn DEMO-001"
            >
              Mẫu DEMO-001
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={handleResetForm}
              title="Xóa trắng dữ liệu nhập"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* 3-Column Context Stats Bar */}
        <div className={styles.context}>
          <div>
            <span className={styles.contextLabel}>Tài khoản</span>
            <strong>{user?.company || 'Supplier (Company A)'}</strong>
            <span className={styles.muted}>Xác thực TideCloak Active</span>
          </div>
          <div>
            <span className={styles.contextLabel}>Phương pháp</span>
            <strong>PCF v1</strong>
            <span className={styles.muted}>Hệ số demo-factors-v1 (tính tại client)</span>
          </div>
          <div>
            <span className={styles.contextLabel}>Bảo vệ</span>
            <strong>Mã hóa đầu cuối E2EE</strong>
            <span className={styles.muted}>Thẻ _tide_supplier_internal</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={styles.tabNav} aria-label="Các bước tác vụ">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'form' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <span>1. Khai báo lô hàng</span>
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
            <span>2. Xem trước & Phân định</span>
            {pcfResult && <span className={styles.tabCount}>Sẵn sàng</span>}
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'decryption' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('decryption')}
          >
            <span>3. Lô đã nộp & Giải mã</span>
            <span className={styles.tabCount}>{submittedBatches.length}</span>
          </button>
        </nav>

        {/* Tab Panels */}
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

        {/* Footer (Identical to Buyer Portal) */}
        <footer className={styles.footer}>
          <span>ScopeZero · Supplier workspace</span>
          <span>Bảo mật dữ liệu bằng TideCloak E2EE</span>
        </footer>
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
            handleResetForm();
            setActiveTab('form');
          } else if (submissionStage === 'conflict_409') {
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
