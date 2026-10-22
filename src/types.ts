/**
 * @file src/types.ts
 * @description Hợp đồng kiểu dữ liệu dùng chung (Single Source of Truth) — Unified Contract v1.
 * Hợp nhất đầy đủ các định nghĩa từ tất cả thành viên (Member 1, 2, 3, 4).
 */

// ==========================================
// 1. Phân loại cố định (v1 MVP)
// ==========================================

export type MaterialType = "demo-material-A";
export type AssuranceLevel = "supplier-reported";
export type AppRole = "supplier" | "buyer";
export type DemoRole = "supplier" | "buyer" | "admin";
export type Actor = { id: string; name: string; role: DemoRole };

// ==========================================
// 2. Dữ liệu Form Supplier
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
  evidence?: string;
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
  inboundTransportTonKm: number; // hữu hạn, 0 – 1.000.000.000
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
    materialKgCO2e?: number;
    transportKgCO2e: number;
    inboundTransportKgCO2e?: number;
    wasteKgCO2e: number;
  };
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
}

// ==========================================
// 5. Bằng chứng
// ==========================================

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
  evidence?: EvidenceInput | null;
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
  path: string;
  code: ValidationErrorCode | string;
  message: string;
}

export type ValidationErrorItem = FieldError;

export type ValidationResult<T> =
  | { ok: true; value: T; errors?: never }
  | { ok: false; errors: FieldError[]; value?: never };

// ==========================================
// 8. Phần công bố cho Buyer (Public Summary)
// ==========================================

export interface PublicSummary {
  batchId: string;
  productName: string;
  totalKgCO2e: number;
  perProductKgCO2e: number;
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
  assuranceLevel: AssuranceLevel;
}

// ==========================================
// 9. Bản mã TideCloak & Lưu trữ Backend
// ==========================================

export interface EncryptedPayload {
  provider: "tidecloak" | "demo-aes-gcm";
  formatVersion: 1;
  serialized: string;
}

export interface StoredBatch {
  id: string;
  supplierId: string;
  createdAt: string;
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

export class ContractError extends Error {
  status: number | null;
  code: ContractErrorCode;
  fields?: FieldError[];

  constructor(
    optsOrMessageOrCode:
      | ContractErrorCode
      | string
      | {
          message: string;
          code: ContractErrorCode;
          status: number | null;
          fields?: FieldError[];
        },
    codeOrStatus: ContractErrorCode | number | null = null,
    statusOrMessage: number | null | string = null,
    fields?: FieldError[]
  ) {
    if (typeof optsOrMessageOrCode === "object") {
      super(optsOrMessageOrCode.message);
      this.status = optsOrMessageOrCode.status;
      this.code = optsOrMessageOrCode.code;
      this.fields = optsOrMessageOrCode.fields;
    } else if (typeof codeOrStatus === "string") {
      // Called like (message, code, status)
      super(optsOrMessageOrCode);
      this.code = codeOrStatus as ContractErrorCode;
      this.status = typeof statusOrMessage === "number" || statusOrMessage === null ? statusOrMessage : null;
      this.fields = fields;
    } else {
      // Called like (code, status, message)
      super(typeof statusOrMessage === "string" ? statusOrMessage : String(optsOrMessageOrCode));
      this.code = optsOrMessageOrCode as ContractErrorCode;
      this.status = typeof codeOrStatus === "number" ? codeOrStatus : null;
      this.fields = fields;
    }
    this.name = "ContractError";
    Object.setPrototypeOf(this, ContractError.prototype);
  }
}

// ==========================================
// 12. Giao diện Bộ điều hợp (Adapters)
// ==========================================

export interface BatchApi {
  submitBatch(request: CreateBatchRequest): Promise<CreateBatchResponse>;
  getPublicBatches(): Promise<ListPublicBatchesResponse>;
  getEncryptedBatch(id: string): Promise<EncryptedPayload>;
}

export interface AuthSession {
  subject: string;
  roles: AppRole[];
}

export interface AuthAdapter {
  getSession?(): Promise<AuthSession | null>;
  login?(): Promise<void>;
  logout?(): Promise<void>;
  currentActor?(): Promise<Actor | null>;
}

export interface BatchCrypto {
  encryptBatch(
    payload: PrivateBatchPayload,
    tag?: TideCloakTag
  ): Promise<EncryptedPayload>;
  decryptBatch(
    payload: EncryptedPayload,
    tag?: TideCloakTag
  ): Promise<PrivateBatchPayload>;
  encrypt?(payload: PrivateBatchPayload): Promise<EncryptedPayload>;
  decrypt?(payload: EncryptedPayload): Promise<PrivateBatchPayload>;
}

// ==========================================
// 13. TideCloak SDK Constants (Mục 22 Đặc tả)
// ==========================================

export const TAG_SUPPLIER_INTERNAL = "_tide_supplier_internal" as const;
export const TAG_SCOPE3_VERIFIED = "_tide_scope3_verified" as const;

export type TideCloakTag =
  | typeof TAG_SUPPLIER_INTERNAL
  | typeof TAG_SCOPE3_VERIFIED
  | string;
