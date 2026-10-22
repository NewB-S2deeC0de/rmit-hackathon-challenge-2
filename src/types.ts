/**
 * @file src/types.ts
 * @description Hợp đồng kiểu dữ liệu dùng chung (Single Source of Truth) — Unified Contract v1.
 * Theo đặc tả ngày 22/10/2026. Đây là nơi khai báo duy nhất; không duy trì bản sao ở src/contracts/*.
 */

// ==========================================
// 1. Phân loại cố định (v1 MVP)
// ==========================================

/** v1 MVP chỉ hỗ trợ một loại vật liệu minh họa */
export type MaterialType = "demo-material-A";

/** Mức độ đảm bảo: Supplier tự khai báo, chưa qua kiểm toán độc lập */
export type AssuranceLevel = "supplier-reported";

/** Vai trò ứng dụng — dùng trong AuthSession phía UI, không dùng làm kiểm quyền server */
export type AppRole = "supplier" | "buyer";

// ==========================================
// 2. Dữ liệu Form Supplier (giữ chuỗi để xử lý ô trống)
// ==========================================

export interface BatchFormValues {
  batchId: string;
  productName: string;
  quantity: string;
  electricityKwh: string;
  materialType: MaterialType;
  materialKg: string;
  inboundTransportTonKm: string;
  wasteKg: string;
}

// ==========================================
// 3. Đầu vào tính toán đã qua kiểm tra
// ==========================================

export interface BatchInput {
  schemaVersion: 1;
  batchId: string;
  productName: string;
  quantity: number;              // số nguyên, 1 – 1.000.000.000
  electricityKwh: number;        // hữu hạn, 0 – 1.000.000.000
  materialType: MaterialType;
  materialKg: number;            // hữu hạn, 0 – 1.000.000.000
  inboundTransportTonKm: number; // hữu hạn, 0 – 1.000.000.000 (1 tấn = 1.000 kg)
  wasteKg: number;               // hữu hạn, 0 – 1.000.000.000
}

// ==========================================
// 4. Kết quả tính toán PCF
// ==========================================

export interface PCFResult {
  totalKgCO2e: number;
  perProductKgCO2e: number;
  breakdown: {
    electricityKgCO2e: number;
    materialsKgCO2e: number;
    transportKgCO2e: number;
    wasteKgCO2e: number;
  };
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
}

// ==========================================
// 5. Bằng chứng (mã hóa cùng input, không tham gia phép tính)
// ==========================================

/** v1: chỉ hỗ trợ ghi chú văn bản demo; không phải hóa đơn PKI hay upload file */
export interface EvidenceInput {
  kind: "demo-text";
  text: string; // 1–10.000 ký tự sau trim
}

// ==========================================
// 6. Payload riêng tư — mã hóa E2EE bởi TideCloak trước khi gửi backend
// ==========================================

export interface PrivateBatchPayload {
  schemaVersion: 1;
  input: BatchInput;
  result: PCFResult;
  evidence: EvidenceInput | null;
}

// ==========================================
// 7. Kết quả Validation
// ==========================================

export type ValidationErrorCode =
  | "REQUIRED"
  | "INVALID_NUMBER"
  | "OUT_OF_RANGE"
  | "UNSUPPORTED_VALUE"
  | "INVALID_FORMAT";

export interface FieldError {
  path: string;    // ví dụ: "batchId", "quantity", "materialKg"
  code: ValidationErrorCode;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T; errors?: never }
  | { ok: false; errors: FieldError[]; value?: never };

// ==========================================
// 8. Phần công bố cho Buyer
// ==========================================

/** Dữ liệu công bố minh bạch — Buyer xem không cần đăng nhập (v1: public) */
export interface PublicSummary {
  batchId: string;
  productName: string;
  totalKgCO2e: number;
  perProductKgCO2e: number;
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
  assuranceLevel: AssuranceLevel; // luôn là "supplier-reported" trong v1
}

// ==========================================
// 9. Bản mã TideCloak & Lưu trữ Backend
// ==========================================

/** Wrapper nội bộ — không phải schema chính thức của SDK TideCloak */
export interface EncryptedPayload {
  provider: "tidecloak";
  formatVersion: 1;
  serialized: string; // tối đa 200.000 ký tự, không rỗng
}

export interface StoredBatch {
  id: string;         // UUID do server sinh
  supplierId: string; // claim "sub" từ token đã xác minh — không lấy từ JSON request
  createdAt: string;  // ISO 8601 UTC, do server tạo
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}

// ==========================================
// 10. Request / Response API
// ==========================================

export interface CreateBatchRequest {
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}

export interface CreateBatchResponse {
  id: string;
  createdAt: string;
}

export interface PublicBatch {
  id: string;
  createdAt: string;
  publicSummary: PublicSummary;
}

export interface ListPublicBatchesResponse {
  items: PublicBatch[];
}

// ==========================================
// 11. Lỗi API và lớp lỗi chuẩn hóa
// ==========================================

export interface ApiError {
  error: {
    code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "CONFLICT"
      | "PAYLOAD_TOO_LARGE"
      | "INTERNAL_ERROR";
    message: string;
    fields?: FieldError[];
  };
}

export type ContractErrorCode =
  | ApiError["error"]["code"]
  | "ACCESS_DENIED"
  | "CRYPTO_FAILED"
  | "NETWORK_ERROR";

/** Lỗi chuẩn hóa dùng trong API client và crypto adapter */
export class ContractError extends Error {
  status: number | null; // null cho lỗi validation/local/network
  code: ContractErrorCode;
  fields?: FieldError[];

  constructor(opts: {
    message: string;
    code: ContractErrorCode;
    status: number | null;
    fields?: FieldError[];
  }) {
    super(opts.message);
    this.name = "ContractError";
    this.status = opts.status;
    this.code = opts.code;
    this.fields = opts.fields;
  }
}

// ==========================================
// 12. Giao diện API (dùng để mock và implement)
// ==========================================

export interface BatchApi {
  submitBatch(request: CreateBatchRequest): Promise<CreateBatchResponse>;
  getPublicBatches(): Promise<ListPublicBatchesResponse>;
  getEncryptedBatch(id: string): Promise<EncryptedPayload>;
}

// ==========================================
// 13. Auth và Crypto Adapter
// ==========================================

export interface AuthSession {
  subject: string;   // claim "sub" từ token
  roles: AppRole[];
}

export interface AuthAdapter {
  getSession(): Promise<AuthSession | null>;
  login(): Promise<void>;
  logout(): Promise<void>;
}

export interface BatchCrypto {
  encryptBatch(payload: PrivateBatchPayload): Promise<EncryptedPayload>;
  decryptBatch(payload: EncryptedPayload): Promise<PrivateBatchPayload>;
}
